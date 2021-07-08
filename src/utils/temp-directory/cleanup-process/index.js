import { spawn } from 'child_process';
import debug from 'debug';
import promisifyEvent from 'promisify-event';
import { sendMessageToChildProcess } from '../../promisified-functions';
import COMMANDS from './commands';


const WORKER_PATH         = require.resolve('./worker');
const WORKER_STDIO_CONFIG = ['ignore', 'pipe', 'pipe', 'ipc'];

const DEBUG_LOGGER = debug('testcafe:utils:temp-directory:cleanup-process');

class CleanupProcess {
    constructor () {
        this.worker       = null;
        this.initialized  = false;
        this.initPromise  = Promise.resolve(void 0);
        this.errorPromise = null;

        this.messageCounter = 0;

        this.pendingResponses = {};
    }

    _sendMessage (id, msg) {
        return Promise.race([
            sendMessageToChildProcess(this.worker, { id, ...msg }),
            this._waitProcessError(),
        ]);
    }

    _onResponse (response) {
        const pendingResponse = this.pendingResponses[response.id];

        if (response.error) {
            if (pendingResponse)
                pendingResponse.control.reject(response.error);
            else
                this.pendingResponses[response.id] = Promise.reject(response.error);
        }
        else if (pendingResponse)
            pendingResponse.control.resolve();
        else
            this.pendingResponses[response.id] = Promise.resolve();
    }

    async _waitResponse (id) {
        if (!this.pendingResponses[id]) {
            const promiseControl = {};

            this.pendingResponses[id] = new Promise((resolve, reject) => {
                Object.assign(promiseControl, { resolve, reject });
            });

            this.pendingResponses[id].control = promiseControl;
        }

        try {
            await this.pendingResponses[id];
        }
        finally {
            delete this.pendingResponses[id];
        }
    }

    async _waitResponseForMessage (msg) {
        const currentId = this.messageCounter;

        this.messageCounter++;

        await this._sendMessage(currentId, msg);
        await this._waitResponse(currentId);
    }

    _waitProcessExit () {
        return promisifyEvent(this.worker, 'exit')
            .then(exitCode => Promise.reject(new Error(`Worker process terminated with code ${exitCode}`)));
    }

    _waitProcessError () {
        if (this.errorPromise)
            return this.errorPromise;

        this.errorPromise = promisifyEvent(this.worker, 'error');

        this.errorPromise.then(() => {
            this.errorPromise = null;
        });

        return this.errorPromise;
    }

    _setupWorkerEventHandlers () {
        this.worker.on('message', message => this._onResponse(message));

        this.worker.stdout.on('data', data => DEBUG_LOGGER('Worker process stdout:\n', String(data)));
        this.worker.stderr.on('data', data => DEBUG_LOGGER('Worker process stderr:\n', String(data)));
    }

    _unrefWorkerProcess () {
        this.worker.unref();
        this.worker.stdout.unref();
        this.worker.stderr.unref();

        const channel = this.worker.channel || this.worker._channel;

        channel.unref();
    }

    _handleProcessError (error) {
        this.initialized = false;

        DEBUG_LOGGER(error);
    }

    init () {
        this.initPromise = this.initPromise
            .then(async initialized => {
                if (initialized !== void 0)
                    return initialized;

                this.worker = spawn(process.argv0, [WORKER_PATH], { detached: true, stdio: WORKER_STDIO_CONFIG });

                this._setupWorkerEventHandlers();
                this._unrefWorkerProcess();

                const exitPromise = this._waitProcessExit();

                try {
                    await Promise.race([
                        this._waitResponseForMessage({ command: COMMANDS.init }),
                        this._waitProcessError(),
                        exitPromise,
                    ]);

                    this.initialized = true;

                    exitPromise.catch(error => this._handleProcessError(error));

                    this.worker.on('error', error => this._handleProcessError(error));
                }
                catch (e) {
                    DEBUG_LOGGER('Failed to start cleanup process');
                    DEBUG_LOGGER(e);

                    this.initialized = false;
                }

                return this.initialized;
            });

        return this.initPromise;
    }

    async addDirectory (path) {
        if (!this.initialized)
            return;

        try {
            await this._waitResponseForMessage({ command: COMMANDS.add, path });
        }
        catch (e) {
            DEBUG_LOGGER(`Failed to add the ${path} directory to cleanup process`);
            DEBUG_LOGGER(e);
        }
    }

    async removeDirectory (path) {
        if (!this.initialized)
            return;

        try {
            await this._waitResponseForMessage({ command: COMMANDS.remove, path });
        }
        catch (e) {
            DEBUG_LOGGER(`Failed to remove the ${path} directory in cleanup process`);
            DEBUG_LOGGER(e);
        }
    }
}

export default new CleanupProcess();
