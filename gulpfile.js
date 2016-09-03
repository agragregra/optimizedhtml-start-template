'use strict';

const gulp         = require('gulp'),
	gutil          = require('gulp-util' ),
	sass           = require('gulp-sass'),
	browserSync    = require('browser-sync'),
	concat         = require('gulp-concat'),
	uglify         = require('gulp-uglify'),
	cleanCSS       = require('gulp-clean-css'),
	rename         = require('gulp-rename'),
	del            = require('del'),
	imagemin       = require('gulp-imagemin'),
	pngquant       = require('imagemin-pngquant'),
	cache          = require('gulp-cache'),
	autoprefixer   = require('gulp-autoprefixer'),
	fileinclude    = require('gulp-file-include'),
	gulpRemoveHtml = require('gulp-remove-html'),
	bourbon        = require('node-bourbon'),
	ftp            = require('vinyl-ftp'),
	errorNotifier  = require('gulp-error-notifier');

/* Base settings */
const basePath     = 'app';
const sourcePath   = 'dist';
const preprocessor = 'sass';
/* End base settings */

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: basePath
		},
		notify: false
	});
});

gulp.task('sass', ['header'], function () {
	return gulp.src(basePath + '/' + preprocessor + '/**/*.' + preprocessor)
		.pipe(errorNotifier())
		.pipe(sass({
			includePaths: bourbon.includePaths
		}).on('error', sass.logError))
		.pipe(rename({suffix: '.min', prefix: ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest(basePath + '/css'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('scss', ['header'], function () {
	return gulp.src(basePath + '/' + preprocessor + '/**/*.' + preprocessor)
		.pipe(errorNotifier())
		.pipe(sass({
			includePaths: bourbon.includePaths
		}).on('error', sass.logError))
		.pipe(rename({suffix: '.min', prefix: ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest(basePath + '/css'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('header', function () {
	return gulp.src(basePath + '/header/header.' + preprocessor)
		.pipe(errorNotifier())
		.pipe(sass({
			includePaths: bourbon.includePaths
		}).on('error', sass.logError))
		.pipe(rename({suffix: '.min', prefix: ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest(basePath + '/header'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('libs', function () {
	return gulp.src([
		basePath + '/libs/jquery/dist/jquery.min.js',
		// basePath + '/libs/magnific-popup/magnific-popup.min.js'
	])
		.pipe(errorNotifier())
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(basePath + '/js'));
});

gulp.task('watch', [preprocessor, 'libs', 'browser-sync'], function () {
	gulp.watch(basePath + '/header/header.' + preprocessor, ['header']);
	gulp.watch(basePath + '/' + preprocessor + '/**/*.' + preprocessor, [preprocessor]);
	gulp.watch(basePath + '/*.html', browserSync.reload);
	gulp.watch(basePath + '/js/**/*.js', browserSync.reload);
});

gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
		.pipe(errorNotifier())
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest(sourcePath + '/img'));
});

gulp.task('buildhtml', function() {
  gulp.src(['app/*.html'])
  	.pipe(errorNotifier())
	.pipe(fileinclude({
	  prefix: '@@'
	}))
	.pipe(gulpRemoveHtml())
	  .pipe(gulp.dest(sourcePath));
});

gulp.task('removedist', function() { return del.sync(sourcePath); });

gulp.task('build', ['removedist', 'buildhtml', 'imagemin', preprocessor, 'libs'], function() {
	var buildCss = gulp.src([
		'app/css/fonts.min.css',
		'app/css/main.min.css'
		]).pipe(gulp.dest(sourcePath + '/css'));

	var buildFiles = gulp.src([
		'app/.htaccess'
	]).pipe(gulp.dest(sourcePath));

	var buildFonts = gulp.src(basePath + '/fonts/**/*').pipe(gulp.dest(sourcePath + '/fonts'));

	var buildJs = gulp.src(basePath + '/js/**/*').pipe(gulp.dest(sourcePath + '/js'));
});

gulp.task('deploy', function() {
	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));
});

gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
