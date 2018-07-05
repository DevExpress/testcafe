'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _lodash = require('lodash');

var _dedent = require('dedent');

var _dedent2 = _interopRequireDefault(_dedent);

var _clientFunctionBuilder = require('../client-function-builder');

var _clientFunctionBuilder2 = _interopRequireDefault(_clientFunctionBuilder);

var _replicator = require('../replicator');

var _runtime = require('../../errors/runtime');

var _builderSymbol = require('../builder-symbol');

var _builderSymbol2 = _interopRequireDefault(_builderSymbol);

var _message = require('../../errors/runtime/message');

var _message2 = _interopRequireDefault(_message);

var _typeAssertions = require('../../errors/runtime/type-assertions');

var _observation = require('../../test-run/commands/observation');

var _defineLazyProperty = require('../../utils/define-lazy-property');

var _defineLazyProperty2 = _interopRequireDefault(_defineLazyProperty);

var _addApi = require('./add-api');

var _createSnapshotMethods = require('./create-snapshot-methods');

var _createSnapshotMethods2 = _interopRequireDefault(_createSnapshotMethods);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SelectorBuilder = function (_ClientFunctionBuilde) {
    (0, _inherits3.default)(SelectorBuilder, _ClientFunctionBuilde);

    function SelectorBuilder(fn, options, callsiteNames) {
        (0, _classCallCheck3.default)(this, SelectorBuilder);

        var builderFromSelector = fn && fn[_builderSymbol2.default];
        var builderFromPromiseOrSnapshot = fn && fn.selector && fn.selector[_builderSymbol2.default];
        var builder = builderFromSelector || builderFromPromiseOrSnapshot;

        builder = builder instanceof SelectorBuilder ? builder : null;

        if (builder) {
            fn = builder.fn;

            if (options === void 0 || (typeof options === 'undefined' ? 'undefined' : (0, _typeof3.default)(options)) === 'object') options = (0, _lodash.merge)({}, builder.options, options, { sourceSelectorBuilder: builder });
        }

        return (0, _possibleConstructorReturn3.default)(this, _ClientFunctionBuilde.call(this, fn, options, callsiteNames));
    }

    SelectorBuilder.prototype._getCompiledFnCode = function _getCompiledFnCode() {
        // OPTIMIZATION: if selector was produced from another selector and
        // it has same dependencies as source selector, then we can
        // avoid recompilation and just re-use already compiled code.
        var hasSameDependenciesAsSourceSelector = this.options.sourceSelectorBuilder && this.options.sourceSelectorBuilder.options.dependencies === this.options.dependencies;

        if (hasSameDependenciesAsSourceSelector) return this.options.sourceSelectorBuilder.compiledFnCode;

        var code = typeof this.fn === 'string' ? '(function(){return document.querySelectorAll(' + (0, _stringify2.default)(this.fn) + ');});' : _ClientFunctionBuilde.prototype._getCompiledFnCode.call(this);

        if (code) {
            return (0, _dedent2.default)('(function(){\n                    var __f$=' + code + ';\n                    return function(){\n                        var args = __dependencies$.boundArgs || arguments;\n                        return window[\'%testCafeSelectorFilter%\'](__f$.apply(this, args), __dependencies$.filterOptions);\n                    };\n                 })();');
        }

        return null;
    };

    SelectorBuilder.prototype._createInvalidFnTypeError = function _createInvalidFnTypeError() {
        return new _runtime.ClientFunctionAPIError(this.callsiteNames.instantiation, this.callsiteNames.instantiation, _message2.default.selectorInitializedWithWrongType, (0, _typeof3.default)(this.fn));
    };

    SelectorBuilder.prototype._executeCommand = function _executeCommand(args, testRun, callsite) {
        var resultPromise = _ClientFunctionBuilde.prototype._executeCommand.call(this, args, testRun, callsite);

        this._addBoundArgsSelectorGetter(resultPromise, args);

        // OPTIMIZATION: use buffer function as selector not to trigger lazy property ahead of time
        (0, _addApi.addAPI)(resultPromise, function () {
            return resultPromise.selector;
        }, SelectorBuilder, this.options.customDOMProperties, this.options.customMethods);

        return resultPromise;
    };

    SelectorBuilder.prototype.getFunctionDependencies = function getFunctionDependencies() {
        var dependencies = _ClientFunctionBuilde.prototype.getFunctionDependencies.call(this);
        var customDOMProperties = this.options.customDOMProperties;
        var customMethods = this.options.customMethods;

        return (0, _lodash.merge)({}, dependencies, {
            filterOptions: {
                filterVisible: this.options.filterVisible,
                filterHidden: this.options.filterHidden,
                counterMode: this.options.counterMode,
                collectionMode: this.options.collectionMode,
                index: (0, _lodash.isNil)(this.options.index) ? null : this.options.index
            },

            boundArgs: this.options.boundArgs,
            customDOMProperties: customDOMProperties,
            customMethods: customMethods
        });
    };

    SelectorBuilder.prototype._createTestRunCommand = function _createTestRunCommand(encodedArgs, encodedDependencies) {
        return new _observation.ExecuteSelectorCommand({
            instantiationCallsiteName: this.callsiteNames.instantiation,
            fnCode: this.compiledFnCode,
            args: encodedArgs,
            dependencies: encodedDependencies,
            visibilityCheck: !!this.options.visibilityCheck,
            timeout: this.options.timeout
        });
    };

    SelectorBuilder.prototype._validateOptions = function _validateOptions(options) {
        _ClientFunctionBuilde.prototype._validateOptions.call(this, options);

        if (!(0, _lodash.isNil)(options.visibilityCheck)) (0, _typeAssertions.assertType)(_typeAssertions.is.boolean, this.callsiteNames.instantiation, '"visibilityCheck" option', options.visibilityCheck);

        if (!(0, _lodash.isNil)(options.timeout)) (0, _typeAssertions.assertType)(_typeAssertions.is.nonNegativeNumber, this.callsiteNames.instantiation, '"timeout" option', options.timeout);
    };

    SelectorBuilder.prototype._getReplicatorTransforms = function _getReplicatorTransforms() {
        var transforms = _ClientFunctionBuilde.prototype._getReplicatorTransforms.call(this);

        transforms.push(new _replicator.SelectorNodeTransform());

        return transforms;
    };

    SelectorBuilder.prototype._addBoundArgsSelectorGetter = function _addBoundArgsSelectorGetter(obj, selectorArgs) {
        var _this2 = this;

        (0, _defineLazyProperty2.default)(obj, 'selector', function () {
            var builder = new SelectorBuilder(_this2.getFunction(), { boundArgs: selectorArgs });

            return builder.getFunction();
        });
    };

    SelectorBuilder.prototype._decorateFunction = function _decorateFunction(selectorFn) {
        _ClientFunctionBuilde.prototype._decorateFunction.call(this, selectorFn);

        (0, _addApi.addAPI)(selectorFn, function () {
            return selectorFn;
        }, SelectorBuilder, this.options.customDOMProperties, this.options.customMethods);
    };

    SelectorBuilder.prototype._processResult = function _processResult(result, selectorArgs) {
        var snapshot = _ClientFunctionBuilde.prototype._processResult.call(this, result, selectorArgs);

        if (snapshot && !this.options.counterMode) {
            this._addBoundArgsSelectorGetter(snapshot, selectorArgs);
            (0, _createSnapshotMethods2.default)(snapshot);

            if (this.options.customMethods) (0, _addApi.addCustomMethods)(snapshot, function () {
                return snapshot.selector;
            }, SelectorBuilder, this.options.customMethods);
        }

        return snapshot;
    };

    return SelectorBuilder;
}(_clientFunctionBuilder2.default);

exports.default = SelectorBuilder;
module.exports = exports['default'];