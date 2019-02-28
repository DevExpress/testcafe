import { spawn } from 'child_process';
import Promise from 'pinkie';
import OS from 'os-family';
import promisifyEvent from 'promisify-event';
import delay from '../utils/delay';

const CHECK_PROCESS_IS_KILLED_TIMEOUT = 5000;
const CHECK_KILLED_DELAY              = 1000;
const NEW_LINE_SEPERATOR_RE           = /(\r\n)|(\n\r)|\n|\r/g;
const cannotGetListOfProcessError     = 'Cannot get list of processes';
const killProcessTimeoutError         = 'Kill process timeout';

function getProcessOutputUnix () {
    const error = new Error(cannotGetListOfProcessError);

    return new Promise((resolve, reject) => {
        const child = spawn('ps', ['-eo', 'pid,command']);
        let stdout  = '';
        let stderr  = '';

        child.stdout.on('data', data => {
            stdout += data.toString();
        });

        child.stderr.on('data', data => {
            stderr += data.toString();
        });

        child.on('exit', () => {
            if (stderr)
                reject(error);
            else
                resolve(stdout);
        });

        child.on('error', () => {
            reject(error);
        });
    });
}

function findProcessIdUnix (browserId, psOutput) {
    const processIdRegex   = new RegExp('^\\s*(\\d+)\\s+.*' + browserId);
    const lines            = psOutput.split(NEW_LINE_SEPERATOR_RE);

    for (let i = 0; i < lines.length; i++) {
        const match = processIdRegex.exec(lines[i]);

        if (match)
            return parseInt(match[1], 10);
    }

    return null;
}

function isProcessExistUnix (processId, psOutput) {
    const processIdRegex   = new RegExp('^\\s*' + processId + '\\s+.*');
    const lines            = psOutput.split(NEW_LINE_SEPERATOR_RE);

    return lines.some(line => processIdRegex.test(line));
}

async function findProcessUnix (browserId) {
    const output = await getProcessOutputUnix();

    return findProcessIdUnix(browserId, output);
}

async function checkUnixProcessIsKilled (processId) {
    const output = await getProcessOutputUnix();

    if (isProcessExistUnix(processId, output)) {
        await delay(CHECK_KILLED_DELAY);

        await checkUnixProcessIsKilled();
    }
}

async function killProcessUnix (processId) {
    let timeoutError = false;

    process.kill(processId);

    const killTimeoutTimer = delay(CHECK_PROCESS_IS_KILLED_TIMEOUT)
        .then(() => {
            timeoutError = true;
        });

    return Promise.race([killTimeoutTimer, checkUnixProcessIsKilled(processId)]).then(() => {
        if (timeoutError)
            throw new Error(killProcessTimeoutError);
    });
}

async function runWMIC (args) {
    const wmicProcess = spawn('wmic.exe', args, { detached: true });

    let wmicOutput  = '';

    wmicProcess.stdout.on('data', data => {
        wmicOutput += data.toString();
    });

    try {
        await Promise.race([
            promisifyEvent(wmicProcess.stdout, 'end'),
            promisifyEvent(wmicProcess, 'error')
        ]);

        return wmicOutput;
    }
    catch (e) {
        return '';
    }
}

async function findProcessWin (browserId) {
    const wmicArgs    = ['process', 'where', `commandline like '%${browserId}%' and name <> 'cmd.exe' and name <> 'wmic.exe'`, 'get', 'processid'];
    const wmicOutput  = await runWMIC(wmicArgs);
    let processList = wmicOutput.split(/\s*\n/);

    processList = processList
    // NOTE: remove list's header and empty last element, caused by trailing newline
        .slice(1, -1)
        .map(pid => ({ pid: Number(pid) }));

    return processList[0] ? processList[0].pid : null;
}

export async function killBrowserProcess (browserId) {
    const processId = OS.win ? await findProcessWin(browserId) : await findProcessUnix(browserId);

    if (!processId)
        return true;

    try {
        if (OS.win)
            process.kill(processId);
        else
            await killProcessUnix(processId);

        return true;
    }
    catch (e) {
        return false;
    }
}
