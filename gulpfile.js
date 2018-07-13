// List Tasks:

// serve (serve dev and watch files)

// Include gulp
const gulp = require('gulp');

// Include Our Plugins
const browserSync = require('browser-sync');
const responsive = require('gulp-responsive');
const uglify = require('gulp-uglify-es').default;
const csso = require('gulp-csso');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');
const jshint = require('gulp-jshint');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');

// File where the favicon markups are stored
const reload = browserSync.reload;

// watch files for changes and reload
gulp.task('serve', () => {
  browserSync({
    port: 8000,
    injectChanges: true,
    server: {
      baseDir: './app'
    }
  });
  gulp.watch('./app/*.html').on('change', reload);
  gulp.watch('./app/assets/js/**/*.js').on('change', reload);
  gulp.watch('./app/assets/scss/**/*.scss', ['minify-css']).on('change', reload);
});

// copy files to dist folder and start serve dist
gulp.task('serve:dist', () => {
  browserSync({
    port: 8000,
    server:{
      baseDir:'./dist/'
    }
  });
  //copy data folder to dist folder
  gulp.src(['./app/assets/data/**/*']).pipe(gulp.dest('./dist/assets/data/'));
  //copy images
  // gulp.src(['./app/assets/img/*']).pipe(gulp.dest('./dist/assets/img'));
  //copy html
  // gulp.src(['./app/index.html', '.app/restaurant.html']).pipe(gulp.dest('./dist/'));
  //copy manifest.json
  gulp.src(['./app/manifest.json']).pipe(gulp.dest('./dist/'));
  //copy icons manifest
  gulp.src(['./app/assets/icons/*']).pipe(gulp.dest('./dist/assets/icons/'));
});
//  Minify-js
gulp.task('minify-js', () => {
  gulp.src('./app/assets/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/assets/js/'));
});
gulp.task('minify-SWjs', () => {
  gulp.src('./*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'));
});

// minify-scss & Autoprefixer
gulp.task('minify-css', () => {
  gulp.src('./app/assets/scss/*.scss')
    .pipe(reload({stream: true}))
    .pipe(sass({
      outputStyle: 'compressed',
      precision: 10,
      includePaths:['.'],
      onError: console.error.bind(console, 'Sass error: ')
    }))
    .pipe(
      autoprefixer({
        browsers: ["last 2 versions"],
        cascade: false
      })
    )
    .pipe(gulp.dest('./app/assets/css/'))
    .pipe(csso())
    .pipe(gulp.dest('./dist/assets/css/'));
});

// minify-html
gulp.task('minify-html', () => {
  gulp.src('./app/*.html')
    .pipe(htmlmin({ 
      collapseWhitespace: true,
      removeComments: true
   }))
    .pipe(gulp.dest('./dist/'));
});

// generate responsive jpg files
gulp.task('images', () => {
  gulp.src('./app/assets/img/*.jpg')
    .pipe(responsive({
      // Resize all JPG images to three different sizes: 300, 400, and 600 pixels
      '*.jpg': [{
        width: 300,
        rename: { suffix: '-s' }
      }, {
        width: 300 * 2,
        rename: { suffix: '-s@2x' }
      }, {
        width: 400,
        rename: { suffix: '-m' }
      }, {
        width: 400 * 2,
        rename: { suffix: '-m@2x' }
      }, {
        width: 600,
        rename: { suffix: '-l' }
      }, {
        // Compress, strip metadata, and rename original image
        rename: { suffix: '-xl' }
      }],
      // '*.png': {
      //   width: '100%'
      // },
      '*': {
        width: '100%'
      }
    }, 
    {
      // Global configuration for all images
      errorOnEnlargement: false,
      // The output quality for JPEG, WebP and TIFF output formats
      quality: 60,
      compressionLevel: 9,
      // Use progressive (interlace) scan for JPEG and PNG output
      progressive: true,
      // Strip all metadata
      withMetadata: false,
      max: true
    }))
    .pipe(gulp.dest('./dist/assets/img'));
});

gulp.task('minify-files',   ['minify-js', 'minify-SWjs',  'minify-css', 'minify-html','images']);