import { parse } from 'babylon';
import { GeneralError } from '../errors/runtime';

import promisify from '../utils/promisify';
import fs from 'fs';

import MESSAGE from '../errors/runtime/message';

var readFile = promisify(fs.readFile);

const FIXTURE_RE = /(^|;|\s+)fixture\s*(\.|\(|`)/;
const TEST_RE    = /(^|;|\s+)test\s*(\.|\()/;

const COMPUTED_NAME_TEXT = '<computed name>';

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

function getFirstCallArg (exp, fnName) {
    if (exp.type === 'TaggedTemplateExpression') {
        if (exp.tag.type === 'MemberExpression')
            return getFirstCallArg(exp.tag.object, fnName);

        return exp.tag.name === fnName ? getTagStrValue(exp.quasi) : null;
    }

    if (exp.type === 'TemplateLiteral')
        return COMPUTED_NAME_TEXT;

    if (exp.type === 'StringLiteral')
        return exp.value;

    if (exp.type === 'Identifier')
        return COMPUTED_NAME_TEXT;

    if (exp.callee && exp.callee.type === 'MemberExpression') {
        var obj = exp.callee.object;

        if (obj.callee && obj.callee.object)
            return getFirstCallArg(obj.callee.object, fnName);

        if (obj.type === 'CallExpression')
            return getFirstCallArg(obj, fnName);

        if (obj.type === 'TaggedTemplateExpression')
            return getFirstCallArg(obj, fnName);
    }

    if (exp.callee && exp.callee.name === fnName)
        return getFirstCallArg(exp.arguments[0], fnName);

    //NOTE: for non-string literals
    return null;
}

function analyze (fixtures, token) {
    switch (token.type) {
        case 'ExpressionStatement':
            analyze(fixtures, token.expression);
            return;

        case 'FunctionDeclaration':
        case 'FunctionExpression':
            if (!token.async && !token.generator)
                getFunctionBody(token).forEach(exp => analyze(fixtures, exp));

            return;

        case 'VariableDeclaration':
            analyze(fixtures, getRValue(token));
            return;

        case 'CallExpression':
        case 'TaggedTemplateExpression':
            if (token.callee && token.callee.type === 'FunctionExpression') {
                analyze(fixtures, token.callee);
                return;
            }

            var fixtureName = getFirstCallArg(token, 'fixture');

            if (fixtureName) {
                fixtures.push({
                    name:  fixtureName,
                    loc:   token.loc,
                    tests: []
                });

                return;
            }

            if (!fixtures.length)
                return;

            var testName = getFirstCallArg(token, 'test');

            if (testName) {
                fixtures[fixtures.length - 1].tests.push({
                    name: testName,
                    loc:  token.loc
                });
            }
    }
}

function canCompile (filename, code) {
    return /\.js$/.test(filename) &&
           FIXTURE_RE.test(code) &&
           TEST_RE.test(code);
}

export default async function (filename) {
    let code = '';

    try {
        code = await readFile(filename, 'utf8');
    }
    catch (err) {
        throw new GeneralError(MESSAGE.cantFindSpecifiedTestSource, filename);
    }

    if (!canCompile(filename, code))
        return [];

    const fixtures = [];

    var ast = parse(code, { allowImportExportEverywhere: true, plugins: ['asyncFunctions'] }).program;

    ast.body.forEach(token => analyze(fixtures, token));

    return fixtures;
}
