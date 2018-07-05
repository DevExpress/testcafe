'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var createTempUserDir = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(proxyHostName) {
        var _automatic_downloads;

        var tempDir, profileDirName, preferences;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _tmp2.default.setGracefulCleanup();

                        tempDir = _tmp2.default.dirSync({ unsafeCleanup: true });
                        profileDirName = _path2.default.join(tempDir.name, 'Default');
                        _context.next = 5;
                        return (0, _promisifiedFunctions.ensureDir)(profileDirName);

                    case 5:
                        preferences = {
                            'credentials_enable_service': false,

                            'devtools': {
                                'preferences': {
                                    'currentDockState': '"undocked"',
                                    'lastDockState': '"bottom"'
                                }
                            },

                            'profile': {
                                'content_settings': {
                                    'exceptions': {
                                        'automatic_downloads': (_automatic_downloads = {}, _automatic_downloads[proxyHostName] = { setting: 1 }, _automatic_downloads)
                                    }
                                },

                                'password_manager_enabled': false
                            },

                            'translate': {
                                'enabled': false
                            }
                        };
                        _context.next = 8;
                        return (0, _promisifiedFunctions.writeFile)(_path2.default.join(profileDirName, 'Preferences'), (0, _stringify2.default)(preferences));

                    case 8:
                        _context.next = 10;
                        return (0, _promisifiedFunctions.writeFile)(_path2.default.join(tempDir.name, 'First Run'), '');

                    case 10:
                        return _context.abrupt('return', tempDir);

                    case 11:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function createTempUserDir(_x) {
        return _ref.apply(this, arguments);
    };
}();

var getTempProfileDir = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(proxyHostName, config) {
        var tempProfile, shouldUseCommonProfile;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        tempProfile = commonTempProfile;
                        shouldUseCommonProfile = !config.headless && !config.emulation;

                        if (!(!shouldUseCommonProfile || !commonTempProfile)) {
                            _context2.next = 6;
                            break;
                        }

                        _context2.next = 5;
                        return createTempUserDir(proxyHostName);

                    case 5:
                        tempProfile = _context2.sent;

                    case 6:

                        if (shouldUseCommonProfile && !commonTempProfile) commonTempProfile = tempProfile;

                        return _context2.abrupt('return', tempProfile);

                    case 8:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function getTempProfileDir(_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
}();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

var _endpointUtils = require('endpoint-utils');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _promisifiedFunctions = require('../../../../utils/promisified-functions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var commonTempProfile = null;

exports.default = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(proxyHostName, configString) {
        var config, tempProfileDir, cdpPort;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        config = (0, _config2.default)(configString);

                        if (config.userProfile) {
                            _context3.next = 7;
                            break;
                        }

                        _context3.next = 4;
                        return getTempProfileDir(proxyHostName, config);

                    case 4:
                        _context3.t0 = _context3.sent;
                        _context3.next = 8;
                        break;

                    case 7:
                        _context3.t0 = null;

                    case 8:
                        tempProfileDir = _context3.t0;
                        _context3.t1 = config.cdpPort;

                        if (_context3.t1) {
                            _context3.next = 14;
                            break;
                        }

                        _context3.next = 13;
                        return (0, _endpointUtils.getFreePort)();

                    case 13:
                        _context3.t1 = _context3.sent;

                    case 14:
                        cdpPort = _context3.t1;
                        return _context3.abrupt('return', { config: config, cdpPort: cdpPort, tempProfileDir: tempProfileDir });

                    case 16:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function (_x4, _x5) {
        return _ref3.apply(this, arguments);
    };
}();

module.exports = exports['default'];