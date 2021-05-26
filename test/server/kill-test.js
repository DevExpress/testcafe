const sinon     = require('sinon');
const assert    = require('assert');
const osFamily = require('os-family');
const utilsProcess = require('../../lib/utils/process');
const childProcess = require('child_process');

const BROWSER_ID = 1;
const HARD_KILL_FLAG = 'SIGKILL';

describe('PROCESS KILLER', () => {
    if (osFamily.win) {
        describe('Windows process killer', () => {
            it('Should call process.kill()', async () => {
                let winProcessKilled = false;

                const stubKill = sinon.stub(process, 'kill').callsFake(() => {
                    winProcessKilled = true;
                });

                await utilsProcess.killBrowserProcess(BROWSER_ID);

                stubKill.restore();
                assert.deepStrictEqual(winProcessKilled, true);
            });
        });
    }
    else {
        describe('Unix process killer', () => {
            const LITTLE_DELAY = 500;
            const CHECK_KILLED_DELAY = 2000;

            const stubChildProcess = {
                stdout: {
                    on: () => {}
                },
                stderr: {
                    on: () => {}
                },
                on: (event, listener) => {
                    if (event === 'exit')
                        listener();
                }
            };

            it('Should try simple kill and stop if it works', async function () {
                // After killing the process, program should wait some time before checking whether it is killed
                // In test we should wait a little bit more
                this.timeout(LITTLE_DELAY + CHECK_KILLED_DELAY);

                let getInfoCount = 0;

                stubChildProcess.stdout.on = (event, listener) => {
                    if (event === 'data' && getInfoCount === 0) {
                        listener('1 1');
                        getInfoCount++;
                    }
                };

                let unixProcessKilled = false;

                const stubSpawn = sinon.stub(childProcess, 'spawn').returns(stubChildProcess);

                const stubKill = sinon.stub(process, 'kill').callsFake((processId, flag) => {
                    if (flag !== HARD_KILL_FLAG)
                        unixProcessKilled = true;
                });

                await utilsProcess.killBrowserProcess(BROWSER_ID);
                assert.deepStrictEqual(unixProcessKilled, true);

                stubSpawn.restore();
                stubKill.restore();
            });
            it('Should try second simple kill 2s after first try and stop if it works', async function () {
                // After killing the process, program should wait some time before checking whether it is killed
                // In test we should wait a little bit more
                const SUPPOSED_KILL_TRIES = 2;

                this.timeout(LITTLE_DELAY + CHECK_KILLED_DELAY * SUPPOSED_KILL_TRIES);

                let getInfoCount = 0;

                stubChildProcess.stdout.on = (event, listener) => {
                    if (event === 'data' && getInfoCount <= 1) {
                        listener('1 1');
                        getInfoCount++;
                    }
                };

                let unixProcessKilled = false;
                let killCount = 0;

                const stubSpawn = sinon.stub(childProcess, 'spawn').returns(stubChildProcess);

                const stubKill = sinon.stub(process, 'kill').callsFake((processId, flag) => {
                    killCount++;

                    if (killCount === SUPPOSED_KILL_TRIES && flag !== HARD_KILL_FLAG)
                        unixProcessKilled = true;
                });

                await utilsProcess.killBrowserProcess(BROWSER_ID);
                assert.deepStrictEqual(unixProcessKilled, true);

                stubSpawn.restore();
                stubKill.restore();
            });
            it('Should try kill with hard kill flag 2s after second try and stop if it works', async function () {
                // After killing the process, program should wait some time before checking whether it is killed
                // In test we should wait a little bit more
                const SUPPOSED_KILL_TRIES = 3;

                this.timeout(LITTLE_DELAY + CHECK_KILLED_DELAY * SUPPOSED_KILL_TRIES);

                let getInfoCount = 0;

                stubChildProcess.stdout.on = (event, listener) => {
                    if (event === 'data' && getInfoCount <= SUPPOSED_KILL_TRIES) {
                        listener('1 1');
                        getInfoCount++;
                    }
                };

                let unixProcessKilled = false;
                let killCount = 0;

                const stubSpawn = sinon.stub(childProcess, 'spawn').returns(stubChildProcess);

                const stubKill = sinon.stub(process, 'kill').callsFake((processId, flag) => {
                    killCount++;

                    if (killCount === SUPPOSED_KILL_TRIES && flag === HARD_KILL_FLAG)
                        unixProcessKilled = true;
                });

                await utilsProcess.killBrowserProcess(BROWSER_ID);
                assert.deepStrictEqual(unixProcessKilled, true);

                stubSpawn.restore();
                stubKill.restore();
            });
        });
    }
});
