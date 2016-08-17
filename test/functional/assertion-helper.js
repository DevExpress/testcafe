var expect = require('chai').expect;
var path   = require('path');
var fs     = require('fs');
var del    = require('del');
var config = require('./config.js');


const SCREENSHOTS_PATH               = '___test-screenshots___';
const THUMBNAILS_DIR_NAME            = 'thumbnails';
const ERRORS_DIR_NAME                = 'errors';
const TASK_DIR_RE                    = /\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}/;
const SCREENSHOT_FILE_NAME_RE        = /\\\d+.png$/;
const CUSTOM_SCREENSHOT_FILE_NAME_RE = /\.png$/;
const TEST_DIR_NAME_RE               = /test-\d+/;


function getScreenshotFilesCount (dir, customPath) {
    var results          = 0;
    var list             = fs.readdirSync(dir);
    var screenshotRegExp = customPath ? CUSTOM_SCREENSHOT_FILE_NAME_RE : SCREENSHOT_FILE_NAME_RE;
    var stat             = null;
    var filePath         = null;

    list.forEach(function (file) {
        filePath = dir + '\\' + file;
        stat     = fs.statSync(filePath);

        if (stat && stat.isDirectory() && file === THUMBNAILS_DIR_NAME)
            results += getScreenshotFilesCount(filePath, customPath);
        else if (screenshotRegExp.test(filePath))
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

function checkTestDir (testDirPath, forError, expectedSubDirCount, expectedScreenshotCount) {
    var subDirs = fs
        .readdirSync(testDirPath)
        .filter(function (file) {
            return isDirExists(path.join(testDirPath, file));
        });

    if (subDirs.length !== expectedSubDirCount)
        return false;

    var dirPath = null;

    return subDirs.every(function (dir) {
        dirPath = forError ? path.join(testDirPath, dir, ERRORS_DIR_NAME) : path.join(testDirPath, dir);

        return getScreenshotFilesCount(dirPath) === expectedScreenshotCount;
    });
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

exports.errorInEachBrowserContainsRegExp = function errorInEachBrowserContains (testErrors, messageRE, errorIndex) {
    if (testErrors instanceof Error)
        throw testErrors;

    // NOTE: if errors are the same in different browsers
    if (Array.isArray(testErrors))
        expect(messageRE.test(testErrors[errorIndex])).equals(true);

    //NOTE: if they are different
    else {
        Object.keys(testErrors).forEach(function (key) {
            expect(messageRE.test(testErrors[key][errorIndex])).equals(true);
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

exports.checkScreenshotsCreated = function checkScreenshotsCreated (forError, count, customPath, testDirCount) {
    var expectedSubDirCount     = config.browsers.length;
    var expectedScreenshotCount = count || 2;

    if (!isDirExists(SCREENSHOTS_PATH))
        return false;

    var taskDirs = fs.readdirSync(SCREENSHOTS_PATH);

    if (!taskDirs || !taskDirs[0] || taskDirs.length !== 1)
        return false;

    var taskDirPath = path.join(SCREENSHOTS_PATH, taskDirs[0]);

    if (customPath) {
        var customDirExists = taskDirPath.indexOf(customPath) !== -1;
        var hasScreenshots  = getScreenshotFilesCount(taskDirPath, customPath) ===
                              expectedScreenshotCount * expectedSubDirCount;

        return customDirExists && hasScreenshots;
    }

    if (!TASK_DIR_RE.test(taskDirs[0]))
        return false;

    var testDirs = fs.readdirSync(taskDirPath);

    testDirCount = testDirCount || 1;

    if (!testDirs || !testDirs.length || testDirs.length !== testDirCount)
        return false;

    var testDirPath = null;

    return testDirs.every(function (testDir) {
        if (!TEST_DIR_NAME_RE.test(testDir))
            return false;

        testDirPath = path.join(taskDirPath, testDir);
        return checkTestDir(testDirPath, forError, expectedSubDirCount, expectedScreenshotCount);
    });
};

exports.removeScreenshotDir = function () {
    if (isDirExists(SCREENSHOTS_PATH))
        del(SCREENSHOTS_PATH);
};

