'use strict';

exports.__esModule = true;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _path = require('./path');

var _path2 = _interopRequireDefault(_path);

var _locallyInstalled = require('./locally-installed');

var _locallyInstalled2 = _interopRequireDefault(_locallyInstalled);

var _remote = require('./remote');

var _remote2 = _interopRequireDefault(_remote);

var _firefox = require('./firefox');

var _firefox2 = _interopRequireDefault(_firefox);

var _chrome = require('./chrome');

var _chrome2 = _interopRequireDefault(_chrome);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (0, _assign2.default)({
    'locally-installed': _locallyInstalled2.default,
    'path': _path2.default,
    'remote': _remote2.default,
    'firefox': _firefox2.default,
    'chrome': _chrome2.default,
    'chromium': _chrome2.default,
    'chrome-canary': _chrome2.default
});
module.exports = exports['default'];