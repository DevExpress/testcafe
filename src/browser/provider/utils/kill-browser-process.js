import OS from 'os-family';
import { findProcess, killProcess, exec } from '../../../utils/promisified-functions';


const BROWSER_CLOSING_TIMEOUT = 5;

async function findProcessWin (processOptions) {
    var cmd         = `wmic process where "commandline like '%${processOptions.arguments}%' and name <> 'cmd.exe' and name <> 'wmic.exe'" get processid`;
    var wmicOutput  = await exec(cmd);
    var processList = wmicOutput.split(/\s*\n/);

    processList = processList
        // NOTE: remove list's header and empty last element, caused by trailing newline
        .slice(1, -1)
        .map(pid => ({ pid: Number(pid) }));

    return processList;
}

export default async function (browserId) {
    var processOptions = { arguments: browserId, psargs: 'aux' };
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
