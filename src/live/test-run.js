import Promise from 'pinkie';
import TestRun from '../test-run';
import COMMAND_TYPE from '../test-run/commands/type';

const UNLOCK_PAGE_COMMAND      = 'unlock-page';
const TEST_RUN_ABORTED_MESSAGE = 'Test run aborted';

export const TestRunCtorFactory = function (callbacks, command, liveTestRunStorage) {
    const { created, started, done, readyToNext } = callbacks;
    const { registerStopHandler }    = command;

    return class LiveModeTestRun extends TestRun {
        constructor (test, browserConnection, screenshotCapturer, warningLog, opts) {
            super(test, browserConnection, screenshotCapturer, warningLog, opts);

            this[liveTestRunStorage] = { test, stopping: false, stop: false, isInRoleInitializing: false };

            created(this, test);

            registerStopHandler(this, () => {
                this[liveTestRunStorage].stop = true;
            });
        }

        start () {
            started(this);
            super.start.apply(this, arguments);
        }

        _useRole (...args) {
            this[liveTestRunStorage].isInRoleInitializing = true;

            return super._useRole.apply(this, args)
                .then(res => {
                    this[liveTestRunStorage].isInRoleInitializing = false;

                    return res;
                })
                .catch(err => {
                    this[liveTestRunStorage].isInRoleInitializing = false;

                    throw err;
                });
        }

        executeCommand (commandToExec, callsite, forced) {
            // NOTE: don't close the page and the session when the last test in the queue is done
            if (commandToExec.type === COMMAND_TYPE.testDone && !forced) {
                done(this, this[liveTestRunStorage].stop)
                    .then(() => this.executeCommand(commandToExec, callsite, true))
                    .then(() => readyToNext(this));

                this.executeCommand({ type: UNLOCK_PAGE_COMMAND }, null);

                return Promise.resolve();
            }

            if (this[liveTestRunStorage].stop && !this[liveTestRunStorage].stopping &&
                !this[liveTestRunStorage].isInRoleInitializing) {
                this[liveTestRunStorage].stopping = true;

                return Promise.reject(new Error(TEST_RUN_ABORTED_MESSAGE));
            }

            return super.executeCommand(commandToExec, callsite);
        }
    };
};
