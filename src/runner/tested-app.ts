import { ChildProcess, spawn } from 'child_process';
import { delimiter as pathDelimiter } from 'path';
import promisifyEvent from 'promisify-event';
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

    async _run (command: string):Promise<void> {
        const env       = Object.assign({}, process.env);
        const path      = env[ENV_PATH_KEY] || '';
        const pathParts = path.split(pathDelimiter);

        pathParts.unshift(MODULES_BIN_DIR);

        env[ENV_PATH_KEY] = pathParts.join(pathDelimiter);

        this._process = spawn(command, { shell: true, env });

        this._process.stdout.on('data', data => this.stdoutLogger(String(data)));
        this._process.stderr.on('data', data => this.stderrLogger(String(data)));

        try {
            await promisifyEvent(this._process, 'error');
        }
        catch (err) {
            if (this._killed)
                return;

            const message = err.stack || String(err);

            throw new GeneralError(RUNTIME_ERRORS.testedAppFailedWithError, message);
        }
    }

    public async start (command: string, initDelay: number): Promise<void> {
        await Promise.race([
            delay(initDelay),
            this._run(command)
        ]);
    }

    public async kill (): Promise<void> {
        this._killed = true;

        const killPromise = new Promise(resolve => kill((this._process as ChildProcess).pid, 'SIGTERM', resolve));

        await killPromise;
    }
}
