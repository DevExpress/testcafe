'use strict';

exports.__esModule = true;

exports.default = function () {
    // NOTE: 32-bit id
    var id = (0, _generate2.default)(ALPHABET, _constants.MARK_LENGTH);

    // NOTE: array of RGB values
    var markSeed = (0, _lodash.flatten)((0, _lodash.map)(id, function (bit) {
        return bit === '0' ? [0, 0, 0, 255] : [255, 255, 255, 255];
    }));

    // NOTE: macOS browsers can't display an element, if it's CSS height is lesser than 1.
    // It happens on Retina displays, because they have more than 1 physical pixel in a CSS pixel.
    // So increase mark size by prepending transparent pixels before the actual mark.
    var imageData = (0, _lodash.times)(_constants.MARK_BYTES_PER_PIXEL * _constants.MARK_LENGTH * (_constants.MARK_HEIGHT - 1), (0, _lodash.constant)(0)).concat(markSeed);
    var imageDataBuffer = Buffer.from(imageData);
    var pngImage = new _pngjs.PNG({ width: _constants.MARK_LENGTH, height: _constants.MARK_HEIGHT });

    imageDataBuffer.copy(pngImage.data);

    var markData = 'data:image/png;base64,' + _pngjs.PNG.sync.write(pngImage).toString('base64');

    return { markSeed: markSeed, markData: markData };
};

var _generate = require('nanoid/generate');

var _generate2 = _interopRequireDefault(_generate);

var _pngjs = require('pngjs');

var _lodash = require('lodash');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ALPHABET = '01';

module.exports = exports['default'];