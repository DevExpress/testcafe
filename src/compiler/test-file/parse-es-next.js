import { assign } from 'lodash';
import { format } from 'util';
import { transform as parse } from 'babel-core';
import { GeneralError } from '../../errors/runtime';
import ESNextTestFileCompiler from './formats/es-next';

import promisify from '../../utils/promisify';
import fs from 'fs';

import MESSAGE from '../../errors/runtime/message';

var readFile = promisify(fs.readFile);

const COMPUTED_NAME_TEXT_TMP  = '<computed name>(line: %s)';
const METHODS_SPECIFYING_NAME = ['only', 'skip'];

function getRValue (token) {
    return token.declarations[0].init;
}

function getFunctionBody (token) {
    return token.body && token.body.body ? token.body.body : [];
}

function getTagStrValue (exp) {
    //NOTE: we set <computed name> if template literal has at least one computed substring ${...}
    return exp.expressions.length ? format(COMPUTED_NAME_TEXT_TMP, exp.loc.start.line) : exp.quasis[0].value.raw;
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

function checkExpDefineTargetName (type, apiFn) {
    //NOTE: fixture('fixtureName') or test('testName')
    const isDirectCall = type === 'Identifier';

    //NOTE: fixture.skip('fixtureName'), test.only('testName') etc.
    const isMemberCall = type === 'MemberExpression' && METHODS_SPECIFYING_NAME.indexOf(apiFn) > -1;

    //NOTE: fixture.before().after()('fixtureName'), test.before()`testName`.after() etc.
    const isTailCall = type === 'CallExpression';

    return isDirectCall || isMemberCall || isTailCall;
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

    if (exp.name !== 'fixture' && exp.name !== 'test')
        return null;

    let parentExp = callStack.pop();

    if (parentExp.type === 'CallExpression')
        return formatFnData(exp.name, formatFnArg(parentExp.arguments[0]), token);

    if (parentExp.type === 'TaggedTemplateExpression')
        return formatFnData(exp.name, getTagStrValue(parentExp.quasi), token);

    if (parentExp.type === 'MemberExpression') {
        /*eslint-disable no-cond-assign*/
        while (parentExp = callStack.pop()) {
            if (parentExp.type === 'CallExpression' && parentExp.callee) {
                const calleeType     = parentExp.callee.type;
                const calleeMemberFn = parentExp.callee.property && parentExp.callee.property.name;

                if (checkExpDefineTargetName(calleeType, calleeMemberFn))
                    return formatFnData(exp.name, formatFnArg(parentExp.arguments[0]), token);
            }

            if (parentExp.type === 'TaggedTemplateExpression' && parentExp.tag) {
                const tagType     = parentExp.tag.type;
                const tagMemberFn = parentExp.tag.property && parentExp.tag.property.name;

                if (checkExpDefineTargetName(tagType, tagMemberFn))
                    return formatFnData(exp.name, getTagStrValue(parentExp.quasi), token);
            }
        }
        /*eslint-enable no-cond-assign*/
    }

    return null;
}

function formatFnArg (arg) {
    if (arg.type === 'Identifier')
        return format(COMPUTED_NAME_TEXT_TMP, arg.loc.start.line);

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

export default async function (filename) {
    const compiler = new ESNextTestFileCompiler();
    let code       = '';

    try {
        code = await readFile(filename, 'utf8');
    }

    catch (err) {
        throw new GeneralError(MESSAGE.cantFindSpecifiedTestSource, filename);
    }

    if (!compiler.canCompile(code, filename)) return [];

    const compilerOptions = ESNextTestFileCompiler.getBabelOptions(filename);
    const opts            = assign(compilerOptions, { ast: true });
    const ast             = parse(code, opts).ast;

    return analyze(ast.program.body);
}
