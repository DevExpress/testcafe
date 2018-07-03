'use strict';

exports.__esModule = true;

exports.default = function () {
    var sizeString = process.env.MAXIMIZED_HEADLESS_WINDOW_SIZE || DEFAULT_MAXIMIZED_HEADLESS_WINDOW_SIZE;

    var _sizeString$split$map = sizeString.split('x').map(function (str) {
        return Number(str);
    }),
        width = _sizeString$split$map[0],
        height = _sizeString$split$map[1];

    return { width: width, height: height };
};

var DEFAULT_MAXIMIZED_HEADLESS_WINDOW_SIZE = '1920x1080';

module.exports = exports['default'];