import hammerhead from 'testcafe-hammerhead';
import asyncToGenerator from '@babel/runtime/helpers/asyncToGenerator';
import { noop } from 'lodash';
import loadBabelLibs from './babel/load-libs';
import { ClientFunctionAPIError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import formatBabelProducedCode from './babel/format-babel-produced-code';
import BASE_BABEL_OPTIONS from './babel/get-base-babel-options';

const ANONYMOUS_FN_RE                = /^function\s*\*?\s*\(/;
const ES6_OBJ_METHOD_NAME_RE         = /^(\S+?)\s*\(/;
const USE_STRICT_RE                  = /^('|")use strict('|");?/;
const TRAILING_SEMICOLON_RE          = /;\s*$/;
const REGENERATOR_FOOTPRINTS_RE      = /(_index\d+\.default|_regenerator\d+\.default|regeneratorRuntime)\.wrap\(function func\$\(_context\)/;
const ASYNC_TO_GENERATOR_OUTPUT_CODE = formatBabelProducedCode(asyncToGenerator(noop).toString());

const CLIENT_FUNCTION_BODY_WRAPPER = code => `const func = (${code});`;
const CLIENT_FUNCTION_WRAPPER      = ({ code, dependencies }) => `(function(){${dependencies} ${code} return func;})();`;

function getBabelOptions () {
    const { presetEnvForClientFunction, transformForOfAsArray } = loadBabelLibs();

    return Object.assign({}, BASE_BABEL_OPTIONS, {
        presets: [{ plugins: [transformForOfAsArray] }, presetEnvForClientFunction]
    });
}

function downgradeES (fnCode) {
    const { babel } = loadBabelLibs();

    const opts     = getBabelOptions();
    const compiled = babel.transform(fnCode, opts);

    return compiled.code
        .replace(USE_STRICT_RE, '')
        .trim();
}

function getDependenciesDefinition (dependencies) {
    return Object
        .keys(dependencies)
        .reduce((code, name) => {
            return code + `var ${name}=__dependencies$['${name}'];`;
        }, '');
}

function makeFnCodeSuitableForParsing (fnCode) {
    // NOTE: 'function() {}' -> '(function() {})'
    if (ANONYMOUS_FN_RE.test(fnCode))
        return `(${fnCode})`;

    // NOTE: 'myFn () {}' -> 'function myFn() {}'
    const match = fnCode.match(ES6_OBJ_METHOD_NAME_RE);

    if (match && match[1] !== 'function')
        return `function ${fnCode}`;

    return fnCode;
}

function containsAsyncToGeneratorOutputCode (code) {
    const formattedCode = formatBabelProducedCode(code);

    return formattedCode.includes(ASYNC_TO_GENERATOR_OUTPUT_CODE);
}

export default function compileClientFunction (fnCode, dependencies, instantiationCallsiteName, compilationCallsiteName) {
    if (containsAsyncToGeneratorOutputCode(fnCode))
        throw new ClientFunctionAPIError(compilationCallsiteName, instantiationCallsiteName, RUNTIME_ERRORS.regeneratorInClientFunctionCode);

    fnCode = makeFnCodeSuitableForParsing(fnCode);


    fnCode = CLIENT_FUNCTION_BODY_WRAPPER(fnCode);

    // NOTE: we need to recompile ES6 code for the browser if we are on newer versions of Node.
    fnCode = downgradeES(fnCode);
    fnCode = hammerhead.processScript(fnCode, false);

    // NOTE: check compiled code for regenerator injection
    if (REGENERATOR_FOOTPRINTS_RE.test(fnCode))
        throw new ClientFunctionAPIError(compilationCallsiteName, instantiationCallsiteName, RUNTIME_ERRORS.regeneratorInClientFunctionCode);

    if (!TRAILING_SEMICOLON_RE.test(fnCode))
        fnCode += ';';

    const dependenciesDefinition = dependencies ? getDependenciesDefinition(dependencies) : '';

    return CLIENT_FUNCTION_WRAPPER({ code: fnCode, dependencies: dependenciesDefinition });
}
