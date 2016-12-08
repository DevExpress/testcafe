var gulp = require('gulp');
var git = require('gulp-git');

gulp.task('fetch-assets-repo', ['clean-website'], fetchAssetsRepoTask);

function fetchAssetsRepoTask (cb) {
    git.clone('https://github.com/DevExpress/testcafe-gh-page-assets.git', { args: 'site' }, cb);
}
