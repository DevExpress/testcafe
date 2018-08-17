import { spawn } from 'child_process';
import OS from 'os-family';
import promisifyEvent from 'promisify-event';
import Promise from 'pinkie';
import { findProcess, killProcess } from '../../../utils/promisified-functions';


const BROWSER_CLOSING_TIMEOUT = 5;

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

async function findProcessWin (processOptions) {
    var wmicArgs    = ['process', 'where', `commandline like '%${processOptions.arguments}%' and name <> 'cmd.exe' and name <> 'wmic.exe'`, 'get', 'processid'];
    var wmicOutput  = await runWMIC(wmicArgs);
    var processList = wmicOutput.split(/\s*\n/);

    processList = processList
        // NOTE: remove list's header and empty last element, caused by trailing newline
        .slice(1, -1)
        .map(pid => ({ pid: Number(pid) }));

    return processList;
}

export default async function (browserId) {
    var processOptions = { arguments: browserId, psargs: '-ef' };
    var processList    = OS.win ? await findProcessWin(processOptions) : await findProcess(processOptions);

    if (!processList.length)
        return true;

    try {
        if (OS.win)
            process.kill(processList[0].pid);
        else
            await killProcess(processList[0].pid, { timeout: BROWSER_CLOSING_TIMEOUT });

        return true;
    }
    catch (e) {
        return false;
    }
}
