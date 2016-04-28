import { wrapDomAccessors } from 'testcafe-hammerhead';
import NODE_VER from '../../utils/node-version';
import loadBabelLibs from './load-babel-libs';

const ANONYMOUS_FN_RE = /^function\*?\s*\(/;

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

export default function compileHybridFunction (fnCode) {
    if (ANONYMOUS_FN_RE.test(fnCode))
        fnCode = `(${fnCode})`;

    // NOTE: we need to recompile ES6 code for the browser if we are on newer versions of Node.
    try {
        if (NODE_VER >= 4) {
            var { babel } = loadBabelLibs();

            var opts     = getBabelOptions();
            var compiled = babel.transform(fnCode, opts);

            fnCode = compiled.code;
        }

        return wrapDomAccessors(fnCode, true);
    }

    catch (err) {
        return fnCode;
    }
}
