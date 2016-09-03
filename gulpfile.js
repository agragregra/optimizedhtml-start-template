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
	notify		   = require('gulp-notify'),
	errorNotifier  = require('gulp-error-notifier');

/* Base settings */
var config = {
	preprocessor: 'scss',
	basePath: 'app',
	sourcePath: 'dist',
	bowerPath: this.basePath + '/libs',
	npmPath: 'node_modules'
};
/* End base settings */


gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: config.basePath
		},
		notify: false
	});
});

gulp.task('sass', ['header'], function () {
	return gulp.src(config.basePath + '/' + config.preprocessor + '/**/*.' + config.preprocessor)
		.pipe(errorNotifier())
		.pipe(sass({
			includePaths: bourbon.includePaths
		}).on('error', sass.logError))
		.pipe(rename({suffix: '.min', prefix: ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest(config.basePath + '/css'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('scss', ['header'], function () {
	return gulp.src(config.basePath + '/' + config.preprocessor + '/**/*.' + config.preprocessor)
		.pipe(errorNotifier())
		.pipe(sass({
			includePaths: bourbon.includePaths
		}).on('error', sass.logError))
		.pipe(rename({suffix: '.min', prefix: ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest(config.basePath + '/css'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('header', function () {
	return gulp.src(config.basePath + '/header/header.' + config.preprocessor)
		.pipe(errorNotifier())
		.pipe(sass({
			includePaths: bourbon.includePaths
		}).on('error', sass.logError))
		.pipe(rename({suffix: '.min', prefix: ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest(config.basePath + '/header'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('libs', function () {
	return gulp.src([
		config.npmPath + '/jquery/dist/jquery.min.js',
		config.npmPath + '/bootstrap-sass/assets/javascripts/bootstrap.min.js',
	])
		.pipe(errorNotifier())
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest(config.basePath + '/js'));
});

gulp.task('watch', [config.preprocessor, 'libs', 'browser-sync'], function () {
	gulp.watch(config.basePath + '/header/header.' + config.preprocessor, ['header']);
	gulp.watch(config.basePath + '/' + config.preprocessor + '/**/*.' + config.preprocessor, [config.preprocessor]);
	gulp.watch(config.basePath + '/*.html', browserSync.reload);
	gulp.watch(config.basePath + '/js/**/*.js', browserSync.reload);
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
		.pipe(gulp.dest(config.sourcePath + '/img'));
});

gulp.task('buildhtml', function() {
	gulp.src(['app/*.html'])
		.pipe(errorNotifier())
		.pipe(fileinclude({
			prefix: '@@'
		}))
		.pipe(gulpRemoveHtml())
		.pipe(gulp.dest(config.sourcePath));
});

gulp.task('removedist', function() { return del.sync(config.sourcePath); });

gulp.task('build', ['removedist', 'buildhtml', 'imagemin', config.preprocessor, 'libs'], function() {
	var buildCss = gulp.src([
		'app/css/fonts.min.css',
		'app/css/main.min.css'
	]).pipe(gulp.dest(config.sourcePath + '/css'));

	var buildFiles = gulp.src([
		'app/.htaccess'
	]).pipe(gulp.dest(config.sourcePath));

	var buildFonts = gulp.src(config.basePath + '/fonts/**/*').pipe(gulp.dest(config.sourcePath + '/fonts'));

	var buildJs = gulp.src(config.basePath + '/js/**/*').pipe(gulp.dest(config.sourcePath + '/js'));
});

gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);