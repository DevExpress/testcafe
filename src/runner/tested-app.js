import { exec } from 'child_process';
import { delimiter as pathDelimiter } from 'path';
import Promise from 'pinkie';
import kill from 'tree-kill';
import OS from 'os-family';
import delay from '../utils/delay';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import resolvePathRelativelyCwd from '../utils/resolve-path-relatively-cwd';

const MODULES_BIN_DIR = resolvePathRelativelyCwd('./node_modules/.bin');

const ENV_PATH_KEY = (function () {
    if (OS.win) {
        let pathKey = 'Path';

        Object.keys(process.env).forEach(key => {
            if (key.toLowerCase() === 'path')
                pathKey = key;
        });

        return pathKey;
    }

    return 'PATH';
})();


export default class TestedApp {
    constructor () {
        this.process      = null;
        this.errorPromise = null;
        this.killed       = false;
    }

    async start (command, initDelay) {
        this.errorPromise = new Promise((resolve, reject) => {
            const env       = Object.assign({}, process.env);
            const path      = env[ENV_PATH_KEY] || '';
            const pathParts = path.split(pathDelimiter);

            pathParts.unshift(MODULES_BIN_DIR);

            env[ENV_PATH_KEY] = pathParts.join(pathDelimiter);

            this.process = exec(command, { env }, err => {
                if (!this.killed && err) {
                    const message = err.stack || String(err);

                    reject(new GeneralError(RUNTIME_ERRORS.testedAppFailedWithError, message));
                }
            });
        });

        await Promise.race([
            delay(initDelay),
            this.errorPromise
        ]);
    }

    async kill () {
        this.killed = true;

        const killPromise = new Promise(resolve => kill(this.process.pid, 'SIGTERM', resolve));

        await killPromise;
    }
}
