import { ChildProcess, exec } from 'child_process';
import { delimiter as pathDelimiter } from 'path';
import kill from 'tree-kill';
import OS from 'os-family';
import delay from '../utils/delay';
import { GeneralError } from '../errors/runtime';
import { RUNTIME_ERRORS } from '../errors/types';
import resolvePathRelativelyCwd from '../utils/resolve-path-relatively-cwd';
import debugLogger from 'debug';

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
    private _killed: boolean;
    public errorPromise: null | Promise<void>;
    private _process: null | ChildProcess;
    private stdoutLogger: debug.Debugger;
    private stderrLogger: debug.Debugger;

    public constructor () {
        this._process          = null;
        this.errorPromise      = null;
        this._killed           = false;
        this.stdoutLogger      = debugLogger('testcafe:tested-app:stdout');
        this.stderrLogger      = debugLogger('testcafe:tested-app:stderr');
    }

    public async start (command: string, initDelay: number): Promise<void> {
        this.errorPromise = new Promise((resolve, reject) => {
            const env       = Object.assign({}, process.env);
            const path      = env[ENV_PATH_KEY] || '';
            const pathParts = path.split(pathDelimiter);

            pathParts.unshift(MODULES_BIN_DIR);

            env[ENV_PATH_KEY] = pathParts.join(pathDelimiter);

            this._process = exec(command, { env }, (err, stdout, stderr) => {
                this.stdoutLogger(stdout);
                this.stderrLogger(stderr);

                if (!this._killed && err) {
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

    public async kill (): Promise<void> {
        this._killed = true;

        const killPromise = new Promise(resolve => kill((this._process as ChildProcess).pid, 'SIGTERM', resolve));

        await killPromise;
    }
}
