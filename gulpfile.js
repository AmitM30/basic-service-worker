/**
 * Copyright 2017 Amit M. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var through = require('through2');
var browserSync = require('browser-sync');
var watchify = require('watchify');
var browserify = require('browserify');
var uglifyify = require('uglifyify');
var mergeStream = require('merge-stream');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var hbsfy = require('hbsfy');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var del = require('del');

var reload = browserSync.reload;
var random = Math.random().toString(36).substr(2, 7);

gulp.task('clean', function (done) {
  del(['dist'], done);
});

gulp.task('browser-sync', function() {
  browserSync({
    notify: false,
    port: 8000,
    server: "dist",
    open: false
  });
});

gulp.task('html', function () {
  return gulp.src([
    'src/index.html'
  ])
  .pipe(plugins.swig({ defaults: { cache: false } }))
  .pipe(plugins.htmlmin({
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true
  }))
  .pipe(gulp.dest('dist'))
  .pipe(reload({ stream: true }));
});

gulp.task('css', function () {
  return gulp.src('./src/styles/*.scss')
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.sass({ outputStyle: 'compressed' }))
    .pipe(plugins.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(plugins.filter('**/*.css'))
    .pipe(reload({stream: true}));
});

gulp.task('misc', function () {
  return gulp.src([
    // Copy all files
    'src/**',
    // Exclude the following files
    // (other tasks will handle the copying of these files)
    '!src/*.html',
    '!src/{css,css/**,styles,styles/**}',
    '!src/{js,js/**}',
    '!src/{js,js/**}',
    '!src/sw.js'
  ]).pipe(gulp.dest('dist'));
});

function createBundler(src) {
  var b;

  if (plugins.util.env.production) {
    b = browserify();
  }
  else {
    b = browserify({
      cache: {}, packageCache: {}, fullPaths: true,
      debug: true
    });
  }

  b.transform(hbsfy);

  if (plugins.util.env.production) {
    b.transform({
      global: true
    }, 'uglifyify');
  }

  b.add(src);
  return b;
}

var bundlers = {
  'js/page.js': createBundler('./src/js/page/index.js'),
  'sw.js': createBundler('./src/js/sw/index.js')
};

function bundle(bundler, outputPath) {
  var splitPath = outputPath.split('/');
  var outputFile = splitPath[splitPath.length - 1];
  var outputDir = splitPath.slice(0, -1).join('/');

  return bundler.bundle()
    // log errors if they happen
    .on('error', plugins.util.log.bind(plugins.util, 'Browserify Error'))
    .pipe(source(outputFile))
    .pipe(buffer())
    .pipe(plugins.sourcemaps.init({ loadMaps: true })) // loads map from browserify file
    .pipe(plugins.sourcemaps.write('./')) // writes .map file
    .pipe(plugins.size({ gzip: true, title: outputFile }))
    .pipe(gulp.dest('dist/' + outputDir))
    .pipe(reload({ stream: true }));
}

// copies images to the output directory
gulp.task('build-scripts', function () {
  return gulp.src(['./src/js/**/*.js'])
    .pipe(concat('app.bundle.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/'));
});

// copies images to the output directory
gulp.task('build-fonts', function () {
  return gulp.src(['./src/fonts/**/*.*'])
    .pipe(gulp.dest('dist/fonts/'));
});

// copies images to the output directory
gulp.task('build-images', function () {
  return gulp.src(['./src/images/**/*.*'])
    .pipe(gulp.dest('dist/images/'));
});

// copies external referenced files to the output directory
gulp.task('export-service-worker', function () {
  return gulp.src(['./src/sw.js'])
    .pipe(replace('-v1', '-v1-' + random))
    .pipe(uglify())
    .pipe(gulp.dest('dist/'));
});

// gulp.task('js', function () {
//   return mergeStream.apply(null,
//     Object.keys(bundlers).map(function(key) {
//       return bundle(bundlers[key], key);
//     })
//   );
// });

gulp.task('watch', ['build'], function () {
  gulp.watch(['src/*.html'], ['html']);
  gulp.watch(['src/**/*.scss'], ['css']);
  gulp.watch(['src/images/**/*.*'], ['build-images']);
});

gulp.task('build', function() {
  return runSequence('clean', ['css', 'misc', 'html', 'build-scripts', 'build-fonts'], 'export-service-worker');
});

gulp.task('serve', ['browser-sync', 'watch']);
gulp.task('default', ['build']);