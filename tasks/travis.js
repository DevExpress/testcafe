var gulp = require('gulp');

console.log(process.env.GULP_TASK);

gulp.task('travis', [process.env.GULP_TASK || '']);
