'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TERMINATION_TYPES = {
    sigint: 'sigint',
    sigbreak: 'sigbreak',
    shutdown: 'shutdown'
};

var TERMINATION_LEVEL_INCREASED_EVENT = 'termination-level-increased';

var TerminationHandler = function (_EventEmitter) {
    (0, _inherits3.default)(TerminationHandler, _EventEmitter);

    function TerminationHandler() {
        var _this$handledSignalsC;

        (0, _classCallCheck3.default)(this, TerminationHandler);

        var _this = (0, _possibleConstructorReturn3.default)(this, _EventEmitter.call(this));

        _this.handledSignalsCount = (_this$handledSignalsC = {}, _this$handledSignalsC[TERMINATION_TYPES.sigint] = 0, _this$handledSignalsC[TERMINATION_TYPES.sigbreak] = 0, _this$handledSignalsC[TERMINATION_TYPES.shutdown] = 0, _this$handledSignalsC);

        _this.terminationLevel = 0;

        _this._setupHandlers();
        return _this;
    }

    TerminationHandler.prototype._exitEventHandler = function _exitEventHandler(terminationType) {
        this.handledSignalsCount[terminationType]++;

        if (this.handledSignalsCount[terminationType] > this.terminationLevel) {
            this.terminationLevel = this.handledSignalsCount[terminationType];

            this.emit(TERMINATION_LEVEL_INCREASED_EVENT, this.terminationLevel);
        }
    };

    TerminationHandler.prototype._setupHandlers = function _setupHandlers() {
        var _this2 = this;

        process.on('SIGINT', function () {
            return _this2._exitEventHandler(TERMINATION_TYPES.sigint);
        });
        process.on('SIGBREAK', function () {
            return _this2._exitEventHandler(TERMINATION_TYPES.sigbreak);
        });

        process.on('message', function (message) {
            return message === 'shutdown' && _this2._exitEventHandler(TERMINATION_TYPES.shutdown);
        });
    };

    return TerminationHandler;
}(_events2.default);

exports.default = TerminationHandler;


TerminationHandler.TERMINATION_LEVEL_INCREASED_EVENT = TERMINATION_LEVEL_INCREASED_EVENT;
module.exports = exports['default'];