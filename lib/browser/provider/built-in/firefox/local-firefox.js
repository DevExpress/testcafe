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
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(pageUrl, runtimeInfo) {
        var browserName, config, tempProfileDir, firefoxInfo, firefoxOpenParameters;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        browserName = runtimeInfo.browserName, config = runtimeInfo.config, tempProfileDir = runtimeInfo.tempProfileDir;
                        _context.next = 3;
                        return _testcafeBrowserTools2.default.getBrowserInfo(config.path || browserName);

                    case 3:
                        firefoxInfo = _context.sent;
                        firefoxOpenParameters = (0, _assign2.default)({}, firefoxInfo);


                        if (_osFamily2.default.mac && !config.userProfile) correctOpenParametersForMac(firefoxOpenParameters);

                        firefoxOpenParameters.cmd = buildFirefoxArgs(config, firefoxOpenParameters.cmd, tempProfileDir, runtimeInfo.newInstance);

                        _context.next = 9;
                        return browserStarter.startBrowser(firefoxOpenParameters, pageUrl);

                    case 9:
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
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(_ref3) {
        var browserId = _ref3.browserId;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return (0, _killBrowserProcess2.default)(browserId);

                    case 2:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function stop(_x3) {
        return _ref2.apply(this, arguments);
    };
}();

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _testcafeBrowserTools = require('testcafe-browser-tools');

var _testcafeBrowserTools2 = _interopRequireDefault(_testcafeBrowserTools);

var _killBrowserProcess = require('../../utils/kill-browser-process');

var _killBrowserProcess2 = _interopRequireDefault(_killBrowserProcess);

var _browserStarter = require('../../utils/browser-starter');

var _browserStarter2 = _interopRequireDefault(_browserStarter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var browserStarter = new _browserStarter2.default();

function correctOpenParametersForMac(parameters) {
    parameters.macOpenCmdTemplate = parameters.macOpenCmdTemplate.replace('open', 'open -n').replace(' {{{pageUrl}}}', '');

    parameters.macOpenCmdTemplate += ' {{{pageUrl}}}';
}

function buildFirefoxArgs(config, platformArgs, profileDir) {
    return ['-marionette'].concat(!config.userProfile ? ['-no-remote', '-new-instance', '-profile "' + profileDir.name + '"'] : [], config.headless ? ['-headless'] : [], config.userArgs ? [config.userArgs] : [], platformArgs ? [platformArgs] : []).join(' ');
}