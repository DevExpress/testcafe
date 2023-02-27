import os from 'os';
import { exec } from './promisified-functions';

const PLATFORM = {
    WIN:   'win32',
    LINUX: 'linux',
    MAC:   'darwin',
};

const VM_REGEX = /virtual|vmware|hyperv|wsl|hyper-v|microsoft|parallels|qemu/gi;

const MAC_COMMAND = 'ioreg -l | grep -e Manufacturer -e \'Vendor Name\'';

const LINUX_COMMAND         = 'systemd-detect-virt';
const NOT_FOUND_REGEX_LINUX = /systemd-detect-virt: not found/ig;

const VM_BIOS          = '0';
const WINDOWS_COMMANDS = {
    BIOS_NUMBER_COMMAND:  'WMIC BIOS GET SERIALNUMBER',
    MODEL_COMMAND:        'WMIC COMPUTERSYSTEM GET MODEL',
    MANUFACTURER_COMMAND: 'WMIC COMPUTERSYSTEM GET MANUFACTURER',
};

async function getCommandOutput (command: string): Promise<string> {
    const { stdout } = await exec(command);

    return stdout;
}

async function isLinuxVM (): Promise<boolean> {
    let isVM = false;

    try {
        await exec(LINUX_COMMAND);

        isVM = true;
    }
    catch (error: any) {
        isVM = NOT_FOUND_REGEX_LINUX.test(error.stderr);
    }

    return isVM;
}

async function isWinVM (): Promise<boolean> {
    const biosNumberOutput   = await getCommandOutput(WINDOWS_COMMANDS.BIOS_NUMBER_COMMAND);
    const modelOutput        = await getCommandOutput(WINDOWS_COMMANDS.MODEL_COMMAND);
    const manufacturerOutput = await getCommandOutput(WINDOWS_COMMANDS.MANUFACTURER_COMMAND);

    return biosNumberOutput === VM_BIOS || VM_REGEX.test(modelOutput) || VM_REGEX.test(manufacturerOutput);
}

async function isMacVM (): Promise<boolean> {
    return VM_REGEX.test(await getCommandOutput(MAC_COMMAND));
}

export async function checkIsVM (): Promise<boolean> {
    switch (os.platform()) {
        case PLATFORM.LINUX: return await isLinuxVM();
        case PLATFORM.WIN: return await isWinVM();
        case PLATFORM.MAC: return await isMacVM();
        default:
            return false;
    }
}
