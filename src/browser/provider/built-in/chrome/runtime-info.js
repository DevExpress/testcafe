import { getFreePort } from 'endpoint-utils';
import getConfig from './config';
import createTempProfile from './create-temp-profile';


var commonTempProfile = null;

async function getTempProfile (proxyHostName, config) {

    var tempProfile            = commonTempProfile;
    var shouldUseCommonProfile = !config.headless && !config.emulation;

    if (!shouldUseCommonProfile || !commonTempProfile)
        tempProfile = await createTempProfile(proxyHostName);

    if (shouldUseCommonProfile && !commonTempProfile)
        commonTempProfile = tempProfile;

    return tempProfile;
}

export default async function (proxyHostName, configString) {
    var config         = getConfig(configString);
    var tempProfileDir = !config.userProfile ? await getTempProfile(proxyHostName, config) : null;
    var cdpPort        = config.cdpPort || (!config.userProfile ? await getFreePort() : null);

    return { config, cdpPort, tempProfileDir };
}
