'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _path = require('path');

var _sanitizeFilename = require('sanitize-filename');

var _sanitizeFilename2 = _interopRequireDefault(_sanitizeFilename);

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _crop = require('./crop');

var _crop2 = _interopRequireDefault(_crop);

var _promisifiedFunctions = require('../utils/promisified-functions');

var _asyncQueue = require('../utils/async-queue');

var _warningMessage = require('../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PNG_EXTENSION_RE = /(\.png)$/;

var Capturer = function () {
    function Capturer(baseScreenshotsPath, testEntry, connection, namingOptions, warningLog) {
        (0, _classCallCheck3.default)(this, Capturer);

        this.enabled = !!baseScreenshotsPath;
        this.baseScreenshotsPath = baseScreenshotsPath;
        this.testEntry = testEntry;
        this.provider = connection.provider;
        this.browserId = connection.id;
        this.baseDirName = namingOptions.baseDirName;
        this.userAgentName = namingOptions.userAgentName;
        this.quarantine = namingOptions.quarantine;
        this.attemptNumber = this.quarantine ? this.quarantine.getNextAttemptNumber() : null;
        this.testIndex = namingOptions.testIndex;
        this.screenshotIndex = 1;
        this.errorScreenshotIndex = 1;
        this.warningLog = warningLog;

        var testDirName = 'test-' + this.testIndex;
        var screenshotsPath = this.enabled ? (0, _path.join)(this.baseScreenshotsPath, this.baseDirName, testDirName) : '';

        this.screenshotsPath = screenshotsPath;
        this.screenshotPathForReport = screenshotsPath;
    }

    Capturer._correctFilePath = function _correctFilePath(path) {
        var correctedPath = path.replace(/\\/g, '/').split('/').map(function (str) {
            return (0, _sanitizeFilename2.default)(str);
        }).join('/');

        return PNG_EXTENSION_RE.test(correctedPath) ? correctedPath : correctedPath + '.png';
    };

    Capturer._getDimensionWithoutScrollbar = function _getDimensionWithoutScrollbar(fullDimension, documentDimension, bodyDimension) {
        if (bodyDimension > fullDimension) return documentDimension;

        if (documentDimension > fullDimension) return bodyDimension;

        return Math.max(documentDimension, bodyDimension);
    };

    Capturer._getCropDimensions = function _getCropDimensions(cropDimensions, pageDimensions) {
        if (!cropDimensions || !pageDimensions) return null;

        var dpr = pageDimensions.dpr;
        var top = cropDimensions.top,
            left = cropDimensions.left,
            bottom = cropDimensions.bottom,
            right = cropDimensions.right;


        return {
            top: Math.round(top * dpr),
            left: Math.round(left * dpr),
            bottom: Math.round(bottom * dpr),
            right: Math.round(right * dpr)
        };
    };

    Capturer._getClientAreaDimensions = function _getClientAreaDimensions(pageDimensions) {
        if (!pageDimensions) return null;

        var innerWidth = pageDimensions.innerWidth,
            documentWidth = pageDimensions.documentWidth,
            bodyWidth = pageDimensions.bodyWidth,
            innerHeight = pageDimensions.innerHeight,
            documentHeight = pageDimensions.documentHeight,
            bodyHeight = pageDimensions.bodyHeight,
            dpr = pageDimensions.dpr;


        return {
            width: Math.floor(Capturer._getDimensionWithoutScrollbar(innerWidth, documentWidth, bodyWidth) * dpr),
            height: Math.floor(Capturer._getDimensionWithoutScrollbar(innerHeight, documentHeight, bodyHeight) * dpr)
        };
    };

    Capturer.prototype._getFileName = function _getFileName(forError) {
        var fileName = (forError ? this.errorScreenshotIndex : this.screenshotIndex) + '.png';

        if (forError) this.errorScreenshotIndex++;else this.screenshotIndex++;

        return fileName;
    };

    Capturer.prototype._getScreenshotPath = function _getScreenshotPath(fileName, customPath) {
        if (customPath) return (0, _path.join)(this.baseScreenshotsPath, Capturer._correctFilePath(customPath));

        var screenshotPath = this.attemptNumber !== null ? (0, _path.join)(this.screenshotsPath, 'run-' + this.attemptNumber) : this.screenshotsPath;

        return (0, _path.join)(screenshotPath, this.userAgentName, fileName);
    };

    Capturer.prototype._getThumbnailPath = function _getThumbnailPath(screenshotPath) {
        var imageName = (0, _path.basename)(screenshotPath);
        var imageDir = (0, _path.dirname)(screenshotPath);

        return (0, _path.join)(imageDir, 'thumbnails', imageName);
    };

    Capturer.prototype._takeScreenshot = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(filePath, pageWidth, pageHeight) {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return (0, _promisifiedFunctions.ensureDir)((0, _path.dirname)(filePath));

                        case 2:
                            _context.next = 4;
                            return this.provider.takeScreenshot(this.browserId, filePath, pageWidth, pageHeight);

                        case 4:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function _takeScreenshot(_x, _x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return _takeScreenshot;
    }();

    Capturer.prototype._capture = function () {
        var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(forError) {
            var _this = this;

            var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                pageDimensions = _ref3.pageDimensions,
                cropDimensions = _ref3.cropDimensions,
                markSeed = _ref3.markSeed,
                customPath = _ref3.customPath;

            var fileName, screenshotPath, thumbnailPath, screenshot;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (this.enabled) {
                                _context3.next = 2;
                                break;
                            }

                            return _context3.abrupt('return', null);

                        case 2:
                            fileName = this._getFileName(forError);


                            fileName = forError ? (0, _path.join)('errors', fileName) : fileName;

                            screenshotPath = this._getScreenshotPath(fileName, customPath);
                            thumbnailPath = this._getThumbnailPath(screenshotPath);


                            if ((0, _asyncQueue.isInQueue)(screenshotPath)) this.warningLog.addWarning(_warningMessage2.default.screenshotRewritingError, screenshotPath);

                            _context3.next = 9;
                            return (0, _asyncQueue.addToQueue)(screenshotPath, (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                                return _regenerator2.default.wrap(function _callee2$(_context2) {
                                    while (1) {
                                        switch (_context2.prev = _context2.next) {
                                            case 0:
                                                _context2.next = 2;
                                                return _this._takeScreenshot.apply(_this, [screenshotPath].concat(pageDimensions ? [pageDimensions.innerWidth, pageDimensions.innerHeight] : []));

                                            case 2:
                                                _context2.next = 4;
                                                return (0, _crop2.default)(screenshotPath, markSeed, Capturer._getClientAreaDimensions(pageDimensions), Capturer._getCropDimensions(cropDimensions, pageDimensions));

                                            case 4:
                                                _context2.next = 6;
                                                return (0, _testcafeBrowserTools.generateThumbnail)(screenshotPath, thumbnailPath);

                                            case 6:
                                            case 'end':
                                                return _context2.stop();
                                        }
                                    }
                                }, _callee2, _this);
                            })));

                        case 9:

                            // NOTE: if test contains takeScreenshot action with custom path
                            // we should specify the most common screenshot folder in report
                            if (customPath) this.screenshotPathForReport = this.baseScreenshotsPath;

                            this.testEntry.path = this.screenshotPathForReport;

                            screenshot = {
                                screenshotPath: screenshotPath,
                                thumbnailPath: thumbnailPath,
                                userAgent: this.userAgentName,
                                quarantineAttemptID: this.attemptNumber,
                                takenOnFail: forError
                            };


                            this.testEntry.screenshots.push(screenshot);

                            return _context3.abrupt('return', screenshotPath);

                        case 14:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function _capture(_x4) {
            return _ref2.apply(this, arguments);
        }

        return _capture;
    }();

    Capturer.prototype.captureAction = function () {
        var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(options) {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return this._capture(false, options);

                        case 2:
                            return _context4.abrupt('return', _context4.sent);

                        case 3:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function captureAction(_x6) {
            return _ref5.apply(this, arguments);
        }

        return captureAction;
    }();

    Capturer.prototype.captureError = function () {
        var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(options) {
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.next = 2;
                            return this._capture(true, options);

                        case 2:
                            return _context5.abrupt('return', _context5.sent);

                        case 3:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function captureError(_x7) {
            return _ref6.apply(this, arguments);
        }

        return captureError;
    }();

    return Capturer;
}();

exports.default = Capturer;
module.exports = exports['default'];