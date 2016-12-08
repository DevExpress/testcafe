var gulp = require('gulp');
var rename = require('gulp-rename');
var prompt = require('gulp-prompt');
var ghpages = require('gulp-gh-pages');

gulp.task('publish-website', ['build-website-production'], publishWebsiteTask);

function publishWebsiteTask () {
    // NOTE: it's accidentally stopped being compatible with node 0.10 without
    // major version bump due to https://github.com/floridoo/gulp-sourcemaps/issues/236,
    // so we require it here.

    return gulp
        .src('site/deploy/**/*')
        .pipe(rename(function (filePath) {
            filePath.dirname = filePath.dirname.toLowerCase();

            return filePath;
        }))
        .pipe(prompt.confirm({
            message: 'Are you sure you want to publish the website?',
            default: false
        }))
        .pipe(ghpages());
}
