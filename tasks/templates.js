var gulp = require('gulp');

gulp.task('templates', ['clean'], templatesTask);

function templatesTask () {
    return gulp
        .src([
            'src/**/*.mustache',
            '!src/**/*.js.wrapper.mustache'
        ])
        .pipe(gulp.dest('lib'));
}
