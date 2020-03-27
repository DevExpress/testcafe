/* eslint-env node */
/* eslint-disable no-restricted-globals */

import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';


const CHUNK_NAMES = [
    'core/index.js',
    'driver/index.js',
    'ui/index.js',
    'automation/index.js',
    'browser/idle-page/index.js'
];

const TARGET_DIR = '../../lib/client';

const GLOBALS = {
    'hammerhead':          'window[\'%hammerhead%\']',
    'testcafe-automation': 'window[\'%testCafeAutomation%\']',
    'testcafe-core':       'window[\'%testCafeCore%\']',
    'testcafe-ui':         'window[\'%testCafeUI%\']'
};

const CONFIG = CHUNK_NAMES.map(chunk => ({
    input:    chunk,
    external: Object.keys(GLOBALS),

    output: {
        file:    path.join(TARGET_DIR, chunk),
        format:  'iife',
        globals: GLOBALS,

        // NOTE: 'use strict' in our scripts can break user code
        // https://github.com/DevExpress/testcafe/issues/258
        strict: false
    },

    plugins: [
        typescript({ include: ['*.+(j|t)s', '**/*.+(j|t)s', '../**/*.+(j|t)s'] }),
        commonjs(),
        resolve()
    ]
}));

export default CONFIG;
