import fs from 'fs';
import promisify from '../../utils/promisify';
import { format } from 'util';
import { GeneralError } from '../../errors/runtime';

import MESSAGE from '../../errors/runtime/message';

const readFile = promisify(fs.readFile);

const METHODS_SPECIFYING_NAME = ['only', 'skip'];
const COMPUTED_NAME_TEXT_TMP  = '<computed name>(line: %s)';

export class Fixture {
    constructor (name, start, end, loc) {
        this.name  = name;
        this.loc   = loc;
        this.start = start;
        this.end   = end;
        this.tests = [];
    }
}

export class Test {
    constructor (name, start, end, loc) {
        this.name  = name;
        this.loc   = loc;
        this.start = start;
        this.end   = end;
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

    isApiFn (fn) {
        return fn === 'fixture' || fn === 'test';
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
                return this.analyzeToken(this.getRValue(token));

            case tokenType.CallExpression:
            case tokenType.PropertyAccessExpression:
            case tokenType.TaggedTemplateExpression:
                return this.analyzeFnCall(token);
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
                fixtures.push(new Fixture(call.value, call.start, call.end, call.loc));
                return;
            }

            if (!fixtures.length) return;

            const test = new Test(call.value, call.start, call.end, call.loc);

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
            throw new GeneralError(MESSAGE.cantFindSpecifiedTestSource, filePath);
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
