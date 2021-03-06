var path = require('path')
var gulp = require('gulp')
var standard = require('gulp-standard')
var excludeGitignore = require('gulp-exclude-gitignore')
var mocha = require('gulp-mocha')
var istanbul = require('gulp-istanbul')
var nsp = require('gulp-nsp')
var plumber = require('gulp-plumber')
var coveralls = require('gulp-coveralls')
var isparta = require('isparta')

// Initialize the babel transpiler so ES2015 files gets compiled
// when they're loaded
// require('babel-core/register')

gulp.task('static', function () {
  return gulp.src('**/*.js')
    .pipe(excludeGitignore())
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: false,
      breakOnWarning: false
    }))
})

gulp.task('nsp', function (cb) {
  nsp('package.json', cb)
})

gulp.task('pre-test', function () {
  return gulp.src('lib/**/*.js')
    .pipe(istanbul({
      includeUntested: true,
      instrumenter: isparta.Instrumenter
    }))
    .pipe(istanbul.hookRequire())
})

gulp.task('test', ['pre-test'], function (cb) {
  var mochaErr

  gulp.src('test/**/*.js')
    .pipe(plumber())
    .pipe(mocha({reporter: 'spec'}))
    .on('error', function (err) {
      mochaErr = err
    })
    .pipe(istanbul.writeReports())
    .on('end', function () {
      cb(mochaErr)
    })
})

gulp.task('coveralls', ['test'], function () {
  if (!process.env.CI) {
    return
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls())
})

// gulp.task('babel', function () {
//   return gulp.src('lib/**/*.js')
//     .pipe(babel())
//     .pipe(gulp.dest('dist'))
// })

gulp.task('prepublish', ['static', 'test', 'coveralls']) // 'nsp'
gulp.task('default', ['static', 'test', 'coveralls'])
