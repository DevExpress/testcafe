import fs from 'fs';
import path from 'path';
import OS from 'os-family';

const PROCESS_CHECK_TIMEOUT = 1000;

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
            homeDir = env.XDG_CONFIG_HOME || '~/Library/Application Support';


        console.log(homeDir);

        studioWasOnMachine = !!homeDir && fs.existsSync(path.join(homeDir, 'testcafe-studio'));

        if (studioWasOnMachine)
            console.log(' ----------> Studio was on the machine!!!! <--------------');

        process.on('message', ({ type, message }) => {
            if (type === 'checkParentProcess' && message === 'TestCafeStudio')
                console.log(' ----------> It\'s Studio!!!! <--------------');

            resolve(studioWasOnMachine || type === 'checkParentProcess' && message === 'TestCafeStudio');
        });

        if (process.send)
            process.send({ type: 'checkParentProcess' });
        else
            resolve(studioWasOnMachine);
    }), new Promise(resolve => setTimeout(() => resolve(false), PROCESS_CHECK_TIMEOUT))]);
}
