import tmp from 'tmp';
import getConfig from './config';


function createTempProfileDir () {
    tmp.setGracefulCleanup();

    return tmp.dirSync({ unsafeCleanup: true });
}

export default async function (configString) {
    var config         = getConfig(configString);
    var tempProfileDir = !config.userProfile ? createTempProfileDir() : null;

    return { config, tempProfileDir };
}
