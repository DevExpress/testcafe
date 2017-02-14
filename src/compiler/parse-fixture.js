import { assign } from 'lodash';
import { transform as parse } from 'babel-core';
import { GeneralError } from '../errors/runtime';
import ESNextTestFileCompiler from './test-file/formats/es-next';

import promisify from '../utils/promisify';
import fs from 'fs';

import MESSAGE from '../errors/runtime/message';

var readFile = promisify(fs.readFile);

const COMPUTED_NAME_TEXT      = '<computed name>';
const METHODS_SPECIFYING_NAME = ['only', 'skip'];

function getRValue (token) {
    return token.declarations[0].init;
}

function getFunctionBody (token) {
    return token.body && token.body.body ? token.body.body : [];
}

function getTagStrValue (exp) {
    //NOTE: we set <computed name> if template literal has at least one computed substring ${...}
    return exp.expressions.length ? COMPUTED_NAME_TEXT : exp.quasis[0].value.raw;
}

function checkMemberDefineName (fn) {
    return METHODS_SPECIFYING_NAME.indexOf(fn) > -1;
}

function formatFnData (name, value, token) {
    return {
        fnName: name,
        value:  value,
        loc:    token.loc,
        start:  token.start,
        end:    token.end
    };
}

function analyzeMemberExp (token) {
    let exp         = token;
    const callStack = [exp];

    while (exp.type !== 'Identifier') {
        if (exp.type === 'CallExpression')
            exp = exp.callee;

        else if (exp.type === 'MemberExpression')
            exp = exp.object;

        else if (exp.type === 'TaggedTemplateExpression')
            exp = exp.tag;

        if (exp.type !== 'Identifier')
            callStack.push(exp);
    }

    let parentExp = callStack.pop();

    if (exp.name !== 'fixture' && exp.name !== 'test')
        return null;

    if (parentExp.type === 'CallExpression')
        return formatFnData(exp.name, formatFnArg(parentExp.arguments[0]), token);

    if (parentExp.type === 'TaggedTemplateExpression')
        return formatFnData(exp.name, getTagStrValue(parentExp.quasi), token);

    if (parentExp.type === 'MemberExpression') {
        /*eslint-disable no-cond-assign*/
        while (parentExp = callStack.pop()) {
            if (parentExp.type === 'CallExpression' && parentExp.callee) {
                const calleeType = parentExp.callee.type;

                //NOTE: fixture('fixtureName') or test('testName')
                const isDirectCall = calleeType === 'Identifier';

                //NOTE: fixture.skip('fixtureName'), test.only('testName') etc.
                const isMemberCall = calleeType === 'MemberExpression' &&
                                     checkMemberDefineName(parentExp.callee.property.name);

                const isTailCall = calleeType === 'CallExpression';

                if (isDirectCall || isMemberCall || isTailCall)
                    return formatFnData(exp.name, formatFnArg(parentExp.arguments[0]), token);
            }

            if (parentExp.type === 'TaggedTemplateExpression' && parentExp.tag) {
                const tagType = parentExp.tag.type;

                //NOTE: fixture('fixtureName') or test('testName')
                const isDirectCall = tagType === 'Identifier';

                //NOTE: fixture.skip('fixtureName'), test.only('testName') etc.
                const isMemberCall = tagType === 'MemberExpression' &&
                                     checkMemberDefineName(parentExp.tag.property.name);

                const isTailCall = tagType === 'CallExpression';

                if (isDirectCall || isMemberCall || isTailCall)
                    return formatFnData(exp.name, getTagStrValue(parentExp.quasi), token);
            }
        }
        /*eslint-enable no-cond-assign*/
    }

    return null;
}

function formatFnArg (arg) {
    if (arg.type === 'Identifier')
        return COMPUTED_NAME_TEXT;

    if (arg.type === 'TemplateLiteral')
        return getTagStrValue(arg);

    if (arg.type === 'StringLiteral')
        return arg.value;

    return null;
}

function getFnCall (token) {
    if (token.callee.name !== 'fixture' && token.callee.name !== 'test')
        return null;

    return formatFnData(token.callee.name, formatFnArg(token.arguments[0]), token);
}

function getTaggedTemplateExp (token) {
    return formatFnData(token.tag.name, getTagStrValue(token.quasi), token);
}

function analyzeFnCall (token) {
    if (token.type === 'MemberExpression')
        return analyzeMemberExp(token);

    if (token.type === 'CallExpression') {
        if (token.callee.type === 'MemberExpression' || token.callee.type === 'CallExpression')
            return analyzeMemberExp(token);

        return getFnCall(token);
    }

    if (token.type === 'TaggedTemplateExpression') {
        if (token.tag.type === 'MemberExpression')
            return analyzeMemberExp(token);

        return getTaggedTemplateExp(token);
    }

    return null;
}

function analyzeToken (token) {
    switch (token.type) {
        case 'ExpressionStatement':
            return analyzeToken(token.expression);

        case 'FunctionDeclaration':
        case 'FunctionExpression':
            if (token.async || token.generator)
                return null;

            return getFunctionBody(token).map(analyzeToken);

        case 'VariableDeclaration':
            return analyzeToken(getRValue(token));

        case 'CallExpression':
        case 'MemberExpression':
        case 'TaggedTemplateExpression':
            return analyzeFnCall(token);
    }

    return null;
}

function collectTestCafeCalls (astBody) {
    let calls = [];

    astBody.forEach(token => {
        const callExps = analyzeToken(token);

        if (callExps)
            calls = calls.concat(callExps);
    });

    return calls;
}

function analyze (astBody) {
    const fixtures         = [];
    const testCafeAPICalls = collectTestCafeCalls(astBody);

    testCafeAPICalls.forEach(call => {
        if (!call || typeof call.value !== 'string')
            return;

        if (call.fnName === 'fixture') {
            fixtures.push({
                name:  call.value,
                loc:   call.loc,
                start: call.start,
                end:   call.end,
                tests: []
            });

            return;
        }

        if (!fixtures.length) return;

        fixtures[fixtures.length - 1].tests.push({
            name:  call.value,
            loc:   call.loc,
            start: call.start,
            end:   call.end
        });
    });

    return fixtures;
}

function canCompile (filename) {
    return /\.js$/.test(filename);
}

export default async function (filename) {
    let code = '';

    try {
        code = await readFile(filename, 'utf8');
    }

    catch (err) {
        throw new GeneralError(MESSAGE.cantFindSpecifiedTestSource, filename);
    }

    if (!canCompile(filename, code)) return [];

    const compilerOptions = ESNextTestFileCompiler._getBabelOptions(filename);
    const opts            = assign(compilerOptions, { ast: true });
    const ast             = parse(code, opts).ast;

    return analyze(ast.program.body);
}
