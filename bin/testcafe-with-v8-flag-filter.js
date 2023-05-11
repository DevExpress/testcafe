#!/usr/bin/env node

'use strict';

const path          = require('path');
const url           = require('url');
const v8FlagsFilter = require('@devexpress/bin-v8-flags-filter');

const ESM_OPTION = '--esm';

const forcedArgs = [];

if (process.argv.slice(2).includes(ESM_OPTION)) {
    forcedArgs.push('--no-warnings');
    forcedArgs.push(`--experimental-loader=${url.pathToFileURL(path.join(__dirname, '../lib/compiler/esm-loader.js')).href}`);
}

v8FlagsFilter(path.join(__dirname, '../lib/cli'), {
    useShutdownMessage: true,
    forcedArgs,
});
