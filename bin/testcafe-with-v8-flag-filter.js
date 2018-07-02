#!/usr/bin/env node

'use strict';

var path          = require('path');
var v8FlagsFilter = require('bin-v8-flags-filter');

v8FlagsFilter(path.join(__dirname, '../lib/cli'), { useShutdownMessage: true });
