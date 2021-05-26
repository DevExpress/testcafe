const __importDefault = this && this.__importDefault || function (mod) {
    return mod && mod.__esModule ? mod : { 'default': mod };
};
const sinon     = require('sinon');
const assert    = require('assert');
const osFamily = __importDefault(require('os-family'));
const utilsProcess = require('../../lib/utils/process');
const childProcess = require('child_process');

describe('PROCESS KILLER', () => {
    const BROWSER_ID = 1;

    if (osFamily.default.win) {
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
                this.timeout(1000 + CHECK_KILLED_DELAY);

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
                    if (flag !== 'SIGKILL')
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
                this.timeout(1000 + CHECK_KILLED_DELAY * 2);

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
                    if (killCount === 2 && flag !== 'SIGKILL')
                        unixProcessKilled = true;
                });

                await utilsProcess.killBrowserProcess(BROWSER_ID);
                assert.deepStrictEqual(unixProcessKilled, true);

                stubSpawn.restore();
                stubKill.restore();
            });
            it('Should try kill with "SIGKILL"-flag 2s after second try and stop if it works', async function () {
                // After killing the process, program should wait some time before checking whether it is killed
                // In test we should wait a little bit more
                this.timeout(1000 + CHECK_KILLED_DELAY * 3);

                let getInfoCount = 0;

                stubChildProcess.stdout.on = (event, listener) => {
                    if (event === 'data' && getInfoCount <= 3) {
                        listener('1 1');
                        getInfoCount++;
                    }
                };

                let unixProcessKilled = false;
                let killCount = 0;

                const stubSpawn = sinon.stub(childProcess, 'spawn').returns(stubChildProcess);
                const stubKill = sinon.stub(process, 'kill').callsFake((processId, flag) => {
                    killCount++;
                    if (killCount === 3 && flag === 'SIGKILL')
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
