import { getFreePort } from 'endpoint-utils';
import getConfig from './config';
import createTempProfile from './create-temp-profile';
import isDocker from 'is-docker';
import TempDirectory from '../../../../../utils/temp-directory';
import { Config } from './interfaces';

export default class ChromeRuntimeInfo {
    public config: Config;
    public tempProfileDir: null | TempDirectory;
    public cdpPort: number;
    public inDocker: boolean;
    public browserName?: string;

    protected constructor (configString: string) {
        this.config         = getConfig(configString);
        this.tempProfileDir = null;
        this.cdpPort        = this.config.cdpPort;
        this.inDocker       = isDocker();
    }

    protected async createTempProfile (proxyHostName: string, disableMultipleWindows: boolean): Promise<TempDirectory> {
        return await createTempProfile(proxyHostName, disableMultipleWindows);
    }

    public static async create (proxyHostName: string, configString: string, disableMultipleWindows: boolean): Promise<ChromeRuntimeInfo> {
        const runtimeInfo = new this(configString);

        if (!runtimeInfo.config.userProfile)
            runtimeInfo.tempProfileDir = await runtimeInfo.createTempProfile(proxyHostName, disableMultipleWindows);

        if (!runtimeInfo.cdpPort && !runtimeInfo.config.userProfile)
            runtimeInfo.cdpPort = await getFreePort();

        return runtimeInfo;
    }
}
