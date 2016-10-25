var gulp = require('gulp');
var globby = require('globby');
var markdownlint = require('markdownlint');
var Promise = require('pinkie');

gulp.task('lint-docs', lintDocsTask);

function lintDocsTask () {
    var lintDocsAndExamples = globby([
        'docs/articles/**/*.md',
        'examples/**/*.md',
        'CHANGELOG.md'
    ]).then(function (files) {
        return lintFiles(files, require('../.markdownlint.json'));
    });

    var lintReadme = lintFiles('README.md', require('../.markdownlint-readme.json'));

    return Promise.all([lintDocsAndExamples, lintReadme]);
}

function lintFiles (files, config) {
    return new Promise(function (resolve, reject) {
        markdownlint({ files: files, config: config }, function (err, result) {
            var lintErr = err || result && result.toString();

            if (lintErr)
                reject(lintErr);
            else
                resolve();
        });
    });
}
