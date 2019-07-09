import { runInThisContext } from 'vm';
import Module from 'module';
import { dirname } from 'path';
import { ExecuteNodeExpressionError } from '../errors/test-run';

const ERROR_LINE_COLUMN_REGEXP = /:(\d+):(\d+)/;
const ERROR_LINE_OFFSET        = -2;
const ERROR_COLUMN_OFFSET      = -4;

// NOTE: do not beautify this code since offsets for for error lines and columns are coded here
function wrapModule (expression) {
    return '(function(require, t, __filename, __dirname){\n' +
                'const res = (async function() {\n' +
                 expression + ';\n' +
                '});\n' +
                'return res;\n' +
            '});';
}

function getErrorLineColumn (err) {
    const result = err.stack.match(ERROR_LINE_COLUMN_REGEXP);

    const line   = parseInt(result[1], 10);
    const column = parseInt(result[2], 10);

    return { line, column };
}

function formatExpression (expression) {
    const expresionMessage = expression.split('\n');

    return 'function [Code step]\n' + expresionMessage.map(str => {
        return ' '.repeat(10) + str;
    }).join('\n');
}

function createRequire (filename) {
    if (Module.createRequireFromPath)
        return Module.createRequireFromPath(filename);

    const dummyModule = new Module(filename, module);

    dummyModule.filename = filename;
    dummyModule.paths    = [filename].concat(module.paths);

    return id => dummyModule.require(id);
}

export default async function (expression, testRun, callsite) {
    const filename = testRun.test.testFile.filename;
    const dirName  = dirname(filename);

    const fn = runInThisContext(wrapModule(expression), {
        filename:     formatExpression(expression),
        lineOffset:   ERROR_LINE_OFFSET,
        columnOffset: ERROR_COLUMN_OFFSET
    });

    try {
        return await fn(createRequire(filename), testRun.controller, filename, dirName)();
    }
    catch (err) {
        const { line, column } = getErrorLineColumn(err);

        throw new ExecuteNodeExpressionError(err, expression, line, column, callsite);
    }
}
