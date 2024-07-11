#!/usr/bin/env node

'use strict';

const path          = require('path');
const url           = require('url');
const v8FlagsFilter = require('@devexpress/bin-v8-flags-filter');
const semver        = require('semver');

const ESM_OPTION = '--esm';

const forcedArgs = [];

if (process.argv.slice(2).includes(ESM_OPTION)) {
    forcedArgs.push('--no-warnings');
    if (!semver.satisfies(process.version, '18.19.0 - 18.x || >=20.8.0'))
        forcedArgs.push(`--experimental-loader=${url.pathToFileURL(path.join(__dirname, '../lib/compiler/esm-loader.js')).href}`);
}

v8FlagsFilter(path.join(__dirname, '../lib/cli'), {
    useShutdownMessage: true,
    forcedArgs,
});
