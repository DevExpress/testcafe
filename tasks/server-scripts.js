var gulp = require('gulp');
var gulpBabel = require('gulp-babel');

gulp.task('server-scripts', ['clean'], serverScriptsTask);

function serverScriptsTask () {
    return gulp
        .src([
            'src/**/*.js',
            '!src/client/**/*.js'
        ])
        .pipe(gulpBabel())
        .pipe(gulp.dest('lib'));
}
