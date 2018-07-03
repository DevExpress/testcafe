'use strict';

exports.__esModule = true;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _assertion = require('../../test-run/commands/assertion');

var _assertion2 = _interopRequireDefault(_assertion);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Assertion = function () {
    function Assertion(actual, testController) {
        (0, _classCallCheck3.default)(this, Assertion);

        this.testController = testController;
        this.actual = actual;
    }

    Assertion.prototype._enqueueAssertion = function _enqueueAssertion(apiMethodName, assertionArgs) {
        var options = assertionArgs.opts || {};
        var message = assertionArgs.message;

        if ((typeof message === 'undefined' ? 'undefined' : (0, _typeof3.default)(message)) === 'object') {
            options = assertionArgs.message;
            message = void 0;
        }

        return this.testController._enqueueCommand(apiMethodName, _assertion2.default, {
            assertionType: apiMethodName,
            actual: this.actual,
            expected: assertionArgs.expected,
            expected2: assertionArgs.expected2,
            message: message,
            options: { timeout: options.timeout, allowUnawaitedPromise: options.allowUnawaitedPromise }
        });
    };

    Assertion.prototype.eql = function eql(expected, message, opts) {
        return this._enqueueAssertion('eql', { expected: expected, message: message, opts: opts });
    };

    Assertion.prototype.notEql = function notEql(expected, message, opts) {
        return this._enqueueAssertion('notEql', { expected: expected, message: message, opts: opts });
    };

    Assertion.prototype.ok = function ok(message, opts) {
        return this._enqueueAssertion('ok', { message: message, opts: opts });
    };

    Assertion.prototype.notOk = function notOk(message, opts) {
        return this._enqueueAssertion('notOk', { message: message, opts: opts });
    };

    Assertion.prototype.contains = function contains(expected, message, opts) {
        return this._enqueueAssertion('contains', { expected: expected, message: message, opts: opts });
    };

    Assertion.prototype.notContains = function notContains(expected, message, opts) {
        return this._enqueueAssertion('notContains', { expected: expected, message: message, opts: opts });
    };

    Assertion.prototype.typeOf = function typeOf(expected, message, opts) {
        return this._enqueueAssertion('typeOf', { expected: expected, message: message, opts: opts });
    };

    Assertion.prototype.notTypeOf = function notTypeOf(expected, message, opts) {
        return this._enqueueAssertion('notTypeOf', { expected: expected, message: message, opts: opts });
    };

    Assertion.prototype.gt = function gt(expected, message, opts) {
        return this._enqueueAssertion('gt', { expected: expected, message: message, opts: opts });
    };

    Assertion.prototype.gte = function gte(expected, message, opts) {
        return this._enqueueAssertion('gte', { expected: expected, message: message, opts: opts });
    };

    Assertion.prototype.lt = function lt(expected, message, opts) {
        return this._enqueueAssertion('lt', { expected: expected, message: message, opts: opts });
    };

    Assertion.prototype.lte = function lte(expected, message, opts) {
        return this._enqueueAssertion('lte', { expected: expected, message: message, opts: opts });
    };

    Assertion.prototype.within = function within(start, finish, message, opts) {
        // NOTE: `within` is not available in Chai `assert` interface.
        return this._enqueueAssertion('within', { expected: start, expected2: finish, message: message, opts: opts });
    };

    Assertion.prototype.notWithin = function notWithin(start, finish, message, opts) {
        return this._enqueueAssertion('notWithin', { expected: start, expected2: finish, message: message, opts: opts });
    };

    Assertion.prototype.match = function match(expected, message, opts) {
        return this._enqueueAssertion('match', { expected: expected, message: message, opts: opts });
    };

    Assertion.prototype.notMatch = function notMatch(expected, message, opts) {
        return this._enqueueAssertion('notMatch', { expected: expected, message: message, opts: opts });
    };

    return Assertion;
}();

exports.default = Assertion;
module.exports = exports['default'];