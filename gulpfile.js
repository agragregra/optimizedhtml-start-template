import pkg from 'gulp'
const { src, dest, parallel, series, watch } = pkg

import browserSync      from 'browser-sync'
import gulpSass         from 'gulp-sass'
import * as dartSass    from 'sass'
const  sassModule       = gulpSass(dartSass)
import postCss          from 'gulp-postcss'
import cssnano          from 'cssnano'
import concat           from 'gulp-concat'
import uglify           from 'gulp-uglify'
import rename           from 'gulp-rename'
import {deleteAsync}    from 'del'
import imageminMain     from 'imagemin'
import imageminMozjpeg  from 'imagemin-mozjpeg'
import imageminPngquant from 'imagemin-pngquant'
import imageminSvgo     from 'imagemin-svgo'
import path             from 'path'
import fs               from 'fs-extra'
import cache            from 'gulp-cache'
import autoprefixer     from 'autoprefixer'
import ftp              from 'vinyl-ftp'
import rsyncfn          from 'gulp-rsync'

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/',
    },
    ghostMode: { clicks: false },
    notify: false,
    online: true,
    // tunnel: 'yousutename', // Attempt to use the URL https://yousutename.loca.lt
  })
}

function js() {
  return src([
    'app/libs/jquery/dist/jquery.min.js',
    'app/js/common.js', // Всегда в конце
    ])
  .pipe(concat('scripts.min.js'))
  .pipe(uglify()) // Минимизировать весь js (на выбор)
  .pipe(dest('app/js'))
  .pipe(browserSync.stream())
}

function sass() {
  return src('app/sass/**/*.sass')
  .pipe(sassModule({
    'include css': true,
    silenceDeprecations: ['legacy-js-api', 'mixed-decls', 'color-functions', 'global-builtin', 'import'],
    loadPaths: ['./']
  })).on('error', function handleError() { this.emit('end') })
  .pipe(postCss([
    autoprefixer({ grid: 'autoplace' }),
    cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })
  ]))
  .pipe(rename({ suffix: '.min', prefix : '' }))
  .pipe(dest('app/css'))
  .pipe(browserSync.stream())
}

async function imagemin() {
  try {
    const files = await imageminMain([`app/img/**/*`], {
      plugins: [
        imageminMozjpeg({ quality: 90 }),
        imageminPngquant({ quality: [0.6, 0.8] }),
        imageminSvgo()
      ]
    })
    for (const v of files) {
      const relativePath = path.relative('app/img', v.sourcePath)
      const destPath = path.join('dist/img', relativePath)
      fs.ensureDirSync(path.dirname(destPath))
      fs.writeFileSync(destPath, v.data)
    }
    console.log('✅ Images optimized successfully.')
  } catch (err) {
    console.error('❌ Image Minification Error:', err.message || err)
  }
}

async function removedist() { await deleteAsync('dist/**/*', { force: true }) }
async function clearcache() { cache.clearAll() }

function buildcopy() {
  return src([
    'app/*.html',
    'app/.htaccess',
    '{app/js,app/css}/*.min.*',
    'app/fonts/**/*'
  ], { base: 'app/', encoding: false })
  .pipe(dest('dist'))
}

function deploy() {
  let conn = ftp.create({
    host:     'hostname.com',
    user:     'username',
    password: 'userpassword',
    parallel: 10
  });
  let globs = [
    'dist/**',
    // 'dist/.htaccess',
  ]
  return src(globs, { buffer: false, encoding: false })
  .pipe(conn.dest('/path/to/folder/on/server'))
}

function rsync() {
  return src('dist/')
    .pipe(rsyncfn({
      root: 'dist/',
      hostname: 'username@yousite.com',
      destination: 'yousite/public_html/',
      clean: true, // Mirror copy with file deletion
      // include: ['*.htaccess'], // Includes files to deploy
      exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
      recursive: true,
      archive: true,
      silent: false,
      compress: true
    }))
}

function startwatch() {
  watch(['app/sass/**/*.sass'], { usePolling: true }, sass)
  watch(['libs/**/*.js', 'app/js/common.js'], { usePolling: true }, js)
  watch(['app/*.html'], { usePolling: true }).on('change', browserSync.reload)
}

export { js, sass, imagemin, deploy, rsync, clearcache }
export let build = series(removedist, imagemin, js, sass, buildcopy)

export default series(js, sass, parallel(browsersync, startwatch))
