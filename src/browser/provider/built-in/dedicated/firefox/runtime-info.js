import { getFreePort } from 'endpoint-utils';
import getConfig from './config';
import createTempProfile from './create-temp-profile';


export default async function (configString) {
    const config         = getConfig(configString);
    const marionettePort = config.marionettePort || (!config.userProfile ? await getFreePort() : null);
    const runtimeInfo    = { config, marionettePort };

    runtimeInfo.tempProfileDir = !config.userProfile ? await createTempProfile(runtimeInfo) : null;
    runtimeInfo.activeWindowId = null;

    return runtimeInfo;
}
