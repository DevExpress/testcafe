import { sep, join } from 'path';
import { escapeRegExp as escapeRe } from 'lodash';

const BABEL             = require.resolve('babel-core');
const BABEL_MODULES_DIR = BABEL.replace(new RegExp(`^(.*${escapeRe(sep)}node_modules${escapeRe(sep)})(.*)`), '$1');

const BABEL_RELATED       = BABEL_MODULES_DIR + 'babel-';
const BABYLON             = BABEL_MODULES_DIR + 'babylon' + sep;
const CORE_JS             = BABEL_MODULES_DIR + 'core-js' + sep;
const REGENERATOR_RUNTIME = BABEL_MODULES_DIR + 'regenerator-runtime' + sep;

const TESTCAFE_LIB        = join(__dirname, '../');
const TESTCAFE_BIN        = join(__dirname, '../../bin');
const TESTCAFE_HAMMERHEAD = `${sep}testcafe-hammerhead${sep}`;

const SOURCE_MAP_SUPPORT = `${sep}source-map-support${sep}`;

const INTERNAL = 'internal/';

export default function createStackFilter (limit) {
    var passedFramesCount = 0;

    return function stackFilter (frame) {
        if (passedFramesCount >= limit)
            return false;

        var filename = frame.getFileName();

        // NOTE: filter out the internals of node, Babel and TestCafe
        var pass = filename &&
                   filename.indexOf(sep) > -1 &&
                   filename.indexOf(INTERNAL) !== 0 &&
                   filename.indexOf(TESTCAFE_LIB) !== 0 &&
                   filename.indexOf(TESTCAFE_BIN) !== 0 &&
                   filename.indexOf(TESTCAFE_HAMMERHEAD) < 0 &&
                   filename.indexOf(BABEL_RELATED) !== 0 &&
                   filename.indexOf(BABYLON) !== 0 &&
                   filename.indexOf(CORE_JS) !== 0 &&
                   filename.indexOf(REGENERATOR_RUNTIME) !== 0 &&
                   filename.indexOf(SOURCE_MAP_SUPPORT) < 0;

        if (pass)
            passedFramesCount++;

        return pass;
    };
}
