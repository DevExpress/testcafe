import { exec } from 'child_process';
import { join as pathJoin, delimiter as pathDelimiter } from 'path';
import Promise from 'pinkie';
import kill from 'tree-kill';
import OS from 'os-family';
import delay from '../utils/delay';
import { GeneralError } from '../errors/runtime';
import MESSAGE from '../errors/runtime/message';


const MODULES_BIN_DIR = pathJoin(process.cwd(), './node_modules/.bin');

const ENV_PATH_KEY = (function () {
    if (OS.win) {
        var pathKey = 'Path';

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
            var env       = Object.assign({}, process.env);
            var path      = env[ENV_PATH_KEY] || '';
            var pathParts = path.split(pathDelimiter);

            pathParts.unshift(MODULES_BIN_DIR);

            env[ENV_PATH_KEY] = pathParts.join(pathDelimiter);

            this.process = exec(command, { env }, err => {
                if (!this.killed && err) {
                    var message = err.stack || String(err);

                    reject(new GeneralError(MESSAGE.testedAppFailedWithError, message));
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

        var killPromise = new Promise(resolve => kill(this.process.pid, 'SIGTERM', resolve));

        await killPromise;
    }
}
