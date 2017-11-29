import path from 'path';
import tmp from 'tmp';
import { getFreePort } from 'endpoint-utils';
import getConfig from './config';
import { writeFile, ensureDir } from '../../../../utils/promisified-functions';


var commonTempProfile = null;

async function createTempUserDir () {
    tmp.setGracefulCleanup();

    const tempDir        = tmp.dirSync({ unsafeCleanup: true });
    const profileDirName = path.join(tempDir.name, 'Default');

    await ensureDir(profileDirName);

    const preferences = {
        devtools: {
            preferences: {
                currentDockState: '"undocked"',
                lastDockState:    '"bottom"'
            }
        }
    };

    await writeFile(path.join(profileDirName, 'Preferences'), JSON.stringify(preferences));
    await writeFile(path.join(tempDir.name, 'First Run'), '');

    return tempDir;
}

async function getTempProfileDir (config) {

    var tempProfile            = commonTempProfile;
    var shouldUseCommonProfile = !config.headless && !config.emulation;

    if (!shouldUseCommonProfile || !commonTempProfile)
        tempProfile = await createTempUserDir();

    if (shouldUseCommonProfile && !commonTempProfile)
        commonTempProfile = tempProfile;

    return tempProfile;
}

export default async function (configString) {
    var config          = getConfig(configString);
    var tempProfileDir = !config.userProfile ? await getTempProfileDir(config) : null;
    var cdpPort         = config.headless || config.emulation ? config.cdpPort || await getFreePort() : null;

    return { config, cdpPort, tempProfileDir };
}
