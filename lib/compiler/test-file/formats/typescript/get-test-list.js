'use strict';

exports.__esModule = true;
exports.getTypeScriptTestListFromCode = exports.getTypeScriptTestList = undefined;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _typescript = require('typescript');

var _typescript2 = _interopRequireDefault(_typescript);

var _lodash = require('lodash');

var _compiler = require('./compiler');

var _compiler2 = _interopRequireDefault(_compiler);

var _testFileParserBase = require('../../test-file-parser-base');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function replaceComments(code) {
    return code.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, function (match) {
        var lastSymbol = match.indexOf('\n') > -1 ? '\n' : ' ';

        return (0, _lodash.repeat)(' ', match.length + lastSymbol);
    });
}

var TypeScriptTestFileParser = function (_TestFileParserBase) {
    (0, _inherits3.default)(TypeScriptTestFileParser, _TestFileParserBase);

    function TypeScriptTestFileParser() {
        (0, _classCallCheck3.default)(this, TypeScriptTestFileParser);
        return (0, _possibleConstructorReturn3.default)(this, _TestFileParserBase.call(this, _typescript2.default.SyntaxKind));
    }

    TypeScriptTestFileParser.prototype.getTokenType = function getTokenType(token) {
        return token.kind;
    };

    TypeScriptTestFileParser.prototype.getFixedStartOffset = function getFixedStartOffset(start) {
        var fixedStartOffset = start;

        while (/\s/.test(this.codeWithoutComments[fixedStartOffset])) {
            ++fixedStartOffset;
        }return fixedStartOffset;
    };

    TypeScriptTestFileParser.prototype.getLocationByOffsets = function getLocationByOffsets(start, end) {
        var fixedStart = this.getFixedStartOffset(start);
        var codeArr = this.codeArr;
        var loc = { start: null, end: null };

        var line = codeArr[0];
        var startTmp = fixedStart;
        var endTmp = end;

        for (var lineNumber = 1; lineNumber <= codeArr.length; ++lineNumber, line = codeArr[lineNumber - 1]) {
            startTmp -= line.length + 1;
            endTmp -= line.length + 1;

            if (startTmp < 0 && !loc.start) loc.start = { line: lineNumber, column: line.length + startTmp + 1 };

            if (endTmp <= 0 || lineNumber === codeArr.length - 1) {
                loc.end = { line: lineNumber, column: line.length + endTmp + 1 };

                break;
            }
        }

        return { loc: loc, start: fixedStart, end: end };
    };

    TypeScriptTestFileParser.prototype.getRValue = function getRValue(token) {
        return token.initializer;
    };

    TypeScriptTestFileParser.prototype.isAsyncFn = function isAsyncFn(token) {
        var _this2 = this;

        var isGeneratorFn = !!token.asteriskToken;
        var isAsyncFn = token.modifiers && token.modifiers.some(function (modifier) {
            return modifier.kind === _this2.tokenType.AsyncKeyword;
        });

        return isGeneratorFn || isAsyncFn;
    };

    TypeScriptTestFileParser.prototype.getFunctionBody = function getFunctionBody(token) {
        return token.body.statements;
    };

    TypeScriptTestFileParser.prototype.formatFnData = function formatFnData(name, value, token) {
        if (value && (typeof value === 'undefined' ? 'undefined' : (0, _typeof3.default)(value)) === 'object') {
            var templatePos = this.getLocationByOffsets(value.pos, value.end);

            value = TypeScriptTestFileParser.formatComputedName(templatePos.loc.start.line);
        }

        var loc = this.getLocationByOffsets(token.pos, token.end);

        return {
            fnName: name,
            value: value,
            loc: loc.loc,
            start: loc.start,
            end: loc.end
        };
    };

    TypeScriptTestFileParser.prototype.analyzeMemberExp = function analyzeMemberExp(token) {
        var exp = token;
        var tokenType = this.tokenType;
        var callStack = [exp];

        while (exp.kind !== this.tokenType.Identifier) {
            exp = exp.expression || exp.tag;

            callStack.push(exp);
        }

        if (exp && this.isApiFn(exp.text)) {
            var parentExp = callStack.pop();

            while (parentExp) {
                if (parentExp.kind === tokenType.CallExpression && parentExp.expression) {
                    var calleeType = parentExp.expression.kind;
                    var calleeMemberFn = calleeType === tokenType.PropertyAccessExpression && parentExp.expression.name.text;

                    if (this.checkExpDefineTargetName(calleeType, calleeMemberFn)) return this.formatFnData(exp.text, this.formatFnArg(parentExp.arguments[0]), token);
                }

                if (parentExp.kind === tokenType.TaggedTemplateExpression && parentExp.tag) {
                    var tagType = parentExp.tag.kind;
                    var tagMemberFn = tagType === tokenType.PropertyAccessExpression && parentExp.tag.name.text;

                    if (this.checkExpDefineTargetName(tagType, tagMemberFn)) return this.formatFnData(exp.text, this.formatFnArg(parentExp), token);
                }

                parentExp = callStack.pop();
            }
        }

        return null;
    };

    TypeScriptTestFileParser.prototype.formatFnArg = function formatFnArg(arg) {
        if (arg.head) return { pos: arg.template.pos, end: arg.template.end };

        if (arg.template) return arg.template.text || { pos: arg.template.pos, end: arg.template.end };

        if (arg.kind === this.tokenType.Identifier) return { pos: arg.pos, end: arg.end };

        if (arg.text && arg.kind !== this.tokenType.NumericLiteral) return arg.text;

        if (arg.kind === this.tokenType.TypeAssertionExpression) return this.formatFnArg(arg.expression);

        return null;
    };

    TypeScriptTestFileParser.prototype.getFnCall = function getFnCall(token) {
        if (this.isApiFn(token.expression.text)) return this.formatFnData(token.expression.text, this.formatFnArg(token.arguments[0]), token);

        return null;
    };

    TypeScriptTestFileParser.prototype.getTaggedTemplateExp = function getTaggedTemplateExp(token) {
        if (this.isApiFn(token.tag.text)) return this.formatFnData(token.tag.text, this.formatFnArg(token), token);

        return null;
    };

    TypeScriptTestFileParser.prototype.analyzeFnCall = function analyzeFnCall(token) {
        var tokenType = this.tokenType;

        if (token.kind === tokenType.PropertyAccessExpression) return this.analyzeMemberExp(token);

        if (token.kind === tokenType.CallExpression) {
            var expKind = token.expression.kind;

            if (expKind === tokenType.PropertyAccessExpression || expKind === tokenType.CallExpression) return this.analyzeMemberExp(token);

            if (expKind === tokenType.ParenthesizedExpression) return this.analyzeFnCall(token.expression.expression);

            return this.getFnCall(token);
        }

        if (token.kind === tokenType.FunctionExpression || token.kind === tokenType.ArrowFunction) return this.collectTestCafeCalls(this.getFunctionBody(token));

        if (token.kind === tokenType.TaggedTemplateExpression) {
            if (token.tag.kind === tokenType.PropertyAccessExpression || token.tag.kind === tokenType.CallExpression) return this.analyzeMemberExp(token);

            return this.getTaggedTemplateExp(token);
        }

        return null;
    };

    TypeScriptTestFileParser.prototype.parse = function parse(code) {
        //NOTE: TypeScript calculates start position of a token incorrectly
        //It doesn't consider spaces and comments between the last token and the current token.
        //So we replace comments with space symbols to calculate fixed position.
        //We just increment position until we meet non whitespace characters
        this.codeArr = code.split('\n');
        this.codeWithoutComments = replaceComments(code);

        var sourceFile = _typescript2.default.createSourceFile('', code, _compiler2.default._getTypescriptOptions(), true);

        return this.analyze(sourceFile.statements);
    };

    return TypeScriptTestFileParser;
}(_testFileParserBase.TestFileParserBase);

var parser = new TypeScriptTestFileParser();

var getTypeScriptTestList = exports.getTypeScriptTestList = parser.getTestList.bind(parser);
var getTypeScriptTestListFromCode = exports.getTypeScriptTestListFromCode = parser.getTestListFromCode.bind(parser);