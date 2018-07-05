'use strict';

exports.__esModule = true;
exports.getTestListFromCode = exports.getTestList = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _lodash = require('lodash');

var _babelCore = require('babel-core');

var _compiler = require('./compiler');

var _compiler2 = _interopRequireDefault(_compiler);

var _testFileParserBase = require('../../test-file-parser-base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TOKEN_TYPE = {
    Identifier: 'Identifier',
    PropertyAccessExpression: 'MemberExpression',
    CallExpression: 'CallExpression',
    TaggedTemplateExpression: 'TaggedTemplateExpression',
    TemplateLiteral: 'TemplateLiteral',
    StringLiteral: 'StringLiteral',
    ArrowFunctionExpression: 'ArrowFunctionExpression',
    FunctionExpression: 'FunctionExpression',
    ExpressionStatement: 'ExpressionStatement',
    FunctionDeclaration: 'FunctionDeclaration',
    VariableDeclaration: 'VariableDeclaration'
};

var EsNextTestFileParser = function (_TestFileParserBase) {
    (0, _inherits3.default)(EsNextTestFileParser, _TestFileParserBase);

    function EsNextTestFileParser() {
        (0, _classCallCheck3.default)(this, EsNextTestFileParser);
        return (0, _possibleConstructorReturn3.default)(this, _TestFileParserBase.call(this, TOKEN_TYPE));
    }

    EsNextTestFileParser.getTagStrValue = function getTagStrValue(exp) {
        //NOTE: we set <computed name> if template literal has at least one computed substring ${...}
        return exp.expressions.length ? EsNextTestFileParser.formatComputedName(exp.loc.start.line) : exp.quasis[0].value.raw;
    };

    EsNextTestFileParser.prototype.isAsyncFn = function isAsyncFn(token) {
        return token.async || token.generator;
    };

    EsNextTestFileParser.prototype.getTokenType = function getTokenType(token) {
        return token.type;
    };

    EsNextTestFileParser.prototype.getRValue = function getRValue(token) {
        return token.declarations[0].init;
    };

    EsNextTestFileParser.prototype.getFunctionBody = function getFunctionBody(token) {
        return token.body && token.body.body ? token.body.body : [];
    };

    EsNextTestFileParser.prototype.formatFnData = function formatFnData(name, value, token) {
        return {
            fnName: name,
            value: value,
            loc: token.loc,
            start: token.start,
            end: token.end
        };
    };

    EsNextTestFileParser.prototype.analyzeMemberExp = function analyzeMemberExp(token) {
        var exp = token;
        var tokenType = this.tokenType;
        var callStack = [exp];

        while (exp.type !== tokenType.Identifier) {
            if (exp.type === tokenType.CallExpression) exp = exp.callee;else if (exp.type === tokenType.PropertyAccessExpression) exp = exp.object;else if (exp.type === tokenType.TaggedTemplateExpression) exp = exp.tag;else return null;

            if (exp.type !== tokenType.Identifier) callStack.push(exp);
        }

        if (!this.isApiFn(exp.name)) return null;

        var parentExp = callStack.pop();

        if (parentExp.type === tokenType.CallExpression) return this.formatFnData(exp.name, this.formatFnArg(parentExp.arguments[0]), token);

        if (parentExp.type === tokenType.TaggedTemplateExpression) return this.formatFnData(exp.name, EsNextTestFileParser.getTagStrValue(parentExp.quasi), token);

        if (parentExp.type === tokenType.PropertyAccessExpression) {
            while (parentExp) {
                if (parentExp.type === tokenType.CallExpression && parentExp.callee) {
                    var calleeType = parentExp.callee.type;
                    var calleeMemberFn = parentExp.callee.property && parentExp.callee.property.name;

                    if (this.checkExpDefineTargetName(calleeType, calleeMemberFn)) return this.formatFnData(exp.name, this.formatFnArg(parentExp.arguments[0]), token);
                }

                if (parentExp.type === tokenType.TaggedTemplateExpression && parentExp.tag) {
                    var tagType = parentExp.tag.type;
                    var tagMemberFn = parentExp.tag.property && parentExp.tag.property.name;

                    if (this.checkExpDefineTargetName(tagType, tagMemberFn)) return this.formatFnData(exp.name, EsNextTestFileParser.getTagStrValue(parentExp.quasi), token);
                }

                parentExp = callStack.pop();
            }
        }

        return null;
    };

    EsNextTestFileParser.prototype.formatFnArg = function formatFnArg(arg) {
        if (arg.type === this.tokenType.Identifier) return EsNextTestFileParser.formatComputedName(arg.loc.start.line);

        if (arg.type === this.tokenType.TemplateLiteral) return EsNextTestFileParser.getTagStrValue(arg);

        if (arg.type === this.tokenType.StringLiteral) return arg.value;

        return null;
    };

    EsNextTestFileParser.prototype.getFnCall = function getFnCall(token) {
        if (!this.isApiFn(token.callee.name)) return null;

        return this.formatFnData(token.callee.name, this.formatFnArg(token.arguments[0]), token);
    };

    EsNextTestFileParser.prototype.getTaggedTemplateExp = function getTaggedTemplateExp(token) {
        return this.formatFnData(token.tag.name, EsNextTestFileParser.getTagStrValue(token.quasi), token);
    };

    EsNextTestFileParser.prototype.analyzeFnCall = function analyzeFnCall(token) {
        var tokenType = this.tokenType;

        if (token.type === tokenType.PropertyAccessExpression) return this.analyzeMemberExp(token);

        if (token.type === tokenType.CallExpression) {
            var calleeType = token.callee.type;

            if (calleeType === tokenType.PropertyAccessExpression || calleeType === tokenType.CallExpression) return this.analyzeMemberExp(token);

            if (calleeType === tokenType.FunctionExpression || calleeType === tokenType.ArrowFunctionExpression) return this.collectTestCafeCalls(token.callee.body.body);

            return this.getFnCall(token);
        }

        if (token.type === tokenType.TaggedTemplateExpression) {
            if (token.tag.type === tokenType.PropertyAccessExpression) return this.analyzeMemberExp(token);

            return this.getTaggedTemplateExp(token);
        }

        return null;
    };

    EsNextTestFileParser.prototype.parse = function parse(code) {
        var compilerOptions = _compiler2.default.getBabelOptions(null, code);

        delete compilerOptions.filename;

        var opts = (0, _lodash.assign)(compilerOptions, { ast: true });
        var ast = (0, _babelCore.transform)(code, opts).ast;

        return this.analyze(ast.program.body);
    };

    return EsNextTestFileParser;
}(_testFileParserBase.TestFileParserBase);

var parser = new EsNextTestFileParser();

var getTestList = exports.getTestList = parser.getTestList.bind(parser);
var getTestListFromCode = exports.getTestListFromCode = parser.getTestListFromCode.bind(parser);