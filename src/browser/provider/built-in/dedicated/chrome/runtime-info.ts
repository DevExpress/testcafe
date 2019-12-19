import { getFreePort } from 'endpoint-utils';
import getConfig from './config';
import createTempProfile from './create-temp-profile';
import isDocker from 'is-docker';
import TempDirectory from '../../../../../utils/temp-directory';
import { Dictionary } from '../../../../../configuration/interfaces';

export default class ChromeRuntimeInfo {
    config: any;
    tempProfileDir: null | TempDirectory;
    cdpPort: null | number;
    inDocker: boolean;
    browserName?: string;
    browserId?: string;
    providerMethods?: Dictionary<Function>;

    protected constructor (configString: string) {
        this.config         = getConfig(configString);
        this.tempProfileDir = null;
        this.cdpPort        = this.config.cdpPort;
        this.inDocker       = isDocker();
    }

    protected async createTempProfile (proxyHostName: string, allowMultipleWindows: boolean) {
        return await createTempProfile(proxyHostName, allowMultipleWindows);
    }

    public static async create (proxyHostName: string, configString: string, allowMultipleWindows: boolean): Promise<ChromeRuntimeInfo> {
        const runtimeInfo = new this(configString);

        if (!runtimeInfo.config.userProfile)
            runtimeInfo.tempProfileDir = await runtimeInfo.createTempProfile(proxyHostName, allowMultipleWindows);

        if (!runtimeInfo.cdpPort && !runtimeInfo.config.userProfile)
            runtimeInfo.cdpPort = await getFreePort();

        return runtimeInfo;
    }
}
