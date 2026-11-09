'use strict';

const fs            = require('node:fs');
const os            = require('node:os');
const path          = require('node:path');
const { spawnSync } = require('node:child_process');
const { expect }    = require('chai');

describe('V8 flags filter', function () {
    it('forwards V8 flags and forced arguments to the child process', function () {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'testcafe-v8-flags-filter-'));
        const cliPath = path.join(tempDir, 'cli.js');

        try {
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

            expect(result.status, result.stderr).to.equal(0);

            const output = JSON.parse(result.stdout.trim().split(/\r?\n/).at(-1));

            expect(output.args).to.deep.equal(['--test-option']);
            expect(output.execArgv).to.deep.equal(['--no-deprecation', '--allow-natives-syntax', '--trace-gc']);
        }
        finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });
});
