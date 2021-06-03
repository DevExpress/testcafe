import { getFreePort } from 'endpoint-utils';
import createTempProfile from './create-temp-profile';


export default async function (config) {
    const marionettePort = config.marionettePort || (!config.userProfile ? await getFreePort() : null);
    const runtimeInfo    = { config, marionettePort };

    runtimeInfo.tempProfileDir = !config.userProfile ? await createTempProfile(runtimeInfo) : null;
    runtimeInfo.activeWindowId = null;

    return runtimeInfo;
}
