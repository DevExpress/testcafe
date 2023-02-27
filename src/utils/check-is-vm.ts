import os from 'os';
import { exec } from './promisified-functions';

const PLATFORM = {
    WIN:   'win32',
    LINUX: 'linux',
    MAC:   'darwin',
};

const VM_REGEX              = /virtual|vmware|hyperv|wsl|hyper-v|microsoft|parallels|qemu/gi;
const NOT_FOUND_REGEX_LINUX = /systemd-detect-virt: not found/ig;

const VM_BIOS  = '0';
const COMMANDS = {
    WINDOWS_BIOS_NUMBER:  'WMIC BIOS GET SERIALNUMBER',
    WINDOWS_MODEL:        'WMIC COMPUTERSYSTEM GET MODEL',
    WINDOWS_MANUFACTURER: 'WMIC COMPUTERSYSTEM GET MANUFACTURER',
    LINUX_DETECT_VM:      'systemd-detect-virt',
    MAC_MANUFACTURER:     'ioreg -l | grep -e Manufacturer -e \'Vendor Name\'',
};

async function getCommandOutput (command: string): Promise<string> {
    const { stdout } = await exec(command);

    return stdout;
}

async function isLinuxVM (): Promise<boolean> {
    let isVM = false;

    try {
        await exec(COMMANDS.LINUX_DETECT_VM);

        isVM = true;
    }
    catch (error: any) {
        isVM = NOT_FOUND_REGEX_LINUX.test(error.stderr);
    }

    return isVM;
}

async function isWinVM (): Promise<boolean> {
    const biosNumberOutput   = await getCommandOutput(COMMANDS.WINDOWS_BIOS_NUMBER);
    const modelOutput        = await getCommandOutput(COMMANDS.WINDOWS_MODEL);
    const manufacturerOutput = await getCommandOutput(COMMANDS.WINDOWS_MANUFACTURER);

    return biosNumberOutput === VM_BIOS || VM_REGEX.test(modelOutput) || VM_REGEX.test(manufacturerOutput);
}

async function isMacVM (): Promise<boolean> {
    return VM_REGEX.test(await getCommandOutput(COMMANDS.MAC_MANUFACTURER));
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
