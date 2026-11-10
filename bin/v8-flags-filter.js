'use strict';

/*
The MIT License (MIT)

Copyright (c) 2016 Ivan Nikulin (ifaaan@gmail.com, https://github.com/inikulin)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const { spawn } = require('child_process');

const FLAGS = [
    'debug',
    '--debug',
    '--debug-brk',
    '--inspect',
    '--inspect-brk',
    '--expose-gc',
    '--gc-global',
    '--es_staging',
    '--no-deprecation',
    '--prof',
    '--log-timer-events',
    '--throw-deprecation',
    '--trace-deprecation',
    '--use_strict',
    '--allow-natives-syntax',
    '--perf-basic-prof',
    '--experimental-repl-await',
    '--experimental-loader',
    '--no-warnings',
];

const FLAG_PREFIXES = [
    '--harmony',
    '--trace',
    '--icu-data-dir',
    '--max-old-space-size',
    '--preserve-symlinks',
];

const DEFAULT_FORCED_KILL_DELAY = 30000;

function getChildArgs (cliPath, ignore) {
    const args = [cliPath];

    process.argv.slice(2).forEach(arg => {
        const flag = arg.split('=')[0];

        if (ignore.indexOf(flag) > -1) {
            args.push(arg);
            return;
        }

        if (FLAGS.indexOf(flag) > -1) {
            args.unshift(arg);
            return;
        }

        if (FLAG_PREFIXES.some(prefix => arg.indexOf(prefix) === 0)) {
            args.unshift(arg);
            return;
        }

        args.push(arg);
    });

    return args;
}

function setupSignalHandler (signal, childProcess, useShutdownMessage, forcedKillDelay) {
    function forceKill () {
        childProcess.kill('SIGTERM');
    }

    function handler () {
        if (useShutdownMessage)
            childProcess.send('shutdown');
        else
            childProcess.kill(signal);

        setTimeout(forceKill, forcedKillDelay).unref();
    }

    process.on(signal, handler);
}

module.exports = function (cliPath, opts) {
    opts = opts || {};

    const useShutdownMessage = opts.useShutdownMessage;
    const forcedKillDelay    = opts.forcedKillDelay || DEFAULT_FORCED_KILL_DELAY;
    const ignore             = opts.ignore || [];
    const args               = getChildArgs(cliPath, ignore);

    if (opts.forcedArgs && opts.forcedArgs.length > 0)
        args.unshift(...opts.forcedArgs);

    const cliProc = spawn(process.execPath, args, {
        stdio: [process.stdin, process.stdout, process.stderr, useShutdownMessage ? 'ipc' : null],
    });

    cliProc.on('exit', (code, signal) => {
        if (useShutdownMessage && process.disconnect)
            process.disconnect();

        process.on('exit', () => {
            if (signal)
                process.kill(process.pid, signal);
            else
                process.exit(code);
        });
    });

    setupSignalHandler('SIGINT', cliProc, useShutdownMessage, forcedKillDelay);
    setupSignalHandler('SIGBREAK', cliProc, useShutdownMessage, forcedKillDelay);

    if (useShutdownMessage) {
        process.on('message', message => {
            if (message === 'shutdown')
                cliProc.send('shutdown');
        });
    }
};
