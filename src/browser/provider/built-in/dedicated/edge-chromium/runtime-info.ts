import { getFreePort } from 'endpoint-utils';
import getConfig from './config';
import createTempProfile from './create-temp-profile';
import isDocker from 'is-docker';
import TempDirectory from '../../../../../utils/temp-directory';
import { Dictionary } from '../../../../../configuration/interfaces';

interface ChromeRuntimeInfo {
    config: any;
    tempProfileDir: null | TempDirectory;
    cdpPort: null | number;
    inDocker: boolean;
    browserName?: string;
    browserId?: string;
    providerMethods?: Dictionary<Function>;
}

export default async function (proxyHostName: string, configString: string, allowMultipleWindows: boolean): Promise<ChromeRuntimeInfo> {
    const config         = getConfig(configString);
    const tempProfileDir = !config.userProfile ? await createTempProfile(proxyHostName, allowMultipleWindows) : null;
    const cdpPort        = config.cdpPort || (!config.userProfile ? await getFreePort() : null);
    const inDocker       = isDocker();

    return {
        config,
        cdpPort,
        tempProfileDir,
        inDocker
    };
}
