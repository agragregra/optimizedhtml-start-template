import pkg from 'gulp'
const { gulp, src, dest, parallel, series, watch } = pkg

import browserSync   from 'browser-sync'
import gulpSass      from 'gulp-sass'
import dartSass      from 'sass'
import postCss       from 'gulp-postcss'
import cssnano       from 'cssnano'
const  sassfn        = gulpSass(dartSass)
import concat        from 'gulp-concat'
import uglifyim      from 'gulp-uglify-es'
const  uglify        = uglifyim.default
import rename        from 'gulp-rename'
import {deleteAsync} from 'del'
import imageminfn    from 'gulp-imagemin'
import cache         from 'gulp-cache'
import autoprefixer  from 'autoprefixer'
import ftp           from 'vinyl-ftp'
import rsyncfn       from 'gulp-rsync'

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
	.pipe(sassfn())
	.pipe(postCss([
		autoprefixer({ grid: 'autoplace' }),
		cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })
	]))
	.pipe(rename({ suffix: '.min', prefix : '' }))
	.pipe(dest('app/css'))
	.pipe(browserSync.stream())
}

function imagemin() {
	return src(['app/img/**/*'])
		.pipe(imageminfn())
		.pipe(dest('dist/img/'))
}

async function removedist() { await deleteAsync('dist/**/*', { force: true }) }
async function clearcache() { cache.clearAll() }

function buildcopy() {
	return src([
		'app/*.html',
		'app/.htaccess',
		'{app/js,app/css}/*.min.*',
		'app/fonts/**/*'
	], { base: 'app/' })
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
	return src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'))
}

function rsync() {
	return src('dist/')
		.pipe(rsyncfn({
			root: 'dist/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// clean: true, // Mirror copy with file deletion
			include: [/* '*.htaccess' */], // Included files to deploy,
			exclude: [ '**/Thumbs.db', '**/*.DS_Store' ],
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
}

function startwatch() {
	watch('app/sass/**/*.sass', { usePolling: true }, sass)
	watch(['libs/**/*.js', 'app/js/common.js'], { usePolling: true }, js)
	watch(['app/*.html'], { usePolling: true }).on('change', browserSync.reload)
}

export { js, sass, imagemin, deploy, rsync, clearcache }
export let build = series(removedist, imagemin, js, sass, buildcopy)

export default series(js, sass, parallel(browsersync, startwatch))
