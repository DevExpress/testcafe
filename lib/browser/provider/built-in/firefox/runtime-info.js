'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var generatePrefs = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(profileDir, _ref2) {
        var marionettePort = _ref2.marionettePort,
            config = _ref2.config;
        var prefsFileName, prefs;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        prefsFileName = _path2.default.join(profileDir, 'user.js');
                        prefs = ['user_pref("browser.link.open_newwindow.override.external", 2);', 'user_pref("app.update.enabled", false);', 'user_pref("app.update.auto", false);', 'user_pref("app.update.mode", 0);', 'user_pref("app.update.service.enabled", false);', 'user_pref("browser.shell.checkDefaultBrowser", false);', 'user_pref("browser.usedOnWindows10", true);', 'user_pref("browser.rights.3.shown", true);', 'user_pref("browser.startup.homepage_override.mstone","ignore");', 'user_pref("browser.tabs.warnOnCloseOtherTabs", false);', 'user_pref("browser.tabs.warnOnClose", false);', 'user_pref("browser.sessionstore.resume_from_crash", false);', 'user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);', 'user_pref("toolkit.telemetry.enabled", false);', 'user_pref("toolkit.telemetry.rejected", true);', 'user_pref("datareporting.healthreport.uploadEnabled", false);', 'user_pref("datareporting.healthreport.service.enabled", false);', 'user_pref("datareporting.healthreport.service.firstRun", false);', 'user_pref("datareporting.policy.dataSubmissionEnabled", false);', 'user_pref("datareporting.policy.dataSubmissionPolicyBypassNotification", true);', 'user_pref("app.shield.optoutstudies.enabled", false);', 'user_pref("extensions.shield-recipe-client.enabled", false);', 'user_pref("extensions.shield-recipe-client.first_run", false);', 'user_pref("extensions.shield-recipe-client.startupExperimentPrefs.browser.newtabpage.activity-stream.enabled", false);', 'user_pref("devtools.toolbox.host", "window");', 'user_pref("devtools.toolbox.previousHost", "bottom");', 'user_pref("signon.rememberSignons", false);'];


                        if (marionettePort) {
                            prefs = prefs.concat(['user_pref("marionette.port", ' + marionettePort + ');', 'user_pref("marionette.enabled", true);']);
                        }

                        if (config.disableMultiprocessing) {
                            prefs = prefs.concat(['user_pref("browser.tabs.remote.autostart", false);', 'user_pref("browser.tabs.remote.autostart.2", false);']);
                        }

                        _context.next = 6;
                        return (0, _promisifiedFunctions.writeFile)(prefsFileName, prefs.join('\n'));

                    case 6:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function generatePrefs(_x, _x2) {
        return _ref.apply(this, arguments);
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

function createTempProfileDir() {
    _tmp2.default.setGracefulCleanup();

    return _tmp2.default.dirSync({ unsafeCleanup: true });
}

exports.default = function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(configString) {
        var config, marionettePort, tempProfileDir, runtimeInfo;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        config = (0, _config2.default)(configString);
                        _context2.t0 = config.marionettePort;

                        if (_context2.t0) {
                            _context2.next = 6;
                            break;
                        }

                        _context2.next = 5;
                        return (0, _endpointUtils.getFreePort)();

                    case 5:
                        _context2.t0 = _context2.sent;

                    case 6:
                        marionettePort = _context2.t0;
                        tempProfileDir = !config.userProfile ? createTempProfileDir() : null;
                        runtimeInfo = { config: config, tempProfileDir: tempProfileDir, marionettePort: marionettePort };

                        if (config.userProfile) {
                            _context2.next = 12;
                            break;
                        }

                        _context2.next = 12;
                        return generatePrefs(tempProfileDir.name, runtimeInfo);

                    case 12:
                        return _context2.abrupt('return', runtimeInfo);

                    case 13:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function (_x3) {
        return _ref3.apply(this, arguments);
    };
}();

module.exports = exports['default'];