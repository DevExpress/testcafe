const gulp         = require('gulp');
const globby       = require('globby');
const path         = require('path');
const { Readable } = require('stream');


module.exports = async function createPackageFilesForTests () {
    const testFolders = await globby([
        'test/functional/fixtures/**/testcafe-fixtures',
        'test/functional/fixtures/**/common',
    ], {
        ignore:          ['test/functional/fixtures/**/raw', 'test/functional/fixtures/**/json'],
        onlyDirectories: true,
    });

    let stream = new Readable();

    stream.push('{ "type": "module" }');
    stream.push(null);

    testFolders.forEach(testFolder => {
        stream = gulp.src(['gulp/esm-package/package.json'])
            .pipe(gulp.dest( path.resolve(testFolder) ));
    });

    return stream;
};
