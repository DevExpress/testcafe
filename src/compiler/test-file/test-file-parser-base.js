import fs from 'fs';
import promisify from '../../utils/promisify';
import { format } from 'util';
import { GeneralError } from '../../errors/runtime';
import { RUNTIME_ERRORS } from '../../errors/types';

const readFile = promisify(fs.readFile);

const METHODS_SPECIFYING_NAME = ['only', 'skip'];
const COMPUTED_NAME_TEXT_TMP  = '<computed name>(line: %s)';

export class Fixture {
    constructor (name, start, end, loc, meta) {
        this.name  = name;
        this.loc   = loc;
        this.start = start;
        this.end   = end;
        this.meta  = meta;
        this.tests = [];
    }
}

export class Test {
    constructor (name, start, end, loc, meta) {
        this.name  = name;
        this.loc   = loc;
        this.start = start;
        this.end   = end;
        this.meta  = meta;
    }
}

export class TestFileParserBase {
    constructor (tokenType) {
        this.tokenType = tokenType;
    }

    static formatComputedName (line) {
        return format(COMPUTED_NAME_TEXT_TMP, line);
    }

    isAsyncFn (/* token */) {
        throw new Error('Not implemented');
    }

    getRValue (/* token */) {
        throw new Error('Not implemented');
    }

    getFunctionBody (/* token */) {
        throw new Error('Not implemented');
    }

    formatFnData (/* name, value, token */) {
        throw new Error('Not implemented');
    }

    analyzeMemberExp (/* token */) {
        throw new Error('Not implemented');
    }

    formatFnArg (/* arg */) {
        throw new Error('Not implemented');
    }

    getFnCall (/* token */) {
        throw new Error('Not implemented');
    }

    getTaggedTemplateExp (/* token */) {
        throw new Error('Not implemented');
    }

    analyzeFnCall (/* token */) {
        throw new Error('Not implemented');
    }

    parse (/* filePath, code */) {
        throw new Error('Not implemented');
    }

    getTokenType (/* token */) {
        throw new Error('Not implemented');
    }

    getCalleeToken (/* token */) {
        throw new Error('Not implemented');
    }

    getMemberFnName () {
        throw new Error('Not implemented');
    }

    getKeyValue () {
        throw new Error('Not implemented');
    }

    getStringValue () {
        throw new Error('Not implemented');
    }

    isApiFn (fn) {
        return fn === 'fixture' || fn === 'test';
    }

    serializeObjExp (token) {
        if (this.getTokenType(token) !== this.tokenType.ObjectLiteralExpression)
            return {};

        return token.properties.reduce((obj, prop) => {
            const { key, value } = this.getKeyValue(prop);

            if (typeof value !== 'string') return {};

            obj[key] = value;

            return obj;
        }, {});
    }

    processMetaArgs (token) {
        if (this.getTokenType(token) !== this.tokenType.CallExpression)
            return null;

        const args = token.arguments;

        let meta = {};

        if (args.length === 2) {
            const value = this.getStringValue(args[1]);

            if (typeof value !== 'string') return {};

            meta = { [this.formatFnArg(args[0])]: value };
        }

        else if (args.length === 1)
            meta = this.serializeObjExp(args[0]);

        return meta;
    }

    getMetaInfo (callStack) {
        return callStack.reduce((metaCalls, exp) => {
            if (this.getTokenType(exp) !== this.tokenType.CallExpression)
                return metaCalls;

            const callee            = this.getCalleeToken(exp);
            const calleeType        = this.getTokenType(callee);
            const isCalleeMemberExp = calleeType === this.tokenType.PropertyAccessExpression;

            if (isCalleeMemberExp && this.getMemberFnName(exp) === 'meta')
                return [this.processMetaArgs(exp)].concat(metaCalls);

            return metaCalls;
        }, []);
    }

    checkExpDefineTargetName (type, apiFn) {
        //NOTE: fixture('fixtureName').chainFn or test('testName').chainFn
        const isDirectCall = type === this.tokenType.Identifier;

        //NOTE: fixture.skip('fixtureName'), test.only('testName') etc.
        const isMemberCall = type === this.tokenType.PropertyAccessExpression &&
                             METHODS_SPECIFYING_NAME.indexOf(apiFn) > -1;

        //NOTE: fixture.before().after()('fixtureName'), test.before()`testName`.after() etc.
        const isTailCall = type === this.tokenType.CallExpression;

        return isDirectCall || isMemberCall || isTailCall;
    }

    analyzeToken (token) {
        const tokenType     = this.tokenType;
        const currTokenType = this.getTokenType(token);

        switch (currTokenType) {
            case tokenType.ExpressionStatement:
            case tokenType.TypeAssertionExpression:
                return this.analyzeToken(token.expression);

            case tokenType.FunctionDeclaration:
            case tokenType.FunctionExpression:
                if (this.isAsyncFn(token))
                    return null;

                return this.getFunctionBody(token).map(this.analyzeToken, this);

            case tokenType.VariableDeclaration:
            case tokenType.VariableStatement: {
                const variableValue = this.getRValue(token); // Skip variable declarations like `var foo;`

                return variableValue ? this.analyzeToken(variableValue) : null;
            }
            case tokenType.CallExpression:
            case tokenType.PropertyAccessExpression:
            case tokenType.TaggedTemplateExpression:
                return this.analyzeFnCall(token);

            case tokenType.ReturnStatement:
                return token.argument ? this.analyzeToken(token.argument) : null;
        }

        return null;
    }

    collectTestCafeCalls (astBody) {
        let calls = [];

        astBody.forEach(token => {
            const callExps = this.analyzeToken(token);

            if (callExps)
                calls = calls.concat(callExps);
        });

        return calls;
    }

    analyze (astBody) {
        const fixtures         = [];
        const testCafeAPICalls = this.collectTestCafeCalls(astBody);

        testCafeAPICalls.forEach(call => {
            if (!call || typeof call.value !== 'string') return;

            if (call.fnName === 'fixture') {
                fixtures.push(new Fixture(call.value, call.start, call.end, call.loc, call.meta));
                return;
            }

            if (!fixtures.length) return;

            const test = new Test(call.value, call.start, call.end, call.loc, call.meta);

            fixtures[fixtures.length - 1].tests.push(test);
        });

        return fixtures;
    }

    async readFile (filePath) {
        let fileContent = '';

        try {
            fileContent = await readFile(filePath, 'utf8');
        }

        catch (err) {
            throw new GeneralError(RUNTIME_ERRORS.cannotFindSpecifiedTestSource, filePath);
        }

        return fileContent;
    }

    async getTestList (filePath) {
        const fileContent = await this.readFile(filePath);

        return this.parse(fileContent);
    }

    getTestListFromCode (code) {
        return this.parse(code);
    }
}
