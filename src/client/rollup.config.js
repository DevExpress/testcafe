/* eslint-env node */
/* eslint-disable no-restricted-globals */

import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import inject from '@rollup/plugin-inject';
import alias from '@rollup/plugin-alias';


const NO_HAMMERHEAD_CHUNKS = [
    'browser/idle-page/index.js',
    'browser/service-worker.js',

    // TODO: should not inject pinkie
    'proxyless/index.ts'
];

const CHUNK_NAMES = [
    ...NO_HAMMERHEAD_CHUNKS,
    'core/index.js',
    'driver/index.js',
    'ui/index.js',
    'automation/index.js'
];

const TARGET_DIR = '../../lib/client';

const COMMON_GLOBALS = {
    'hammerhead':          'window[\'%hammerhead%\']',
    'testcafe-automation': 'window[\'%testCafeAutomation%\']',
    'testcafe-core':       'window[\'%testCafeCore%\']',
    'testcafe-ui':         'window[\'%testCafeUI%\']'
};

const EXTENDED_GLOBALS = {
    ...COMMON_GLOBALS,
    'pinkie': 'window[\'%hammerhead%\'].Promise'
};

const GLOBALS = chunk => NO_HAMMERHEAD_CHUNKS.includes(chunk) ? COMMON_GLOBALS : EXTENDED_GLOBALS;

const CONFIG = CHUNK_NAMES.map(chunk => ({
    input:    chunk,
    external: Object.keys(GLOBALS(chunk)),

    //NOTE: need to keep this to prevent rollup from generating warnings about replacing `this` in TypeScript polyfills
    context: '(void 0)',

    output: {
        file:    path.join(TARGET_DIR, chunk.replace(/\.ts$/, '.js')),
        format:  'iife',
        globals: GLOBALS(chunk),
        // NOTE: 'use strict' in our scripts can break user code
        // https://github.com/DevExpress/testcafe/issues/258
        strict:  false
    },

    plugins: [
        resolve(),
        alias({
            entries: [{
                find:        'tslib',
                replacement: '../../node_modules/tslib/tslib.es6.js'
            }]
        }),
        commonjs(),
        typescript({ include: ['*.+(j|t)s', '**/*.+(j|t)s', '../**/*.+(j|t)s'] }),

        //NOTE: Need to keep this after the typescript plugin to allow using both async/await and TypeScript
        inject({ Promise: 'pinkie' }),
    ]
}));

export default CONFIG;
