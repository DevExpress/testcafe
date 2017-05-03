import tmp from 'tmp';
import { getFreePort } from 'endpoint-utils';
import getConfig from './config';


function createTempUserDataDir () {
    tmp.setGracefulCleanup();

    return tmp.dirSync({ unsafeCleanup: true });
}

export default async function (configString) {
    var config          = getConfig(configString);
    var tempUserDataDir = createTempUserDataDir();
    var cdpPort         = config.cdpPort || await getFreePort();

    return { config, cdpPort, tempUserDataDir };
}
