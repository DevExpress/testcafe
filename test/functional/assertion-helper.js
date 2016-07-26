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
    var browserCount            = config.browsers.length;
    var expectedSubDirCount     = customPath ? 1 : browserCount;
    var expectedScreenshotCount = count || 2;

    if (!isDirExists(SCREENSHOTS_PATH))
        return false;

    var fixtureDirs = fs.readdirSync(SCREENSHOTS_PATH);

    if (!fixtureDirs || !fixtureDirs[0])
        return false;

    var fixtureDirPath = path.join(SCREENSHOTS_PATH, fixtureDirs[0]);
    var subDirs        = fs
        .readdirSync(fixtureDirPath)
        .filter(function (file) {
            return isDirExists(path.join(fixtureDirPath, file));
        });

    var customDirExists = customPath ? fixtureDirPath.indexOf(customPath) !== -1 : true;
    var hasScreenshots  = true;

    if (customPath)
        hasScreenshots = getScreenshotFilesCount(fixtureDirPath) === expectedScreenshotCount * browserCount;
    else {
        hasScreenshots = subDirs.every(function (dir) {
            return getScreenshotFilesCount(path.join(fixtureDirPath, dir)) === expectedScreenshotCount;
        });
    }

    return customDirExists && fixtureDirs.length === 1 && subDirs.length === expectedSubDirCount && hasScreenshots;
};

exports.removeScreenshotDir = function () {
    if (isDirExists(SCREENSHOTS_PATH))
        del(SCREENSHOTS_PATH);
};

