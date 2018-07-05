'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _lodash = require('lodash');

var _sanitizeFilename = require('sanitize-filename');

var _sanitizeFilename2 = _interopRequireDefault(_sanitizeFilename);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _capturer = require('./capturer');

var _capturer2 = _interopRequireDefault(_capturer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Screenshots = function () {
    function Screenshots(path) {
        (0, _classCallCheck3.default)(this, Screenshots);

        this.enabled = !!path;
        this.screenshotsPath = path;
        this.testEntries = [];
        this.screenshotBaseDirName = Screenshots._getScreenshotBaseDirName();
        this.userAgentNames = [];
    }

    Screenshots._getScreenshotBaseDirName = function _getScreenshotBaseDirName() {
        var now = Date.now();

        return (0, _moment2.default)(now).format('YYYY-MM-DD_hh-mm-ss');
    };

    Screenshots._escapeUserAgent = function _escapeUserAgent(userAgent) {
        return (0, _sanitizeFilename2.default)(userAgent.toString()).replace(/\s+/g, '_');
    };

    Screenshots.prototype._getUsedUserAgent = function _getUsedUserAgent(name, testIndex, quarantineAttemptNum) {
        var userAgent = null;

        for (var i = 0; i < this.userAgentNames.length; i++) {
            userAgent = this.userAgentNames[i];

            if (userAgent.name === name && userAgent.testIndex === testIndex && userAgent.quarantineAttemptNum === quarantineAttemptNum) return userAgent;
        }

        return null;
    };

    Screenshots.prototype._getUserAgentName = function _getUserAgentName(userAgent, testIndex, quarantineAttemptNum) {
        var userAgentName = Screenshots._escapeUserAgent(userAgent);
        var usedUserAgent = this._getUsedUserAgent(userAgentName, testIndex, quarantineAttemptNum);

        if (usedUserAgent) {
            usedUserAgent.index++;
            return userAgentName + '_' + usedUserAgent.index;
        }

        this.userAgentNames.push({ name: userAgentName, index: 0, testIndex: testIndex, quarantineAttemptNum: quarantineAttemptNum });
        return userAgentName;
    };

    Screenshots.prototype._addTestEntry = function _addTestEntry(test) {
        var testEntry = {
            test: test,
            path: this.screenshotsPath || '',
            screenshots: []
        };

        this.testEntries.push(testEntry);

        return testEntry;
    };

    Screenshots.prototype._getTestEntry = function _getTestEntry(test) {
        return (0, _lodash.find)(this.testEntries, function (entry) {
            return entry.test === test;
        });
    };

    Screenshots.prototype.getScreenshotsInfo = function getScreenshotsInfo(test) {
        return this._getTestEntry(test).screenshots;
    };

    Screenshots.prototype.hasCapturedFor = function hasCapturedFor(test) {
        return this.getScreenshotsInfo(test).length > 0;
    };

    Screenshots.prototype.getPathFor = function getPathFor(test) {
        return this._getTestEntry(test).path;
    };

    Screenshots.prototype.createCapturerFor = function createCapturerFor(test, testIndex, quarantine, connection, warningLog) {
        var testEntry = this._getTestEntry(test);

        if (!testEntry) testEntry = this._addTestEntry(test);

        var quarantineAttemptNum = quarantine ? quarantine.getNextAttemptNumber() : null;

        var namingOptions = {
            testIndex: testIndex,
            quarantine: quarantine,
            baseDirName: this.screenshotBaseDirName,
            userAgentName: this._getUserAgentName(connection.userAgent, testIndex, quarantineAttemptNum)
        };

        return new _capturer2.default(this.screenshotsPath, testEntry, connection, namingOptions, warningLog);
    };

    return Screenshots;
}();

exports.default = Screenshots;
module.exports = exports['default'];