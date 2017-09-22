import tmp from 'tmp';
import { getFreePort } from 'endpoint-utils';
import getConfig from './config';


function createTempProfileDir () {
    tmp.setGracefulCleanup();

    return tmp.dirSync({ unsafeCleanup: true });
}

export default async function (configString) {
    var config          = getConfig(configString);
    var tempProfileDir = !config.userProfile ? createTempProfileDir() : null;
    var cdpPort         = config.headless || config.emulation ? config.cdpPort || await getFreePort() : null;

    return { config, cdpPort, tempProfileDir };
}
