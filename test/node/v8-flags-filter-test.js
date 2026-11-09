'use strict';

const assert       = require('node:assert/strict');
const fs           = require('node:fs');
const os           = require('node:os');
const path         = require('node:path');
const { spawnSync } = require('node:child_process');
const { test }     = require('node:test');

test('forwards V8 flags and forced arguments to the child process', t => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'testcafe-v8-flags-filter-'));
    const cliPath = path.join(tempDir, 'cli.js');

    t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));

    fs.writeFileSync(cliPath, 'console.log(JSON.stringify({ args: process.argv.slice(2), execArgv: process.execArgv }));');

    const filterPath = path.resolve(__dirname, '../../bin/v8-flags-filter.js');
    const runner     = `require(${JSON.stringify(filterPath)})(process.argv[1], { forcedArgs: ['--no-deprecation'] });`;
    const result     = spawnSync(process.execPath, [
        '-e',
        runner,
        cliPath,
        '--trace-gc',
        '--allow-natives-syntax',
        '--test-option',
    ], { encoding: 'utf8' });

    assert.equal(result.status, 0, result.stderr);

    const output = JSON.parse(result.stdout.trim().split(/\r?\n/).at(-1));

    assert.deepEqual(output.args, ['--test-option']);
    assert.deepEqual(output.execArgv, ['--no-deprecation', '--allow-natives-syntax', '--trace-gc']);
});
