var gulp = require('gulp');

gulp.task('images', ['clean'], imagesTask);

function imagesTask () {
    return gulp
        .src([
            'src/**/*.png',
            'src/**/*.ico',
            'src/**/*.svg'
        ])
        .pipe(gulp.dest('lib'));
}
