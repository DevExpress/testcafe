'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _testcafeHammerhead = require('testcafe-hammerhead');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ACTIVE_SESSIONS_MAP = {};

var SessionController = function (_Session) {
    (0, _inherits3.default)(SessionController, _Session);

    function SessionController(uploadsRoot) {
        (0, _classCallCheck3.default)(this, SessionController);

        var _this = (0, _possibleConstructorReturn3.default)(this, _Session.call(this, uploadsRoot));

        _this.currentTestRun = null;
        return _this;
    }

    // Hammerhead payload


    SessionController.prototype._getPayloadScript = function _getPayloadScript() {
        return this.currentTestRun._getPayloadScript();
    };

    SessionController.prototype._getIframePayloadScript = function _getIframePayloadScript() {
        return this.currentTestRun._getIframePayloadScript();
    };

    // Hammerhead handlers


    SessionController.prototype.handleServiceMessage = function handleServiceMessage(msg, serverInfo) {
        if (this.currentTestRun[msg.cmd]) return _Session.prototype.handleServiceMessage.call(this.currentTestRun, msg, serverInfo);

        return _Session.prototype.handleServiceMessage.call(this, msg, serverInfo);
    };

    SessionController.prototype.getAuthCredentials = function getAuthCredentials() {
        return this.currentTestRun.getAuthCredentials();
    };

    SessionController.prototype.handleFileDownload = function handleFileDownload() {
        return this.currentTestRun.handleFileDownload();
    };

    SessionController.prototype.handlePageError = function handlePageError(ctx, err) {
        return this.currentTestRun.handlePageError(ctx, err);
    };

    // API


    SessionController.getSession = function getSession(testRun) {
        var sessionInfo = ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];

        if (!sessionInfo || !testRun.disablePageReloads) {
            if (sessionInfo && sessionInfo.url) SessionController.closeSession(testRun);

            var session = null;

            if (testRun.test.isLegacy) session = testRun;else {
                session = new SessionController(_path2.default.dirname(testRun.test.fixture.path));

                session.currentTestRun = testRun;
            }

            sessionInfo = {
                session: session,
                proxy: null,
                url: null
            };

            ACTIVE_SESSIONS_MAP[testRun.browserConnection.id] = sessionInfo;
        } else if (!testRun.test.isLegacy) sessionInfo.session.currentTestRun = testRun;

        return sessionInfo.session;
    };

    SessionController.getSessionUrl = function getSessionUrl(testRun, proxy) {
        var sessionInfo = ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];

        if (!sessionInfo || testRun.test.isLegacy) {
            SessionController.getSession(testRun);

            sessionInfo = ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];
        }

        if (!sessionInfo.url) {
            var pageUrl = testRun.test.pageUrl;
            var externalProxyHost = testRun.opts.externalProxyHost;
            var externalProxySettings = null;

            if (externalProxyHost) {
                externalProxySettings = {
                    url: externalProxyHost,
                    bypassRules: testRun.opts.proxyBypass
                };
            }

            sessionInfo.proxy = proxy;
            sessionInfo.url = proxy.openSession(pageUrl, sessionInfo.session, externalProxySettings);
        }

        return sessionInfo.url;
    };

    SessionController.closeSession = function closeSession(testRun) {
        var sessionInfo = ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];

        if (!sessionInfo || !sessionInfo.url || !sessionInfo.proxy) return;

        sessionInfo.proxy.closeSession(sessionInfo.session);

        delete ACTIVE_SESSIONS_MAP[testRun.browserConnection.id];
    };

    return SessionController;
}(_testcafeHammerhead.Session);

exports.default = SessionController;
module.exports = exports['default'];