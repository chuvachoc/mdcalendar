var gulp = require('gulp'),
    uglify = require('gulp-uglify');

gulp.task('minify', function () {
    gulp.src('js/mdcalendar.js')
        .pipe(uglify())
        .pipe(gulp.dest('js'));
});