#!/usr/bin/env node

'use strict';

const path          = require('path');
const v8FlagsFilter = require('bin-v8-flags-filter');

const EXPERIMENTAL_DEBUG_OPTION = '--experimental-debug';

if (process.argv.slice(2).includes(EXPERIMENTAL_DEBUG_OPTION))
    require('../lib/cli');

else
    v8FlagsFilter(path.join(__dirname, '../lib/cli'), { useShutdownMessage: true });
