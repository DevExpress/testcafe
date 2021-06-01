import { spawn } from 'child_process';
import OS from 'os-family';
import promisifyEvent from 'promisify-event';
import delay from '../utils/delay';

const CHECK_KILLED_DELAY              = 2000;
const HARD_KILL_FLAG                  = 'SIGKILL';
const NEW_LINE_SEPERATOR_RE           = /(\r\n)|(\n\r)|\n|\r/g;
const cannotGetListOfProcessError     = 'Cannot get list of processes';
const killProcessTimeoutError         = 'Kill process timeout';

function getProcessOutputUnix () {
    const error = new Error(cannotGetListOfProcessError);

    return new Promise((resolve, reject) => {
        const child = spawn('ps', ['-eo', 'pid,command']);

        let stdout = '';
        let stderr = '';

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

function isUnixProcessExist (processId, psOutput) {
    const processIdRegex   = new RegExp('^\\s*' + processId + '\\s+.*');
    const lines            = psOutput.split(NEW_LINE_SEPERATOR_RE);

    return lines.some(line => processIdRegex.test(line));
}

async function findProcessUnix (browserId) {
    const output = await getProcessOutputUnix();

    return findProcessIdUnix(browserId, output);
}

async function isUnixProcessKilled (processId) {
    const output = await getProcessOutputUnix();

    return !isUnixProcessExist(processId, output);
}

async function killUnixProcessSoft (processId) {
    process.kill(processId);
}

async function killUnixProcessHard (processId) {
    process.kill(processId, HARD_KILL_FLAG);
}

async function killProcessUnix (processId) {
    const maxSoftTries = 2;

    let softTries         = 0;
    let unixProcessKilled = false;

    do {
        await killUnixProcessSoft(processId);

        softTries++;

        await delay(CHECK_KILLED_DELAY);

        unixProcessKilled = await isUnixProcessKilled(processId);
    }
    while (!unixProcessKilled && softTries < maxSoftTries);

    unixProcessKilled = await isUnixProcessKilled(processId);

    if (unixProcessKilled)
        return;

    await killUnixProcessHard(processId);

    await delay(CHECK_KILLED_DELAY);

    unixProcessKilled = await isUnixProcessKilled(processId);

    if (unixProcessKilled) return;

    // NOTE: if 2 soft-kill and 1 hard-kill with "SIGKILL"-flag didn't work - throw error
    throw new Error(killProcessTimeoutError);
}

async function runWMIC (args) {
    const wmicProcess = spawn('wmic.exe', args, { detached: true });

    let wmicOutput = '';

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
