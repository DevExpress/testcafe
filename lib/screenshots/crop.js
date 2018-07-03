'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _pngjs = require('pngjs');

var _promisifyEvent = require('promisify-event');

var _promisifyEvent2 = _interopRequireDefault(_promisifyEvent);

var _limitNumber = require('../utils/limit-number');

var _limitNumber2 = _interopRequireDefault(_limitNumber);

var _promisifiedFunctions = require('../utils/promisified-functions');

var _renderTemplate = require('../utils/render-template');

var _renderTemplate2 = _interopRequireDefault(_renderTemplate);

var _testRun = require('../errors/test-run/');

var _constants = require('./constants');

var _warningMessage = require('../notifications/warning-message');

var _warningMessage2 = _interopRequireDefault(_warningMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function readPng(filePath) {
    var png = new _pngjs.PNG();
    var parsedPromise = _pinkie2.default.race([(0, _promisifyEvent2.default)(png, 'parsed'), (0, _promisifyEvent2.default)(png, 'error')]);

    _fs2.default.createReadStream(filePath).pipe(png);

    return parsedPromise.then(function () {
        return png;
    });
}

function writePng(filePath, png) {
    var outStream = _fs2.default.createWriteStream(filePath);
    var finishPromise = _pinkie2.default.race([(0, _promisifyEvent2.default)(outStream, 'finish'), (0, _promisifyEvent2.default)(outStream, 'error')]);

    png.pack().pipe(outStream);

    return finishPromise;
}

function markSeedToId(markSeed) {
    var id = 0;

    for (var i = 0; i < _constants.MARK_LENGTH; i++) {
        id = id * 2 + (markSeed[i * _constants.MARK_BYTES_PER_PIXEL] ? 1 : 0);
    }return id;
}

function detectClippingArea(srcImage) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        markSeed = _ref.markSeed,
        clientAreaDimensions = _ref.clientAreaDimensions,
        cropDimensions = _ref.cropDimensions,
        screenshotPath = _ref.screenshotPath;

    var clipLeft = 0;
    var clipTop = 0;
    var clipRight = srcImage.width;
    var clipBottom = srcImage.height;
    var clipWidth = srcImage.width;
    var clipHeight = srcImage.height;

    if (markSeed && clientAreaDimensions) {
        var mark = Buffer.from(markSeed);

        var markIndex = srcImage.data.indexOf(mark);

        if (markIndex < 0) throw new Error((0, _renderTemplate2.default)(_warningMessage2.default.screenshotMarkNotFound, screenshotPath, markSeedToId(markSeed)));

        var endPosition = markIndex / _constants.MARK_BYTES_PER_PIXEL + _constants.MARK_LENGTH + _constants.MARK_RIGHT_MARGIN;

        clipRight = endPosition % srcImage.width || srcImage.width;
        clipBottom = (endPosition - clipRight) / srcImage.width + 1;
        clipLeft = clipRight - clientAreaDimensions.width;
        clipTop = clipBottom - clientAreaDimensions.height;
    }

    var markLineNumber = clipBottom;

    if (cropDimensions) {
        clipRight = (0, _limitNumber2.default)(clipLeft + cropDimensions.right, clipLeft, clipRight);
        clipBottom = (0, _limitNumber2.default)(clipTop + cropDimensions.bottom, clipTop, clipBottom);
        clipLeft = (0, _limitNumber2.default)(clipLeft + cropDimensions.left, clipLeft, clipRight);
        clipTop = (0, _limitNumber2.default)(clipTop + cropDimensions.top, clipTop, clipBottom);
    }

    if (markSeed && clipBottom === markLineNumber) clipBottom -= 1;

    clipWidth = clipRight - clipLeft;
    clipHeight = clipBottom - clipTop;

    return {
        left: clipLeft,
        top: clipTop,
        right: clipRight,
        bottom: clipBottom,
        width: clipWidth,
        height: clipHeight
    };
}

function copyImagePart(srcImage, _ref2) {
    var left = _ref2.left,
        top = _ref2.top,
        width = _ref2.width,
        height = _ref2.height;

    var dstImage = new _pngjs.PNG({ width: width, height: height });
    var stride = dstImage.width * _constants.MARK_BYTES_PER_PIXEL;

    for (var i = 0; i < height; i++) {
        var srcStartIndex = (srcImage.width * (i + top) + left) * _constants.MARK_BYTES_PER_PIXEL;

        srcImage.data.copy(dstImage.data, stride * i, srcStartIndex, srcStartIndex + stride);
    }

    return dstImage;
}

exports.default = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(screenshotPath, markSeed, clientAreaDimensions, cropDimensions) {
        var srcImage, clippingArea, dstImage;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return readPng(screenshotPath);

                    case 2:
                        srcImage = _context.sent;
                        clippingArea = detectClippingArea(srcImage, { markSeed: markSeed, clientAreaDimensions: clientAreaDimensions, cropDimensions: cropDimensions, screenshotPath: screenshotPath });

                        if (!(clippingArea.width <= 0 || clippingArea.height <= 0)) {
                            _context.next = 8;
                            break;
                        }

                        _context.next = 7;
                        return (0, _promisifiedFunctions.deleteFile)(screenshotPath);

                    case 7:
                        throw new _testRun.InvalidElementScreenshotDimensionsError(clippingArea.width, clippingArea.height);

                    case 8:
                        if (!(!markSeed && !cropDimensions)) {
                            _context.next = 10;
                            break;
                        }

                        return _context.abrupt('return', true);

                    case 10:
                        dstImage = copyImagePart(srcImage, clippingArea);
                        _context.next = 13;
                        return writePng(screenshotPath, dstImage);

                    case 13:
                        return _context.abrupt('return', true);

                    case 14:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function (_x2, _x3, _x4, _x5) {
        return _ref3.apply(this, arguments);
    };
}();

module.exports = exports['default'];