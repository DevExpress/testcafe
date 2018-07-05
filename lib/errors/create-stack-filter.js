'use strict';

exports.__esModule = true;
exports.default = createStackFilter;

var _path = require('path');

var _lodash = require('lodash');

var BABEL = require.resolve('babel-core');
var BABEL_MODULES_DIR = BABEL.replace(new RegExp('^(.*' + (0, _lodash.escapeRegExp)(_path.sep) + 'node_modules' + (0, _lodash.escapeRegExp)(_path.sep) + ')(.*)'), '$1');

var BABEL_RELATED = BABEL_MODULES_DIR + 'babel-';
var BABYLON = BABEL_MODULES_DIR + 'babylon' + _path.sep;
var CORE_JS = BABEL_MODULES_DIR + 'core-js' + _path.sep;
var REGENERATOR_RUNTIME = BABEL_MODULES_DIR + 'regenerator-runtime' + _path.sep;

var TESTCAFE_LIB = (0, _path.join)(__dirname, '../');
var TESTCAFE_BIN = (0, _path.join)(__dirname, '../../bin');
var TESTCAFE_HAMMERHEAD = _path.sep + 'testcafe-hammerhead' + _path.sep;

var SOURCE_MAP_SUPPORT = _path.sep + 'source-map-support' + _path.sep;

var INTERNAL = 'internal/';

function createStackFilter(limit) {
    var passedFramesCount = 0;

    return function stackFilter(frame) {
        if (passedFramesCount >= limit) return false;

        var filename = frame.getFileName();

        // NOTE: filter out the internals of node, Babel and TestCafe
        var pass = filename && filename.indexOf(_path.sep) > -1 && filename.indexOf(INTERNAL) !== 0 && filename.indexOf(TESTCAFE_LIB) !== 0 && filename.indexOf(TESTCAFE_BIN) !== 0 && filename.indexOf(TESTCAFE_HAMMERHEAD) < 0 && filename.indexOf(BABEL_RELATED) !== 0 && filename.indexOf(BABYLON) !== 0 && filename.indexOf(CORE_JS) !== 0 && filename.indexOf(REGENERATOR_RUNTIME) !== 0 && filename.indexOf(SOURCE_MAP_SUPPORT) < 0;

        if (pass) passedFramesCount++;

        return pass;
    };
}
module.exports = exports['default'];