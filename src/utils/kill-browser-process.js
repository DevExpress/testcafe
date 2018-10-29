import { spawn } from 'child_process';
import OS from 'os-family';
import promisifyEvent from 'promisify-event';
import Promise from 'pinkie';
import { findProcess, killProcess } from './promisified-functions';

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

    return processList;
}

export default async function (browserId) {
    let processId = null;

    if (OS.win) {
        const processList = await findProcessWin(browserId);

        if (processList[0])
            processId = processList[0].pid;
    }
    else
        processId = await findProcess(browserId);

    if (!processId)
        return true;

    try {
        if (OS.win)
            process.kill(processId);
        else
            await killProcess(processId);

        return true;
    }
    catch (e) {
        return false;
    }
}
