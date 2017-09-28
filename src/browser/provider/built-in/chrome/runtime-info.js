import tmp from 'tmp';
import { getFreePort } from 'endpoint-utils';
import getConfig from './config';


var commonTempProfile = null;

function getTempProfileDir (config) {
    tmp.setGracefulCleanup();

    var tempProfile            = commonTempProfile;
    var shouldUseCommonProfile = !config.headless && !config.emulation;

    if (!shouldUseCommonProfile || !commonTempProfile)
        tempProfile = tmp.dirSync({ unsafeCleanup: true });

    if (shouldUseCommonProfile && !commonTempProfile)
        commonTempProfile = tempProfile;

    return tempProfile;
}

export default async function (configString) {
    var config          = getConfig(configString);
    var tempProfileDir = !config.userProfile ? getTempProfileDir(config) : null;
    var cdpPort         = config.headless || config.emulation ? config.cdpPort || await getFreePort() : null;

    return { config, cdpPort, tempProfileDir };
}
