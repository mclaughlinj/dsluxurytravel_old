var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var path = require('path');
var handlebars = require('gulp-handlebars');
var defineModule = require('gulp-define-module');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var insert = require('gulp-insert');
var concat = require('gulp-concat');
var forever = require('forever');

gulp.task('lint', function () {
  gulp.src('./**/*.js')
    .pipe(jshint());
});

gulp.task('sass', function () {
    gulp.src('./client/css/scss/*.scss')
        .pipe(sass({errLogToConsole: true}))
        .pipe(gulp.dest('./client/css'));
});

gulp.task('templates', function(){
  gulp.src(['./views/partials/*.hbs'])
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    .pipe(declare({
      root: 'exports',
      noRedeclare: true,
      processName: function(filePath) {
        return declare.processNameByPath(filePath.replace('templates/', ''));
      }
    }))
    .pipe(concat('templates.js'))
    .pipe(wrap('var Handlebars = require("handlebars");\n <%= contents %>'))
    .pipe(gulp.dest('build/'));
});

gulp.task('develop', ['templates'], function () {
  nodemon({ script: './bin/www', ext: 'html js', ignore: ['ignored.js'] })
    .on('change', ['lint'])
    .on('restart', function () {
      console.log('restarted!')
    })
    .on('readable', function() { // the `readable` event indicates that data is ready to pick up
      this.stdout.pipe(fs.createWriteStream('output.txt'));
      this.stderr.pipe(fs.createWriteStream('err.txt'));
    })
  gulp.watch('./client/css/scss/*.scss', ['sass']);
});

gulp.task('golive', function () {
  var foreverOptions = {
  };
  forever.start ('app.js',foreverOptions)
});

gulp.task('default', ['sass', 'templates', 'develop']);
gulp.task('start', ['sass', 'templates', 'golive']);
