#!/usr/bin/env node

'use strict';

const path          = require('path');
const url           = require('url');
const v8FlagsFilter = require('bin-v8-flags-filter');

const EXPERIMENTAL_DEBUG_OPTION = '--experimental-debug';
const EXPERIMENTAL_ESM_OPTION   = '--experimental-esm';

if (process.argv.slice(2).includes(EXPERIMENTAL_DEBUG_OPTION))
    require('../lib/cli');

else {
    const forcedNodeArgs = [];

    if (process.argv.slice(2).includes(EXPERIMENTAL_ESM_OPTION)) {
        forcedNodeArgs.push('--no-warnings');
        forcedNodeArgs.push(`--experimental-loader=${url.pathToFileURL(path.join(__dirname, '../lib/compiler/esm-loader.js')).href}`);
    }

    v8FlagsFilter(path.join(__dirname, '../lib/cli'), {
        useShutdownMessage: true,
        forcedNodeArgs,
    });
}
