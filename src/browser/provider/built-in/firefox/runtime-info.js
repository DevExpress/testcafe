import { getFreePort } from 'endpoint-utils';
import getConfig from './config';
import createTempProfileDir from './create-temp-profile-dir';


export default async function (configString) {
    const config         = getConfig(configString);
    const marionettePort = config.marionettePort || (!config.userProfile ? await getFreePort() : null);
    const runtimeInfo    = { config, marionettePort };

    runtimeInfo.tempProfileDir = !config.userProfile ? await createTempProfileDir(runtimeInfo) : null;

    return runtimeInfo;
}
