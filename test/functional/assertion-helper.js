var expect = require('chai').expect;
var path   = require('path');
var fs     = require('fs');
var del    = require('del');
var config = require('./config.js');


const SCREENSHOTS_PATH = '___test-screenshots___';


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

function isDirExists (folderPath) {
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

exports.isScreenshotDirExists = function () {
    return isDirExists(SCREENSHOTS_PATH);
};

exports.checkScreenshotsCreated = function checkScreenshotsCreated (count, customPath) {
    var expectedBrowserDirCount = config.browsers.length;
    var expectedScreenshotCount = count || 2;

    if (!isDirExists(SCREENSHOTS_PATH))
        return false;

    var fixtureDirs    = fs.readdirSync(SCREENSHOTS_PATH);
    var fixtureDirPath = null;
    var browserDirs    = null;
    var hasScreenshots = true;

    if (fixtureDirs && fixtureDirs[0]) {
        fixtureDirPath = path.join(SCREENSHOTS_PATH, fixtureDirs[0]);

        browserDirs = fs
            .readdirSync(fixtureDirPath)
            .filter(function (file) {
                return isDirExists(path.join(fixtureDirPath, file));
            });

        hasScreenshots = browserDirs.every(function (dir) {
            return getScreenshotFilesCount(path.join(fixtureDirPath, dir)) === expectedScreenshotCount;
        });
    }

    var customDirExists = customPath ? fixtureDirPath.indexOf(customPath) !== -1 : true;

    return customDirExists && fixtureDirs.length === 1 && browserDirs.length === expectedBrowserDirCount &&
           hasScreenshots;
};

exports.removeScreenshotDir = function () {
    if (isDirExists(SCREENSHOTS_PATH))
        del(SCREENSHOTS_PATH);
};

