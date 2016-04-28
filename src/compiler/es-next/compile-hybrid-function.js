import { wrapDomAccessors } from 'testcafe-hammerhead';
import NODE_VER from '../../utils/node-version';
import loadBabelLibs from './load-babel-libs';

const ANONYMOUS_FN_RE       = /^function\*?\s*\(/;
const USE_STRICT_RE         = /^('|")use strict('|");?/;
const TRAILING_SEMICOLON_RE = /;\s*$/;

var babelArtifactPolyfills = {
    Promise: {
        re:     /_promise(\d+)\.default/,
        create: match => `var _promise${match[1]} = { default: Promise };`
    }
};

function getBabelOptions () {
    var { presetES2015Loose } = loadBabelLibs();

    return {
        presets:       [presetES2015Loose],
        sourceMaps:    false,
        retainLines:   true,
        ast:           false,
        babelrc:       false,
        highlightCode: false
    };
}

function downgradeES (fnCode) {
    var { babel } = loadBabelLibs();

    var opts     = getBabelOptions();
    var compiled = babel.transform(fnCode, opts);

    return compiled.code
        .replace(USE_STRICT_RE, '')
        .trim();
}

function getBabelArtifactsPolyfill (fnCode) {
    return Object
        .values(babelArtifactPolyfills)
        .reduce((code, polyfill) => {
            var match = fnCode.match(polyfill.re);

            return match ? code + polyfill.create(match) : code;
        }, '');
}

export default function compileHybridFunction (fnCode) {
    if (ANONYMOUS_FN_RE.test(fnCode))
        fnCode = `(${fnCode})`;

    try {
        // NOTE: we need to recompile ES6 code for the browser if we are on newer versions of Node.
        if (NODE_VER >= 4)
            fnCode = downgradeES(fnCode);

        fnCode = wrapDomAccessors(fnCode, true);
    }

    finally {
        if (!TRAILING_SEMICOLON_RE.test(fnCode))
            fnCode += ';';

        return `(function(){${getBabelArtifactsPolyfill(fnCode)} return ${fnCode}})();`;
    }
}
