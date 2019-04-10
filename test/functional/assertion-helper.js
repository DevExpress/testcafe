const expect          = require('chai').expect;
const globby          = require('globby');
const path            = require('path');
const fs              = require('fs');
const Promise         = require('pinkie');
const { isFunction }  = require('lodash');
const del             = require('del');
const config          = require('./config.js');
const { readPngFile } = require('../../lib/utils/promisified-functions');


const SCREENSHOTS_PATH               = config.testScreenshotsDir;
const THUMBNAILS_DIR_NAME            = 'thumbnails';
const ERRORS_DIR_NAME                = 'errors';
const TASK_DIR_RE                    = /\d{4,4}-\d{2,2}-\d{2,2}_\d{2,2}-\d{2,2}-\d{2,2}/;
const SCREENSHOT_FILE_NAME_RE        = /[\\/]\d+.png$/;
const CUSTOM_SCREENSHOT_FILE_NAME_RE = /\.png$/;
const TEST_DIR_NAME_RE               = /test-\d+/;
const RUN_DIR_NAME_RE                = /run-\d+/;
const GREEN_PIXEL                    = [0, 255, 0, 255];
const RED_PIXEL                      = [255, 0, 0, 255];

const VIDEOS_PATH      = config.testVideosDir;
const VIDEO_FILES_GLOB = path.join(VIDEOS_PATH, '**', '*');

function hasPixel (png, pixel, x, y) {
    const baseIndex = (png.width * y + x) * 4;

    return png.data[baseIndex] === pixel[0] &&
           png.data[baseIndex + 1] === pixel[1] &&
           png.data[baseIndex + 2] === pixel[2] &&
           png.data[baseIndex + 3] === pixel[3];
}

function getScreenshotFilesCount (dir, customPath) {
    const list             = fs.readdirSync(dir);
    const screenshotRegExp = customPath ? CUSTOM_SCREENSHOT_FILE_NAME_RE : SCREENSHOT_FILE_NAME_RE;

    let results  = 0;
    let stat     = null;
    let filePath = null;

    list.forEach(function (file) {
        filePath = path.join(dir, file);
        stat     = fs.statSync(filePath);

        if (stat && stat.isDirectory() && file === THUMBNAILS_DIR_NAME)
            results += getScreenshotFilesCount(filePath, customPath);
        else if (screenshotRegExp.test(filePath))
            results++;
    });
    return results;
}

function checkScreenshotFileCropped (filePath) {
    return readPngFile(filePath)
        .then(function (png) {
            const width  = png.width;
            const height = png.height;

            // NOTE: sometimes an appearing dialog can cover an edge of the browser. Try to check all edges
            return hasPixel(png, RED_PIXEL, 0, 0) && hasPixel(png, RED_PIXEL, 49, 49) && hasPixel(png, GREEN_PIXEL, 50, 50) ||
                   hasPixel(png, RED_PIXEL, width - 1, height - 1) && hasPixel(png, RED_PIXEL, width - 50, height - 50) && hasPixel(png, GREEN_PIXEL, width - 51, height - 51) ||
                   hasPixel(png, RED_PIXEL, width - 1, 0) && hasPixel(png, RED_PIXEL, width - 50, 49) && hasPixel(png, GREEN_PIXEL, width - 51, 50) ||
                   hasPixel(png, RED_PIXEL, 0, height - 1) && hasPixel(png, RED_PIXEL, 49, height - 50) && hasPixel(png, GREEN_PIXEL, 50, height - 51);
        });
}

function checkScreenshotFileIsNotWhite (filePath) {
    return readPngFile(filePath)
        .then(function (png) {
            return png.data.indexOf(Buffer.from(RED_PIXEL)) > -1 && png.data.indexOf(Buffer.from(GREEN_PIXEL)) > -1;
        });
}

function isDirExists (folderPath) {
    let exists = false;

    try {
        exists = fs.statSync(folderPath).isDirectory();
    }
    catch (e) {
        exists = false;
    }

    return exists;
}

function checkTestDir (testDirPath, forError, expectedSubDirCount, expectedScreenshotCount) {
    const subDirs = fs
        .readdirSync(testDirPath)
        .filter(function (file) {
            return isDirExists(path.join(testDirPath, file));
        });

    if (subDirs.length !== expectedSubDirCount)
        return false;

    let dirPath = null;

    return subDirs.every(function (dir) {
        dirPath = forError ? path.join(testDirPath, dir, ERRORS_DIR_NAME) : path.join(testDirPath, dir);

        return getScreenshotFilesCount(dirPath) === expectedScreenshotCount;
    });
}

function checkScreenshotImages (forError, customPath, predicate, expectedScreenshotsCount = config.browsers.length) {
    if (!isDirExists(SCREENSHOTS_PATH))
        return false;

    const taskDirs = fs.readdirSync(SCREENSHOTS_PATH);

    if (!taskDirs || !taskDirs[0] || taskDirs.length !== 1)
        return false;

    const taskDirPath = path.join(SCREENSHOTS_PATH, taskDirs[0]);

    let list = [];

    if (forError) {
        const testDirs = fs.readdirSync(taskDirPath);

        if (!testDirs || !testDirs[0] || testDirs.length !== 1)
            return false;

        const testDirPath = path.join(taskDirPath, testDirs[0]);
        const browserDirs = fs.readdirSync(testDirPath);

        browserDirs.forEach(function (browserDir) {
            const errorDirPath    = path.join(testDirPath, browserDir, 'errors');
            const screenshotFiles = fs.readdirSync(errorDirPath);

            const screenshotPaths = screenshotFiles.map(function (screenshotFile) {
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
            let actualScreenshotsCount = 0;

            for (let i = 0; i < checkResults.length; i++)
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

exports.checkScreenshotsCreated = function ({ forError, customPath, screenshotsCount, runDirCount, browsersCount }) {
    const expectedSubDirCount     = browsersCount || config.browsers.length;
    const expectedScreenshotCount = screenshotsCount || 2;

    if (!isDirExists(SCREENSHOTS_PATH))
        return false;

    const taskDirs = fs.readdirSync(SCREENSHOTS_PATH);

    if (!taskDirs || !taskDirs[0] || taskDirs.length !== 1)
        return false;

    const taskDirPath = path.join(SCREENSHOTS_PATH, taskDirs[0]);

    if (customPath) {
        const customDirExists = taskDirPath.includes(customPath);
        const hasScreenshots  = getScreenshotFilesCount(taskDirPath, customPath) ===
                              expectedScreenshotCount * expectedSubDirCount;

        return customDirExists && hasScreenshots;
    }

    if (!TASK_DIR_RE.test(taskDirs[0]))
        return false;

    const testDirs = fs.readdirSync(taskDirPath);

    if (!testDirs || !testDirs.length || testDirs.length !== 1)
        return false;

    let basePath  = null;
    let dirs      = null;
    let dirNameRE = null;
    let dirPath   = null;

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

exports.isScreenshotsEqual = function (customPath, referenceImagePathGetter) {
    return checkScreenshotImages(false, customPath, function (screenshotFilePath) {
        const screenshotContent = fs.readFileSync(screenshotFilePath);

        const referenceImagePath = isFunction(referenceImagePathGetter)
            ? referenceImagePathGetter(screenshotFilePath)
            : referenceImagePathGetter;

        const referenceImageContent = fs.readFileSync(referenceImagePath);

        return screenshotContent.equals(referenceImageContent);
    });
};

exports.checkScreenshotsDimensions = function (dimensions, screenshotCount) {
    return checkScreenshotImages(false, '', function (screenshotFilePath) {
        return readPngFile(screenshotFilePath)
            .then(png => {
                return dimensions.width === png.width && dimensions.height === png.height;
            });
    }, screenshotCount);
};

function removeDir (dirPath) {
    if (isDirExists(dirPath))
        return del(dirPath);

    return Promise.resolve();
}

exports.removeScreenshotDir = () => removeDir(SCREENSHOTS_PATH);

exports.removeVideosDir = () => removeDir(VIDEOS_PATH);

exports.getVideoFilesList = () => {
    return globby(VIDEO_FILES_GLOB, { nodir: true });
};

exports.SCREENSHOTS_PATH = SCREENSHOTS_PATH;

exports.THUMBNAILS_DIR_NAME = THUMBNAILS_DIR_NAME;

