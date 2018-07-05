'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _events = require('events');

var _lodash = require('lodash');

var _browserJob = require('./browser-job');

var _browserJob2 = _interopRequireDefault(_browserJob);

var _screenshots = require('../screenshots');

var _screenshots2 = _interopRequireDefault(_screenshots);

var _warningLog = require('../notifications/warning-log');

var _warningLog2 = _interopRequireDefault(_warningLog);

var _fixtureHookController = require('./fixture-hook-controller');

var _fixtureHookController2 = _interopRequireDefault(_fixtureHookController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Task = function (_EventEmitter) {
    (0, _inherits3.default)(Task, _EventEmitter);

    function Task(tests, browserConnectionGroups, proxy, opts) {
        (0, _classCallCheck3.default)(this, Task);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.running = false;
        _this.browserConnectionGroups = browserConnectionGroups;
        _this.tests = tests;
        _this.screenshots = new _screenshots2.default(opts.screenshotPath);
        _this.warningLog = new _warningLog2.default();

        _this.fixtureHookController = new _fixtureHookController2.default(tests, browserConnectionGroups.length);
        _this.pendingBrowserJobs = _this._createBrowserJobs(proxy, opts);
        return _this;
    }

    Task.prototype._assignBrowserJobEventHandlers = function _assignBrowserJobEventHandlers(job) {
        var _this2 = this;

        job.on('test-run-start', function (testRun) {
            return _this2.emit('test-run-start', testRun);
        });
        job.on('test-run-done', function (testRun) {
            return _this2.emit('test-run-done', testRun);
        });

        job.once('start', function () {
            if (!_this2.running) {
                _this2.running = true;
                _this2.emit('start');
            }
        });

        job.once('done', function () {
            (0, _lodash.pull)(_this2.pendingBrowserJobs, job);
            _this2.emit('browser-job-done', job);

            if (!_this2.pendingBrowserJobs.length) _this2.emit('done');
        });
    };

    Task.prototype._createBrowserJobs = function _createBrowserJobs(proxy, opts) {
        var _this3 = this;

        return this.browserConnectionGroups.map(function (browserConnectionGroup) {
            var job = new _browserJob2.default(_this3.tests, browserConnectionGroup, proxy, _this3.screenshots, _this3.warningLog, _this3.fixtureHookController, opts);

            _this3._assignBrowserJobEventHandlers(job);
            browserConnectionGroup.map(function (bc) {
                return bc.addJob(job);
            });

            return job;
        });
    };

    // API


    Task.prototype.abort = function abort() {
        this.pendingBrowserJobs.forEach(function (job) {
            return job.abort();
        });
    };

    return Task;
}(_events.EventEmitter);

exports.default = Task;
module.exports = exports['default'];