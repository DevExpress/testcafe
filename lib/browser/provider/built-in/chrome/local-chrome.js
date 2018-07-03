'use strict';

exports.__esModule = true;
exports.stop = exports.start = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var start = exports.start = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(pageUrl, _ref2) {
        var browserName = _ref2.browserName,
            config = _ref2.config,
            cdpPort = _ref2.cdpPort,
            tempProfileDir = _ref2.tempProfileDir;
        var chromeInfo, chromeOpenParameters;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return _testcafeBrowserTools2.default.getBrowserInfo(config.path || browserName);

                    case 2:
                        chromeInfo = _context.sent;
                        chromeOpenParameters = (0, _assign2.default)({}, chromeInfo);


                        chromeOpenParameters.cmd = buildChromeArgs(config, cdpPort, chromeOpenParameters.cmd, tempProfileDir);

                        _context.next = 7;
                        return browserStarter.startBrowser(chromeOpenParameters, pageUrl);

                    case 7:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function start(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var stop = exports.stop = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref4) {
        var browserId = _ref4.browserId;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return (0, _killBrowserProcess2.default)(browserId);

                    case 2:
                        if (_context2.sent) {
                            _context2.next = 5;
                            break;
                        }

                        _context2.next = 5;
                        return (0, _killBrowserProcess2.default)(browserId);

                    case 5:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function stop(_x3) {
        return _ref3.apply(this, arguments);
    };
}();

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _testcafeBrowserTools2 = _interopRequireDefault(_testcafeBrowserTools);

var _killBrowserProcess = require('../../utils/kill-browser-process');

var _killBrowserProcess2 = _interopRequireDefault(_killBrowserProcess);

var _browserStarter = require('../../utils/browser-starter');

var _browserStarter2 = _interopRequireDefault(_browserStarter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var browserStarter = new _browserStarter2.default();

function buildChromeArgs(config, cdpPort, platformArgs, profileDir) {
    return ['--remote-debugging-port=' + cdpPort].concat(!config.userProfile ? ['--user-data-dir=' + profileDir.name] : [], config.headless ? ['--headless'] : [], config.userArgs ? [config.userArgs] : [], platformArgs ? [platformArgs] : []).join(' ');
}