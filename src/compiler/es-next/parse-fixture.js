/*import loadBabelLibs from './load-babel-libs';*/
import { parse } from 'babylon';
import { GeneralError } from '../../errors/runtime';

import promisify from '../../utils/promisify';
import fs from 'fs';

import MESSAGE from '../../errors/runtime/message';

var readFile = promisify(fs.readFile);

const COMPUTED_NAME_TEXT = '<computed name>';
const TESTCAFE_API       = [
    'after',
    'afterAll',
    'afterEach',
    'before',
    'beforeAll',
    'beforeEach',
    'fixture',
    'test',
    'only',
    'skip'
];

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

function getStringValue (exp) {
    if (exp.type === 'Identifier')
        return COMPUTED_NAME_TEXT;

    if (exp.type === 'TemplateLiteral')
        return getTagStrValue(exp);

    if (exp.type === 'StringLiteral')
        return exp.value;

    return '';
}

function getHeadMemberExp (exp) {
    var obj        = exp;
    var lastCallee = '';

    function getParentCall (curr) {
        if (!curr)
            return null;

        if (curr.type === 'MemberExpression')
            return curr.object;

        if (curr.type === 'CallExpression' && curr.callee.type !== 'Identifier')
            return curr.callee;

        return null;
    }

    for (; ;) {
        var parentCall = getParentCall(obj);

        if (obj.type === 'CallExpression' && obj.callee.callee && obj.callee.callee.object &&
            obj.callee.callee.object && ['before', 'only', 'skip'].indexOf(obj.callee.callee.object.name) >= -1)
            lastCallee = obj;

        /*if(obj.type === 'CallExpression' && obj.callee.object && obj.callee.object && ['before', 'only', 'skip'].indexOf(obj.callee.object.property) >= -1)
            lastCallee = obj;*/

        if (!parentCall)
            break;

        obj = parentCall;
    }

    if (obj.type === 'CallExpression') {
        return {
            call:  obj.callee.name,
            value: getStringValue(obj.arguments[0])
        };
    }

    if (obj.type === 'Identifier') {
        return {
            call:  obj.name,
            value: lastCallee ? getStringValue(lastCallee.arguments[0]) : ''
        };
    }

    if (obj.type === 'TaggedTemplateExpression') {
        if (obj.tag.type === 'MemberExpression')
            return getHeadMemberExp(obj.tag.object);

        return {
            call:  obj.tag.name,
            value: getTagStrValue(obj.quasi)
        };
    }

    return null;
}

function getFirstCallArg (exp) {
    const isTestCafeAPI = fnName => TESTCAFE_API.indexOf(fnName) > -1;

    if (exp.type === 'TaggedTemplateExpression') {
        if (exp.tag.type === 'MemberExpression' && exp.tag.object) {
            if (!exp.tag.object.name)
                return getFirstCallArg(exp.tag.object);

            if (isTestCafeAPI(exp.tag.object.name)) {
                return {
                    call:  exp.tag.object.name,
                    value: getTagStrValue(exp.quasi),
                    loc:   exp.loc,
                    start: exp.start,
                    end:   exp.end
                };
            }
        }

        if (exp.tag.type === 'Identifier' && isTestCafeAPI(exp.tag.name)) {
            return {
                call:  exp.tag.name,
                value: getTagStrValue(exp.quasi),
                loc:   exp.loc,
                start: exp.start,
                end:   exp.end
            };
        }

        if (!isTestCafeAPI(exp.tag.name))
            return null;

        return {
            call:  exp.tag.name,
            value: getTagStrValue(exp.quasi),
            loc:   exp.loc,
            start: exp.start,
            end:   exp.end
        };
    }

    if (exp.type === 'MemberExpression') {
        var headExp = getHeadMemberExp(exp);

        if (!headExp)
            return null;

        return {
            call:  headExp.call,
            value: headExp.value,
            loc:   exp.loc,
            start: exp.start,
            end:   exp.end
        };
    }
    if (exp.callee) {
        if (exp.callee.type === 'MemberExpression' && isTestCafeAPI(exp.callee.property.name)) {
            if (exp.callee.name) {
                return {
                    call:  exp.callee.name,
                    value: exp.arguments[0].value,
                    loc:   exp.loc,
                    start: exp.start,
                    end:   exp.end
                };
            }

            var headMemberExp = getHeadMemberExp(exp);

            return {
                call:  headMemberExp.call,
                value: exp.callee.object.type === 'Identifier' ? exp.arguments[0].value : headMemberExp.value,
                loc:   exp.loc,
                start: exp.start,
                end:   exp.end
            };
        }

        if (!isTestCafeAPI(exp.callee.name))
            return null;

        const call = getFirstCallArg(exp.arguments[0]);

        if (!call)
            return null;

        return {
            call:  exp.callee.name,
            value: call,
            loc:   exp.loc,
            start: exp.start,
            end:   exp.end
        };
    }

    return getStringValue(exp);
}

function collectTestCafeCalls (astBody) {
    let calls = [];
    let token = null;

    /*eslint-disable no-cond-assign*/
    while (token = astBody.shift()) {

        var callExps = analyzeToken(token);

        if (!callExps)
            continue;

        calls = calls.concat(callExps);
    }
    /*eslint-enable no-cond-assign*/


    return calls;
}

function analyze (astBody) {
    const fixtures = [];

    const testCafeAPICalls = collectTestCafeCalls(astBody);

    testCafeAPICalls.forEach(call => {
        if (call.call === 'fixture') {
            fixtures.push({
                name:  call.value,
                loc:   call.loc,
                start: call.start,
                end:   call.end,
                tests: []
            });

            return;
        }

        if (!fixtures.length)
            return;

        fixtures[fixtures.length - 1].tests.push({
            name:  call.value,
            loc:   call.loc,
            start: call.start,
            end:   call.end
        });
    });

    return fixtures;
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

        case 'MemberExpression':
            return getFirstCallArg(token);

        case 'CallExpression':
        case 'TaggedTemplateExpression':
            if (token.callee && token.callee.type === 'FunctionExpression')
                return analyzeToken(token.callee);

            return getFirstCallArg(token);
    }

    return null;
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

    if (!canCompile(filename, code))
        return [];

    //const esNextCompiler = new ESNextCompiler();

    //const ast = esNextCompiler.compile(code, filename).ast;

    /*const { babel } = loadBabelLibs();*/

    var ast = parse(code, { allowImportExportEverywhere: true, plugins: ['asyncFunctions'] }).program;

    fs.writeFileSync('D:\\structure.json', JSON.stringify(ast, null, 4));

    return analyze(ast.body);
}
