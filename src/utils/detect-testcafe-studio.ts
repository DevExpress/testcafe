import fs from 'fs';
import path from 'path';
import OS from 'os-family';

const PROCESS_CHECK_TIMEOUT             = 1000;
const CHECK_PARENT_PROCESS_MESSAGE_TYPE = 'checkParentProcess';
const TESTCAFE_STUDIO_PROCESS_MESSAGE   = 'TestCafeStudio';
const TESTCAFE_STUDIO_CONFIG_DIRECTORY  = 'testcafe-studio';

export default function (): Promise<boolean> {
    return Promise.race<boolean>([new Promise(resolve => {
        const { env } = process;

        let homeDir;
        let studioWasOnMachine = false;

        if (OS.win)
            homeDir = env.APPDATA;
        else if (OS.linux)
            homeDir = env.XDG_CONFIG_HOME || env.HOME && path.join(env.HOME, '.config');
        else if (OS.mac)
            homeDir = env.XDG_CONFIG_HOME || env.HOME && path.join(env.HOME, 'Library/Application Support');

        studioWasOnMachine = !!homeDir && fs.existsSync(path.join(homeDir, TESTCAFE_STUDIO_CONFIG_DIRECTORY));

        process.once('message', ({ type, message }) => {
            if (type === CHECK_PARENT_PROCESS_MESSAGE_TYPE)
                resolve(studioWasOnMachine || message === TESTCAFE_STUDIO_PROCESS_MESSAGE);
        });

        if (process.send)
            process.send({ type: CHECK_PARENT_PROCESS_MESSAGE_TYPE });
        else
            resolve(studioWasOnMachine);
    }), new Promise(resolve => setTimeout(() => resolve(false), PROCESS_CHECK_TIMEOUT))]);
}
