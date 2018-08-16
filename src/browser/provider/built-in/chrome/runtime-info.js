import { getFreePort } from 'endpoint-utils';
import getConfig from './config';
import createTempProfile from './create-temp-profile';


export default async function (proxyHostName, configString) {
    var config         = getConfig(configString);
    var tempProfileDir = !config.userProfile ? await createTempProfile(proxyHostName, config) : null;
    var cdpPort        = config.cdpPort || (!config.userProfile ? await getFreePort() : null);

    return { config, cdpPort, tempProfileDir };
}
