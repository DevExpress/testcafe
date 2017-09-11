import { assign } from 'lodash';
import { transform } from 'babel-core';
import ESNextTestFileCompiler from './compiler';
import { TestFileParserBase } from '../../test-file-parser-base';

const TOKEN_TYPE = {
    Identifier:               'Identifier',
    PropertyAccessExpression: 'MemberExpression',
    CallExpression:           'CallExpression',
    TaggedTemplateExpression: 'TaggedTemplateExpression',
    TemplateLiteral:          'TemplateLiteral',
    StringLiteral:            'StringLiteral',
    ArrowFunctionExpression:  'ArrowFunctionExpression',
    FunctionExpression:       'FunctionExpression',
    ExpressionStatement:      'ExpressionStatement',
    FunctionDeclaration:      'FunctionDeclaration',
    VariableDeclaration:      'VariableDeclaration'
};

class EsNextTestFileParser extends TestFileParserBase {
    constructor () {
        super(TOKEN_TYPE);
    }

    static getTagStrValue (exp) {
        //NOTE: we set <computed name> if template literal has at least one computed substring ${...}
        return exp.expressions.length ? EsNextTestFileParser.formatComputedName(exp.loc.start.line) : exp.quasis[0].value.raw;
    }

    isAsyncFn (token) {
        return token.async || token.generator;
    }

    getTokenType (token) {
        return token.type;
    }

    getRValue (token) {
        return token.declarations[0].init;
    }

    getFunctionBody (token) {
        return token.body && token.body.body ? token.body.body : [];
    }

    formatFnData (name, value, token) {
        return {
            fnName: name,
            value:  value,
            loc:    token.loc,
            start:  token.start,
            end:    token.end
        };
    }

    analyzeMemberExp (token) {
        let exp         = token;
        const tokenType = this.tokenType;
        const callStack = [exp];

        while (exp.type !== tokenType.Identifier) {
            if (exp.type === tokenType.CallExpression)
                exp = exp.callee;

            else if (exp.type === tokenType.PropertyAccessExpression)
                exp = exp.object;

            else if (exp.type === tokenType.TaggedTemplateExpression)
                exp = exp.tag;

            else
                return null;

            if (exp.type !== tokenType.Identifier)
                callStack.push(exp);
        }

        if (!this.isApiFn(exp.name)) return null;

        let parentExp = callStack.pop();

        if (parentExp.type === tokenType.CallExpression)
            return this.formatFnData(exp.name, this.formatFnArg(parentExp.arguments[0]), token);

        if (parentExp.type === tokenType.TaggedTemplateExpression)
            return this.formatFnData(exp.name, EsNextTestFileParser.getTagStrValue(parentExp.quasi), token);

        if (parentExp.type === tokenType.PropertyAccessExpression) {
            while (parentExp) {
                if (parentExp.type === tokenType.CallExpression && parentExp.callee) {
                    const calleeType     = parentExp.callee.type;
                    const calleeMemberFn = parentExp.callee.property && parentExp.callee.property.name;

                    if (this.checkExpDefineTargetName(calleeType, calleeMemberFn))
                        return this.formatFnData(exp.name, this.formatFnArg(parentExp.arguments[0]), token);
                }

                if (parentExp.type === tokenType.TaggedTemplateExpression && parentExp.tag) {
                    const tagType     = parentExp.tag.type;
                    const tagMemberFn = parentExp.tag.property && parentExp.tag.property.name;

                    if (this.checkExpDefineTargetName(tagType, tagMemberFn))
                        return this.formatFnData(exp.name, EsNextTestFileParser.getTagStrValue(parentExp.quasi), token);
                }

                parentExp = callStack.pop();
            }
        }

        return null;
    }

    formatFnArg (arg) {
        if (arg.type === this.tokenType.Identifier)
            return EsNextTestFileParser.formatComputedName(arg.loc.start.line);

        if (arg.type === this.tokenType.TemplateLiteral)
            return EsNextTestFileParser.getTagStrValue(arg);

        if (arg.type === this.tokenType.StringLiteral)
            return arg.value;

        return null;
    }

    getFnCall (token) {
        if (!this.isApiFn(token.callee.name)) return null;

        return this.formatFnData(token.callee.name, this.formatFnArg(token.arguments[0]), token);
    }

    getTaggedTemplateExp (token) {
        return this.formatFnData(token.tag.name, EsNextTestFileParser.getTagStrValue(token.quasi), token);
    }

    analyzeFnCall (token) {
        const tokenType = this.tokenType;

        if (token.type === tokenType.PropertyAccessExpression)
            return this.analyzeMemberExp(token);

        if (token.type === tokenType.CallExpression) {
            const calleeType = token.callee.type;

            if (calleeType === tokenType.PropertyAccessExpression || calleeType === tokenType.CallExpression)
                return this.analyzeMemberExp(token);

            if (calleeType === tokenType.FunctionExpression || calleeType === tokenType.ArrowFunctionExpression)
                return this.collectTestCafeCalls(token.callee.body.body);

            return this.getFnCall(token);
        }

        if (token.type === tokenType.TaggedTemplateExpression) {
            if (token.tag.type === tokenType.PropertyAccessExpression)
                return this.analyzeMemberExp(token);

            return this.getTaggedTemplateExp(token);
        }

        return null;
    }

    parse (code) {
        const compilerOptions = ESNextTestFileCompiler.getBabelOptions(null, code);

        delete compilerOptions.filename;

        const opts = assign(compilerOptions, { ast: true });
        const ast  = transform(code, opts).ast;

        return this.analyze(ast.program.body);
    }
}

const parser = new EsNextTestFileParser();

export const getTestList         = parser.getTestList.bind(parser);
export const getTestListFromCode = parser.getTestListFromCode.bind(parser);
