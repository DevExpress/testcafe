import hammerhead from 'testcafe-hammerhead';
import asyncToGenerator from 'babel-runtime/helpers/asyncToGenerator';
import { noop } from 'lodash';
import loadBabelLibs from './load-babel-libs';
import { ClientFunctionAPIError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';

const ANONYMOUS_FN_RE                = /^function\s*\*?\s*\(/;
const ES6_OBJ_METHOD_NAME_RE         = /^(\S+?)\s*\(/;
const USE_STRICT_RE                  = /^('|")use strict('|");?/;
const TRAILING_SEMICOLON_RE          = /;\s*$/;
const REGENERATOR_FOOTPRINTS_RE      = /(_index\d+\.default|_regenerator\d+\.default|regeneratorRuntime)\.wrap\(function _callee\$\(_context\)/;
const ASYNC_TO_GENERATOR_OUTPUT_CODE = asyncToGenerator(noop).toString();

const babelArtifactPolyfills = {
    'Promise': {
        re:                 /_promise(\d+)\.default/,
        getCode:            match => `var _promise${match[1]} = { default: Promise };`,
        removeMatchingCode: false
    },

    'Object.keys()': {
        re:                 /_keys(\d+)\.default/,
        getCode:            match => `var _keys${match[1]} = { default: Object.keys };`,
        removeMatchingCode: false
    },

    'JSON.stringify()': {
        re:                 /_stringify(\d+)\.default/,
        getCode:            match => `var _stringify${match[1]} = { default: JSON.stringify };`,
        removeMatchingCode: false
    }
};


function getBabelOptions () {
    const { presetFallback, transformForOfAsArray } = loadBabelLibs();

    return {
        presets:       [{ plugins: [transformForOfAsArray] }, presetFallback],
        sourceMaps:    false,
        retainLines:   true,
        ast:           false,
        babelrc:       false,
        highlightCode: false
    };
}

function downgradeES (fnCode) {
    const { babel } = loadBabelLibs();

    const opts     = getBabelOptions();
    const compiled = babel.transform(fnCode, opts);

    return compiled.code
        .replace(USE_STRICT_RE, '')
        .trim();
}

function addBabelArtifactsPolyfills (fnCode, dependenciesDefinition) {
    let modifiedFnCode = fnCode;

    const polyfills = Object
        .values(babelArtifactPolyfills)
        .reduce((polyfillsCode, polyfill) => {
            const match = fnCode.match(polyfill.re);

            if (match) {
                if (polyfill.removeMatchingCode)
                    modifiedFnCode = modifiedFnCode.replace(polyfill.re, '');

                return polyfillsCode + polyfill.getCode(match);
            }

            return polyfillsCode;
        }, '');

    return `(function(){${dependenciesDefinition}${polyfills} return ${modifiedFnCode}})();`;
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

export default function compileClientFunction (fnCode, dependencies, instantiationCallsiteName, compilationCallsiteName) {
    if (fnCode === ASYNC_TO_GENERATOR_OUTPUT_CODE)
        throw new ClientFunctionAPIError(compilationCallsiteName, instantiationCallsiteName, RUNTIME_ERRORS.regeneratorInClientFunctionCode);

    fnCode = makeFnCodeSuitableForParsing(fnCode);

    // NOTE: we need to recompile ES6 code for the browser if we are on newer versions of Node.
    fnCode = downgradeES(fnCode);
    fnCode = hammerhead.processScript(fnCode, false);

    // NOTE: check compiled code for regenerator injection: we have either generator
    // recompiled in Node.js 4+ for client or async function declared in function code.
    if (REGENERATOR_FOOTPRINTS_RE.test(fnCode))
        throw new ClientFunctionAPIError(compilationCallsiteName, instantiationCallsiteName, RUNTIME_ERRORS.regeneratorInClientFunctionCode);

    if (!TRAILING_SEMICOLON_RE.test(fnCode))
        fnCode += ';';

    const dependenciesDefinition = dependencies ? getDependenciesDefinition(dependencies) : '';

    return addBabelArtifactsPolyfills(fnCode, dependenciesDefinition);
}
