'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check').default;

var _regeneratorRuntime = require('babel-runtime/regenerator');

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default').default;

exports.__esModule = true;

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _osFamily = require('os-family');

var _osFamily2 = _interopRequireDefault(_osFamily);

var _browserstack = require('browserstack');

var _browserstackLocal = require('browserstack-local');

var _utilsWait = require('./utils/wait');

var _utilsWait2 = _interopRequireDefault(_utilsWait);

var BrowserStackConnector = (function () {
    function BrowserStackConnector(username, accessKey) {
        var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        _classCallCheck(this, BrowserStackConnector);

        this.username = username;
        this.accessKey = accessKey;

        var _options$connectorLogging = options.connectorLogging;
        var connectorLogging = _options$connectorLogging === undefined ? true : _options$connectorLogging;

        this.options = { connectorLogging: connectorLogging };
        this.client = _browserstack.createClient({ username: username, password: accessKey });
        this.localConnection = null;

        this.identifier = Date.now();
    }

    BrowserStackConnector.prototype._log = function _log(message) {
        if (this.options.connectorLogging) process.stdout.write(message + '\n');
    };

    BrowserStackConnector.prototype._getWorkers = function _getWorkers() {
        var _this = this;

        return new _pinkie2.default(function (resolve) {
            return _this.client.getWorkers(function (err, res) {
                return resolve(res);
            });
        });
    };

    BrowserStackConnector.prototype._getWorker = function _getWorker(id) {
        var getWorker, maxAttempts, requestTimeout, attempts, worker;
        return _regeneratorRuntime.async(function _getWorker$(context$2$0) {
            var _this2 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    getWorker = function () {
                        return new _pinkie2.default(function (resolve) {
                            _this2.client.getWorker(id, function (err, worker) {
                                return resolve(worker);
                            });
                        });
                    };

                    maxAttempts = 30;
                    requestTimeout = 10000;
                    attempts = 0;

                case 4:
                    if (!(attempts++ <= maxAttempts)) {
                        context$2$0.next = 14;
                        break;
                    }

                    context$2$0.next = 7;
                    return _regeneratorRuntime.awrap(getWorker());

                case 7:
                    worker = context$2$0.sent;

                    if (!(worker && worker.status === 'running')) {
                        context$2$0.next = 10;
                        break;
                    }

                    return context$2$0.abrupt('return', worker);

                case 10:
                    context$2$0.next = 12;
                    return _regeneratorRuntime.awrap(_utilsWait2.default(requestTimeout));

                case 12:
                    context$2$0.next = 4;
                    break;

                case 14:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    BrowserStackConnector.prototype._getMaxAvailableMachines = function _getMaxAvailableMachines() {
        return _regeneratorRuntime.async(function _getMaxAvailableMachines$(context$2$0) {
            var _this3 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    return context$2$0.abrupt('return', new _pinkie2.default(function (resolve, reject) {
                        _this3.client.getApiStatus(function (err, status) {
                            if (err) {
                                _this3._log(err);
                                reject(err);
                            } else resolve(status.sessions_limit);
                        });
                    }));

                case 1:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    BrowserStackConnector.prototype._getFreeMachineCount = function _getFreeMachineCount() {
        var _ref, maxMachines, workers;

        return _regeneratorRuntime.async(function _getFreeMachineCount$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.next = 2;
                    return _regeneratorRuntime.awrap(_pinkie2.default.all([this._getMaxAvailableMachines(), this._getWorkers()]));

                case 2:
                    _ref = context$2$0.sent;
                    maxMachines = _ref[0];
                    workers = _ref[1];
                    return context$2$0.abrupt('return', maxMachines - workers.length);

                case 6:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    BrowserStackConnector.prototype.getSessionUrl = function getSessionUrl(id) {
        var worker;
        return _regeneratorRuntime.async(function getSessionUrl$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    context$2$0.next = 2;
                    return _regeneratorRuntime.awrap(this._getWorker(id));

                case 2:
                    worker = context$2$0.sent;
                    return context$2$0.abrupt('return', worker && worker.browser_url);

                case 4:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    BrowserStackConnector.prototype.startBrowser = function startBrowser(browserSettings, url) {
        var timeout = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

        var _ref2,
            jobName,
            build,
            createWorker,
            workerId,
            args$2$0 = arguments;

        return _regeneratorRuntime.async(function startBrowser$(context$2$0) {
            var _this4 = this;

            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    _ref2 = args$2$0.length <= 2 || args$2$0[2] === undefined ? {} : args$2$0[2];
                    jobName = _ref2.jobName;
                    build = _ref2.build;

                    createWorker = function () {
                        return new _pinkie2.default(function (resolve, reject) {
                            var settings = {
                                os: browserSettings.os,
                                os_version: browserSettings.osVersion,
                                browser: browserSettings.name || null,
                                browser_version: browserSettings.version || 'latest',
                                device: browserSettings.device || null,
                                url: url,
                                timeout: timeout || 1800,
                                name: jobName,
                                build: build,
                                browserstack: {
                                    local: true
                                },
                                'browserstack.local': true
                            };

                            _this4.client.createWorker(settings, function (err, worker) {
                                if (err) {
                                    _this4._log(err);
                                    reject(err);
                                    return;
                                }

                                resolve(worker.id);
                            });
                        });
                    };

                    context$2$0.next = 6;
                    return _regeneratorRuntime.awrap(createWorker());

                case 6:
                    workerId = context$2$0.sent;
                    context$2$0.next = 9;
                    return _regeneratorRuntime.awrap(this._getWorker(workerId));

                case 9:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    BrowserStackConnector.prototype.stopBrowser = function stopBrowser(workerId) {
        var _this5 = this;

        return new _pinkie2.default(function (resolve, reject) {
            _this5.client.terminateWorker(workerId, function (err, data) {
                if (err) {
                    _this5._log(err);
                    reject(err);
                    return;
                }

                resolve(data.time);
            });
        });
    };

    BrowserStackConnector.prototype.connect = function connect() {
        var _this6 = this;

        var opts = {
            'key': this.accessKey,
            'logfile': _osFamily2.default.win ? 'NUL' : '/dev/null',
            'enable-logging-for-api': true,
            'verbose': true,
            'browserstack.local': true
        };

        this.localConnection = new _browserstackLocal.Local();

        return new _pinkie2.default(function (resolve, reject) {
            _this6.localConnection.start(opts, function (err) {
                if (err) {
                    _this6._log(err);
                    reject(err);
                } else resolve();
            });
        });
    };

    BrowserStackConnector.prototype.disconnect = function disconnect() {
        var _this7 = this;

        return new _pinkie2.default(function (resolve) {
            return _this7.localConnection.stop(resolve);
        });
    };

    BrowserStackConnector.prototype.waitForFreeMachines = function waitForFreeMachines(machineCount, requestInterval, maxAttemptCount) {
        var attempts, freeMachineCount;
        return _regeneratorRuntime.async(function waitForFreeMachines$(context$2$0) {
            while (1) switch (context$2$0.prev = context$2$0.next) {
                case 0:
                    attempts = 0;

                case 1:
                    if (!(attempts < maxAttemptCount)) {
                        context$2$0.next = 13;
                        break;
                    }

                    context$2$0.next = 4;
                    return _regeneratorRuntime.awrap(this._getFreeMachineCount());

                case 4:
                    freeMachineCount = context$2$0.sent;

                    if (!(freeMachineCount >= machineCount)) {
                        context$2$0.next = 7;
                        break;
                    }

                    return context$2$0.abrupt('return');

                case 7:

                    this._log('The number of free machines (' + freeMachineCount + ') is less than requested (' + machineCount + ').');

                    context$2$0.next = 10;
                    return _regeneratorRuntime.awrap(_utilsWait2.default(requestInterval));

                case 10:
                    attempts++;
                    context$2$0.next = 1;
                    break;

                case 13:
                    throw new Error('There are no free machines');

                case 14:
                case 'end':
                    return context$2$0.stop();
            }
        }, null, this);
    };

    return BrowserStackConnector;
})();

exports.default = BrowserStackConnector;
module.exports = exports.default;