'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _lodash = require('lodash');

var _testRunTracker = require('../api/test-run-tracker');

var _testRunTracker2 = _interopRequireDefault(_testRunTracker);

var _builderSymbol = require('./builder-symbol');

var _builderSymbol2 = _interopRequireDefault(_builderSymbol);

var _replicator = require('./replicator');

var _observation = require('../test-run/commands/observation');

var _compileClientFunction = require('../compiler/compile-client-function');

var _compileClientFunction2 = _interopRequireDefault(_compileClientFunction);

var _runtime = require('../errors/runtime');

var _typeAssertions = require('../errors/runtime/type-assertions');

var _message = require('../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

var _getCallsite = require('../errors/get-callsite');

var _reExecutablePromise = require('../utils/re-executable-promise');

var _reExecutablePromise2 = _interopRequireDefault(_reExecutablePromise);

var _markerSymbol = require('../test-run/marker-symbol');

var _markerSymbol2 = _interopRequireDefault(_markerSymbol);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_EXECUTION_CALLSITE_NAME = '__$$clientFunction$$';

var ClientFunctionBuilder = function () {
    function ClientFunctionBuilder(fn, options) {
        var callsiteNames = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        (0, _classCallCheck3.default)(this, ClientFunctionBuilder);

        this.callsiteNames = {
            instantiation: callsiteNames.instantiation,
            execution: callsiteNames.execution || DEFAULT_EXECUTION_CALLSITE_NAME
        };

        if ((0, _lodash.isNil)(options)) options = {};

        this._validateOptions(options);

        this.fn = fn;
        this.options = options;
        this.compiledFnCode = this._getCompiledFnCode();

        if (!this.compiledFnCode) throw this._createInvalidFnTypeError();

        this.replicator = (0, _replicator.createReplicator)(this._getReplicatorTransforms());
    }

    ClientFunctionBuilder.prototype._decorateFunction = function _decorateFunction(clientFn) {
        var _this = this;

        clientFn[_builderSymbol2.default] = this;

        clientFn.with = function (options) {
            if ((typeof options === 'undefined' ? 'undefined' : (0, _typeof3.default)(options)) === 'object') options = (0, _lodash.assign)({}, _this.options, options);

            var builder = new _this.constructor(_this.fn, options, {
                instantiation: 'with',
                execution: _this.callsiteNames.execution
            });

            return builder.getFunction();
        };
    };

    ClientFunctionBuilder.prototype.getBoundTestRun = function getBoundTestRun() {
        // NOTE: `boundTestRun` can be either TestController or TestRun instance.
        if (this.options.boundTestRun) return this.options.boundTestRun.testRun || this.options.boundTestRun;

        return null;
    };

    ClientFunctionBuilder.prototype.getFunction = function getFunction() {
        var builder = this;

        var clientFn = function __$$clientFunction$$() {
            var testRun = builder.getBoundTestRun() || _testRunTracker2.default.resolveContextTestRun();
            var callsite = (0, _getCallsite.getCallsiteForMethod)(builder.callsiteNames.execution);
            var args = [];

            // OPTIMIZATION: don't leak `arguments` object.
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }return builder._executeCommand(args, testRun, callsite);
        };

        this._decorateFunction(clientFn);

        return clientFn;
    };

    ClientFunctionBuilder.prototype.getCommand = function getCommand(args) {
        var encodedArgs = this.replicator.encode(args);
        var encodedDependencies = this.replicator.encode(this.getFunctionDependencies());

        return this._createTestRunCommand(encodedArgs, encodedDependencies);
    };

    // Overridable methods


    ClientFunctionBuilder.prototype.getFunctionDependencies = function getFunctionDependencies() {
        return this.options.dependencies || {};
    };

    ClientFunctionBuilder.prototype._createTestRunCommand = function _createTestRunCommand(encodedArgs, encodedDependencies) {
        return new _observation.ExecuteClientFunctionCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode: this.compiledFnCode,
            args: encodedArgs,
            dependencies: encodedDependencies
        });
    };

    ClientFunctionBuilder.prototype._getCompiledFnCode = function _getCompiledFnCode() {
        if (typeof this.fn === 'function') return (0, _compileClientFunction2.default)(this.fn.toString(), this.options.dependencies, this.callsiteNames.instantiation, this.callsiteNames.instantiation);

        return null;
    };

    ClientFunctionBuilder.prototype._createInvalidFnTypeError = function _createInvalidFnTypeError() {
        return new _runtime.ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, _message2.default.clientFunctionCodeIsNotAFunction, (0, _typeof3.default)(this.fn));
    };

    ClientFunctionBuilder.prototype._executeCommand = function _executeCommand(args, testRun, callsite) {
        var _this2 = this;

        // NOTE: should be kept outside of lazy promise to preserve
        // correct callsite in case of replicator error.
        var command = this.getCommand(args);

        return _reExecutablePromise2.default.fromFn((0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
            var err, result;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (testRun) {
                                _context.next = 4;
                                break;
                            }

                            err = new _runtime.ClientFunctionAPIError(_this2.callsiteNames.execution, _this2.callsiteNames.instantiation, _message2.default.clientFunctionCantResolveTestRun);

                            // NOTE: force callsite here, because more likely it will
                            // be impossible to resolve it by method name from a lazy promise.

                            err.callsite = callsite;

                            throw err;

                        case 4:
                            _context.next = 6;
                            return testRun.executeCommand(command, callsite);

                        case 6:
                            result = _context.sent;
                            return _context.abrupt('return', _this2._processResult(result, args));

                        case 8:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this2);
        })));
    };

    ClientFunctionBuilder.prototype._processResult = function _processResult(result) {
        return this.replicator.decode(result);
    };

    ClientFunctionBuilder.prototype._validateOptions = function _validateOptions(options) {
        (0, _typeAssertions.assertType)(_typeAssertions.is.nonNullObject, this.callsiteNames.instantiation, '"options" argument', options);

        if (!(0, _lodash.isNil)(options.boundTestRun)) {
            // NOTE: `boundTestRun` can be either TestController or TestRun instance.
            var boundTestRun = options.boundTestRun.testRun || options.boundTestRun;

            if (!boundTestRun[_markerSymbol2.default]) throw new _runtime.APIError(this.callsiteNames.instantiation, _message2.default.invalidClientFunctionTestRunBinding);
        }

        if (!(0, _lodash.isNil)(options.dependencies)) (0, _typeAssertions.assertType)(_typeAssertions.is.nonNullObject, this.callsiteNames.instantiation, '"dependencies" option', options.dependencies);
    };

    ClientFunctionBuilder.prototype._getReplicatorTransforms = function _getReplicatorTransforms() {
        return [new _replicator.FunctionTransform(this.callsiteNames)];
    };

    return ClientFunctionBuilder;
}();

exports.default = ClientFunctionBuilder;
module.exports = exports['default'];