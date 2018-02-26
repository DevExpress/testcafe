var expect = require('chai').expect;
var path   = require('path');
var fs     = require('fs');
var Promise = require('pinkie');
var del    = require('del');
var pngjs  = require('pngjs');
var config = require('./config.js');


const SCREENSHOTS_PATH               = '___test-screenshots___';
const THUMBNAILS_DIR_NAME            = 'thumbnails';
const ERRORS_DIR_NAME                = 'errors';
const TASK_DIR_RE                    = /\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}/;
const SCREENSHOT_FILE_NAME_RE        = /\\\d+.png$/;
const CUSTOM_SCREENSHOT_FILE_NAME_RE = /\.png$/;
const TEST_DIR_NAME_RE               = /test-\d+/;
const RUN_DIR_NAME_RE                = /run-\d+/;
const GREEN_PIXEL                    = [0, 255, 0, 255];
const RED_PIXEL                      = [255, 0, 0, 255];


function hasPixel (png, pixel, x, y) {
    const baseIndex = (png.width * y + x) * 4;

    return png.data[baseIndex] === pixel[0] &&
           png.data[baseIndex + 1] === pixel[1] &&
           png.data[baseIndex + 2] === pixel[2] &&
           png.data[baseIndex + 3] === pixel[3];
}

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

function readPng (filePath) {
    return new Promise(function (resolve) {
        var png = new pngjs.PNG();

        png.once('parsed', function () {
            resolve(png);
        });

        fs.createReadStream(filePath).pipe(png);
    });
}

function checkScreenshotFileCropped (filePath) {
    return readPng(filePath)
        .then(function (png) {
            var width  = png.width;
            var height = png.height;

            // NOTE: sometimes an appearing dialog can cover an edge of the browser. Try to check all edges
            return hasPixel(png, RED_PIXEL, 0, 0) && hasPixel(png, RED_PIXEL, 49, 49) && hasPixel(png, GREEN_PIXEL, 50, 50) ||
                   hasPixel(png, RED_PIXEL, width - 1, height - 1) && hasPixel(png, RED_PIXEL, width - 50, height - 50) && hasPixel(png, GREEN_PIXEL, width - 51, height - 51) ||
                   hasPixel(png, RED_PIXEL, width - 1, 0) && hasPixel(png, RED_PIXEL, width - 50, 49) && hasPixel(png, GREEN_PIXEL, width - 51, 50) ||
                   hasPixel(png, RED_PIXEL, 0, height - 1) && hasPixel(png, RED_PIXEL, 49, height - 50) && hasPixel(png, GREEN_PIXEL, 50, height - 51);
        });
}

function checkScreenshotFileIsNotWhite (filePath) {
    return readPng(filePath)
        .then(function (png) {
            return png.data.indexOf(Buffer.from(RED_PIXEL)) > -1 && png.data.indexOf(Buffer.from(GREEN_PIXEL)) > -1;
        });
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

function checkScreenshotImages (forError, customPath, predicate) {
    const expectedScreenshotsCount = config.browsers.length;

    if (!isDirExists(SCREENSHOTS_PATH))
        return false;

    var taskDirs = fs.readdirSync(SCREENSHOTS_PATH);

    if (!taskDirs || !taskDirs[0] || taskDirs.length !== 1)
        return false;

    var taskDirPath = path.join(SCREENSHOTS_PATH, taskDirs[0]);
    var list        = [];

    if (forError) {
        var testDirs = fs.readdirSync(taskDirPath);

        if (!testDirs || !testDirs[0] || testDirs.length !== 1)
            return false;

        var testDirPath = path.join(taskDirPath, testDirs[0]);
        var browserDirs = fs.readdirSync(testDirPath);

        browserDirs.forEach(function (browserDir) {
            var errorDirPath    = path.join(testDirPath, browserDir, 'errors');
            var screenshotFiles = fs.readdirSync(errorDirPath);

            var screenshotPaths = screenshotFiles.map(function (screenshotFile) {
                return path.join(errorDirPath, screenshotFile);
            });

            list = list.concat(screenshotPaths);
        });
    }
    else {
        if (taskDirPath.indexOf(customPath) < 0)
            return false;

        list = fs.readdirSync(taskDirPath).map(function (screenshotFile) {
            return path.join(taskDirPath, screenshotFile);
        });
    }

    if (list.length < config.browsers.length)
        return false;

    list = list.filter(function (filePath) {
        return filePath.match(CUSTOM_SCREENSHOT_FILE_NAME_RE);
    });

    return Promise
        .all(list.map(function (filePath) {
            return predicate(filePath);
        }))
        .then(function (checkResults) {
            var actualScreenshotsCount = 0;

            for (var i = 0; i < checkResults.length; i++)
                actualScreenshotsCount += checkResults[i] ? 1 : 0;

            return actualScreenshotsCount === expectedScreenshotsCount;
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

exports.checkScreenshotsCreated = function checkScreenshotsCreated (forError, count, customPath, runDirCount) {
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

    if (!testDirs || !testDirs.length || testDirs.length !== 1)
        return false;

    var basePath  = null;
    var dirs      = null;
    var dirNameRE = null;
    var dirPath   = null;

    if (runDirCount) {
        basePath  = path.join(taskDirPath, testDirs[0]);
        dirs      = fs.readdirSync(basePath);
        dirNameRE = RUN_DIR_NAME_RE;

        if (!dirs || !dirs.length || dirs.length !== runDirCount)
            return false;
    }
    else {
        basePath  = taskDirPath;
        dirs      = testDirs;
        dirNameRE = TEST_DIR_NAME_RE;
    }

    return dirs.every(function (dir) {
        if (!dirNameRE.test(dir))
            return false;

        dirPath = path.join(basePath, dir);
        return checkTestDir(dirPath, forError, expectedSubDirCount, expectedScreenshotCount);
    });
};

exports.checkScreenshotsCropped = function (forError, customPath) {
    return checkScreenshotImages(forError, customPath, checkScreenshotFileCropped);
};

exports.checkScreenshotIsNotWhite = function (forError, customPath) {
    return checkScreenshotImages(forError, customPath, checkScreenshotFileIsNotWhite);
};

exports.isScreenshotsEqual = function (customPath, referenceImagePath) {
    return checkScreenshotImages(false, customPath, function (screenshotFilePath) {
        var screenshotContent     = fs.readFileSync(screenshotFilePath);
        var referenceImageContent = fs.readFileSync(referenceImagePath);

        return screenshotContent.equals(referenceImageContent);
    });
};

exports.removeScreenshotDir = function () {
    if (isDirExists(SCREENSHOTS_PATH))
        del(SCREENSHOTS_PATH);
};

