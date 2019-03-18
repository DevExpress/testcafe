import { getFreePort } from 'endpoint-utils';
import getConfig from './config';
import createTempProfile from './create-temp-profile';
import isDocker from 'is-docker';

export default async function (proxyHostName, configString) {
    const config         = getConfig(configString);
    const tempProfileDir = !config.userProfile ? await createTempProfile(proxyHostName, config) : null;
    const cdpPort        = config.cdpPort || (!config.userProfile ? await getFreePort() : null);
    const inDocker       = isDocker();

    return {
        config,
        cdpPort,
        tempProfileDir,
        inDocker
    };
}
