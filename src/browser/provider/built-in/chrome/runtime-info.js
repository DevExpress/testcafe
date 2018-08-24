import { getFreePort } from 'endpoint-utils';
import getConfig from './config';
import createTempProfile from './create-temp-profile';


export default async function (proxyHostName, configString) {
    const config         = getConfig(configString);
    const tempProfileDir = !config.userProfile ? await createTempProfile(proxyHostName, config) : null;
    const cdpPort        = config.cdpPort || (!config.userProfile ? await getFreePort() : null);

    return { config, cdpPort, tempProfileDir };
}
