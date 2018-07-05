'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _pinkie = require('pinkie');

var _pinkie2 = _interopRequireDefault(_pinkie);

var _lodash = require('lodash');

var _testRunTracker = require('../api/test-run-tracker');

var _testRunTracker2 = _interopRequireDefault(_testRunTracker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ReExecutablePromise = function (_Promise) {
    (0, _inherits3.default)(ReExecutablePromise, _Promise);

    function ReExecutablePromise(executorFn) {
        (0, _classCallCheck3.default)(this, ReExecutablePromise);

        var _this = (0, _possibleConstructorReturn3.default)(this, _Promise.call(this, _lodash.noop));

        _this._fn = executorFn;
        _this._taskPromise = null;
        return _this;
    }

    ReExecutablePromise.prototype._ensureExecuting = function _ensureExecuting() {
        if (!this._taskPromise) this._taskPromise = new _pinkie2.default(this._fn);
    };

    ReExecutablePromise.prototype._reExecute = function _reExecute() {
        this._taskPromise = null;

        return this;
    };

    ReExecutablePromise.prototype.then = function then(onFulfilled, onRejected) {
        this._ensureExecuting();

        return this._taskPromise.then(onFulfilled, onRejected);
    };

    ReExecutablePromise.prototype.catch = function _catch(onRejected) {
        this._ensureExecuting();

        return this._taskPromise.catch(onRejected);
    };

    ReExecutablePromise.fromFn = function fromFn(asyncExecutorFn) {
        var testRunId = _testRunTracker2.default.getContextTestRunId();

        if (testRunId) asyncExecutorFn = _testRunTracker2.default.addTrackingMarkerToFunction(testRunId, asyncExecutorFn);

        return new ReExecutablePromise(function (resolve) {
            return resolve(asyncExecutorFn());
        });
    };

    return ReExecutablePromise;
}(_pinkie2.default);

exports.default = ReExecutablePromise;
module.exports = exports['default'];