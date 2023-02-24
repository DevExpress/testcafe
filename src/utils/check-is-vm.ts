import { exec } from 'child_process';
import os from 'os';

const WIN_PLATFORM   = 'win32';
const LINUX_PLATFORM = 'linux';
const MAC_PLATFORM   = 'darwin';
const VM_REGEX = /virtual|vmware|hyperv|wsl|hyper-v|microsoft|parallels|qemu/gi;

function getCommandOutput (command: string): Promise<string> {
    return new Promise(resolve => {
        exec(command, (error, stdout, stderr) => resolve(stdout));
    });
}

function isLinuxVM (): Promise<boolean> {
    const LINUX_COMMAND   = 'systemd-detect-virt';
    const NOT_FOUND_REGEX = /systemd-detect-virt: not found/ig;

    return new Promise(resolve => {
        let error = '';

        exec(LINUX_COMMAND, (err, stdout, stderr) => {
            error = stderr;
        }).on('exit', code => resolve(!NOT_FOUND_REGEX.test(error) || code === 0));
    });
}

async function isWinVM () {
    const VM_BIOS              = '0';
    const BIOS_NUMBER_COMMAND  = 'WMIC BIOS GET SERIALNUMBER';
    const MODEL_COMMAND        = 'WMIC COMPUTERSYSTEM GET MODEL';
    const MANUFACTURER_COMMAND = 'WMIC COMPUTERSYSTEM GET MANUFACTURER';

    const biosNumberOutput   = await getCommandOutput(BIOS_NUMBER_COMMAND);
    const modelOutput        = await getCommandOutput(MODEL_COMMAND);
    const manufacturerOutput = await getCommandOutput(MANUFACTURER_COMMAND);

    return biosNumberOutput === VM_BIOS || VM_REGEX.test(modelOutput) || VM_REGEX.test(manufacturerOutput);
}

async function isMacVM () {
    const MAC_COMMAND = 'ioreg -l | grep -e Manufacturer -e \'Vendor Name\'';

    return VM_REGEX.test(await getCommandOutput(MAC_COMMAND));
}

export async function checkIsVM (): Promise<boolean> {
    switch (os.platform()) {
        case LINUX_PLATFORM: return await isLinuxVM();
        case WIN_PLATFORM: return await isWinVM();
        case MAC_PLATFORM: return await isMacVM();
        default:
            return false;
    }
}
