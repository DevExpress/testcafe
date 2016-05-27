var expect = require('chai').expect;
var path   = require('path');
var fs     = require('fs');
var del    = require('del');

function getScreenshotFilesCount (dir) {
    var results          = 0;
    var list             = fs.readdirSync(dir);
    var screenshotRegExp = new RegExp('\\.png$');
    var stat             = null;

    list.forEach(function (file) {
        file = dir + '/' + file;
        stat = fs.statSync(file);

        if (stat && stat.isDirectory())
            results += getScreenshotFilesCount(file);
        else if (screenshotRegExp.test(file))
            results++;
    });
    return results;
}

function isFolderExists (folderPath) {
    var exists = false;

    try {
        exists = fs.statSync(folderPath).isDirectory();
    }
    catch (e) {
        exists = false;
    }

    return exists;
}

exports.errorInEachBrowserContains = function errorInEachBrowserContains (testErrors, message, errorIndex) {
    if (testErrors instanceof Error)
        throw testErrors;

    // NOTE: if errors are the same in different browsers
    if (Array.isArray(testErrors))
        expect(testErrors[errorIndex]).contains(message);

    //NOTE: if they are different
    else {
        Object.keys(testErrors).forEach(function (key) {
            expect(testErrors[key][errorIndex]).contains(message);
        });
    }
};

exports.errorInEachBrowserNotContains = function errorInEachBrowserNotContains (testErrors, message, errorIndex) {
    if (testErrors instanceof Error)
        throw testErrors;

    // NOTE: if errors are the same in different browsers
    if (Array.isArray(testErrors))
        expect(testErrors[errorIndex]).not.contains(message);

    //NOTE: if the are different
    else {
        Object.keys(testErrors).forEach(function (key) {
            expect(testErrors[key][errorIndex]).not.contains(message);
        });
    }
};

exports.checkScreenshotsCreated = function checkScreenshotsCreated (withoutScreenshot, count) {
<<<<<<< HEAD
<<<<<<< 1c90f95a121f2fda659a8449048ad28b21020f96
<<<<<<< e8cb9c35813fdf7814793df0504da89b0e0966ab
    var screenshotsPath        = '___test-screenshots___';
=======
    var screenshotsPath        = './test/functional/fixtures/screenshots';
>>>>>>> TakeScreenshot, TakeScreenshotOnFail commands (part of #441, part of #240) (#552)
=======
    var screenshotsPath        = '___test-screenshots___';
>>>>>>> fix problems after merge TakeScreenshotCommand PR (#558)
=======
    var screenshotsPath        = '___test-screenshots___';
>>>>>>> 9089b3f8cf2f815abd863913636403286f43aac2
    var expectedCount          = count || 2;
    var screenshotFolderExists = isFolderExists(screenshotsPath);

    if (!screenshotFolderExists)
        return !!withoutScreenshot;

    var fixtureDirs    = fs.readdirSync(screenshotsPath);
    var fixtureDirPath = null;
    var workerDirs     = null;
    var hasScreenshots = true;

    if (fixtureDirs && fixtureDirs[0]) {
        fixtureDirPath = path.join(screenshotsPath, fixtureDirs[0]);
        workerDirs     = fs
            .readdirSync(fixtureDirPath)
            .filter(function (file) {
                return isFolderExists(path.join(fixtureDirPath, file));
            });

        hasScreenshots = workerDirs.every(function (dir) {
            return getScreenshotFilesCount(path.join(fixtureDirPath, dir)) === expectedCount;
        });
    }

    return del(screenshotsPath)
        .then(function () {
            return screenshotFolderExists && fixtureDirs.length === 1 && workerDirs.length === 3 && hasScreenshots;
        });
};

