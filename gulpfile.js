var gulp = require('gulp');
var webserver = require('gulp-webserver');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');



gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(webserver({
      host: '127.0.0.1',
      livereload: true
    })
   );
});

gulp.task('browserify', function() {
  browserify('./index.js', { debug: true })
    .transform(babelify, {presets: ["react"]})
    .bundle()
    .on("error", function (err) { console.log("Error : " + err.message); })
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./'))
});

gulp.task('watch', function() {
  gulp.watch('./index.js', ['browserify'])
});

gulp.task('default', ['webserver', 'browserify', 'watch']);
