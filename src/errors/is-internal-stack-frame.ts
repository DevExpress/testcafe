import { sep, join } from 'path';
import { escapeRegExp as escapeRe } from 'lodash';
import INTERNAL_MODULES_PREFIX from './internal-modules-prefix';
import { StackFrame } from 'error-stack-parser';

const BABEL               = require.resolve('@babel/core');
const BABEL_MODULES_DIR   = BABEL.replace(new RegExp(`^(.*${escapeRe(sep)}node_modules${escapeRe(sep)})(.*)`), '$1');
const BABEL_7             = BABEL_MODULES_DIR + '@babel';
const BABEL_RELATED       = BABEL_MODULES_DIR + 'babel-';
const REGENERATOR_RUNTIME = BABEL_MODULES_DIR + 'regenerator-runtime' + sep;
const GENSYNC             = BABEL_MODULES_DIR + 'gensync'; // NOTE: @babel/parser uses this module internally.
const TESTCAFE_LIB        = join(__dirname, '../');
const TESTCAFE_BIN        = join(__dirname, '../../bin');
const TESTCAFE_SRC        = join(__dirname, '../../src');
const TESTCAFE_HAMMERHEAD = require.resolve('testcafe-hammerhead');
const SOURCE_MAP_SUPPORT  = require.resolve('source-map-support');

const INTERNAL_STARTS_WITH_PATH_SEGMENTS = [
    TESTCAFE_LIB,
    TESTCAFE_BIN,
    TESTCAFE_SRC,
    BABEL_RELATED,
    REGENERATOR_RUNTIME,
    GENSYNC,
    BABEL_7,
    INTERNAL_MODULES_PREFIX
];

const INTERNAL_INCLUDES_PATH_SEGMENTS = [
    SOURCE_MAP_SUPPORT,
    TESTCAFE_HAMMERHEAD
];

function isInternalFile (filename: string = ''): boolean {
    return !filename ||
        !filename.includes(sep) ||
        INTERNAL_INCLUDES_PATH_SEGMENTS.some(pathSegment => filename.includes(pathSegment)) ||
        INTERNAL_STARTS_WITH_PATH_SEGMENTS.some(pathSegment => filename.startsWith(pathSegment));
}

export default function (frame: StackFrame): boolean {
    // NOTE: filter out the internals of node.js and assertion libraries
    const filename = frame.getFileName();

    return isInternalFile(filename);
}
