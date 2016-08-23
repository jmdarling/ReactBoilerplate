'use strict'

var babelify = require('babelify')
var browserify = require('browserify')
var buffer = require('vinyl-buffer')
var connect = require('gulp-connect')
var gulp = require('gulp')
var open = require('gulp-open')
var source = require('vinyl-source-stream')
var sourcemaps = require('gulp-sourcemaps')
var watchify = require('watchify')

function buildScripts (watch) {
  var bundler = watchify(browserify('./src/app.js', { debug: true }).transform(babelify.configure({
    presets: [
      'es2015',
      'react'
    ]
  })))

  function bundle () {
    bundler.bundle()
      .on('error', function (err) {
        console.error(err)
        this.emit('end')
      })
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./bin'))
    connect.reload()
  }

  if (watch === true) {
    bundler.on('update', function () {
      console.log('-> rebundling...')
      bundle()
    })
  }

  bundle()
}

function watchScripts () {
  return buildScripts(true)
}

function buildMarkup () {
  return gulp.src('./src/*.html')
    .pipe(gulp.dest('./bin'))
    .pipe(connect.reload())
}

function watchMarkup () {
  return gulp.watch('./src/*.html', ['buildMarkup'])
}

function webServer () {
  connect.server({
    devBaseUrl: 'http://localhost',
    port: 8080,
    root: './bin'
  })
}

function openApp () {
  return gulp.src('./bin/index.html')
    .pipe(open({ uri: 'http://localhost:8080' }))
}

gulp.task('buildJs', buildScripts)
gulp.task('watchJs', watchScripts)
gulp.task('buildMarkup', buildMarkup)
gulp.task('watchMarkup', watchMarkup)
gulp.task('webServer', webServer)
gulp.task('openApp', openApp)

gulp.task('build', ['buildJs', 'buildMarkup'])
gulp.task('watch', ['watchJs', 'watchMarkup'])
gulp.task('serve', ['webServer', 'openApp'])

gulp.task('default', ['build', 'watch', 'serve'])
