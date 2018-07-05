'use strict';

exports.__esModule = true;
exports.SelectorNodeTransform = exports.FunctionTransform = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

exports.createReplicator = createReplicator;

var _lodash = require('lodash');

var _replicator = require('replicator');

var _replicator2 = _interopRequireDefault(_replicator);

var _builderSymbol = require('./builder-symbol');

var _builderSymbol2 = _interopRequireDefault(_builderSymbol);

var _compileClientFunction = require('../compiler/compile-client-function');

var _compileClientFunction2 = _interopRequireDefault(_compileClientFunction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createReplicator(transforms) {
    // NOTE: we will serialize replicator results
    // to JSON with a command or command result.
    // Therefore there is no need to do additional job here,
    // so we use identity functions for serialization.
    var replicator = new _replicator2.default({
        serialize: _lodash.identity,
        deserialize: _lodash.identity
    });

    return replicator.addTransforms(transforms);
}

// Replicator transforms

var FunctionTransform = exports.FunctionTransform = function () {
    function FunctionTransform(callsiteNames) {
        (0, _classCallCheck3.default)(this, FunctionTransform);

        this.type = 'Function';
        this.callsiteNames = callsiteNames;
    }

    FunctionTransform.prototype.shouldTransform = function shouldTransform(type) {
        return type === 'function';
    };

    FunctionTransform.prototype.toSerializable = function toSerializable(fn) {
        var clientFnBuilder = fn[_builderSymbol2.default];

        if (clientFnBuilder) {
            return {
                fnCode: clientFnBuilder.compiledFnCode,
                dependencies: clientFnBuilder.getFunctionDependencies()
            };
        }

        return {
            fnCode: (0, _compileClientFunction2.default)(fn.toString(), null, this.callsiteNames.instantiation, this.callsiteNames.execution),
            dependencies: {}
        };
    };

    FunctionTransform.prototype.fromSerializable = function fromSerializable() {
        return void 0;
    };

    return FunctionTransform;
}();

var SelectorNodeTransform = exports.SelectorNodeTransform = function () {
    function SelectorNodeTransform() {
        (0, _classCallCheck3.default)(this, SelectorNodeTransform);

        this.type = 'Node';
    }

    SelectorNodeTransform.prototype.shouldTransform = function shouldTransform() {
        return false;
    };

    SelectorNodeTransform.prototype.fromSerializable = function fromSerializable(nodeSnapshot) {
        return nodeSnapshot;
    };

    return SelectorNodeTransform;
}();