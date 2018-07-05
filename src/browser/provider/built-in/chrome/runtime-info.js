import { getFreePort } from 'endpoint-utils';
import getConfig from './config';
import createTempUserDir from './create-temp-user-dir';


var commonTempProfile = null;

async function getTempProfileDir (proxyHostName, config) {

    var tempProfile            = commonTempProfile;
    var shouldUseCommonProfile = !config.headless && !config.emulation;

    if (!shouldUseCommonProfile || !commonTempProfile)
        tempProfile = await createTempUserDir(proxyHostName);

    if (shouldUseCommonProfile && !commonTempProfile)
        commonTempProfile = tempProfile;

    return tempProfile;
}

export default async function (proxyHostName, configString) {
    var config         = getConfig(configString);
    var tempProfileDir = !config.userProfile ? await getTempProfileDir(proxyHostName, config) : null;
    var cdpPort        = config.cdpPort || (!config.userProfile ? await getFreePort() : null);

    return { config, cdpPort, tempProfileDir };
}
