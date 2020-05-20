import { getFreePort } from 'endpoint-utils';
import getConfig from './config';
import createTempProfile from './create-temp-profile';
import isDocker from 'is-docker';
import TempDirectory from '../../../../../utils/temp-directory';
import { Dictionary } from '../../../../../configuration/interfaces';

export default class ChromeRuntimeInfo {
    public config: any;
    public tempProfileDir: null | TempDirectory;
    public cdpPort: null | number;
    public inDocker: boolean;
    public browserName?: string;
    public browserId?: string;
    public providerMethods?: Dictionary<Function>;
    public activeWindowId: null | string;

    protected constructor (configString: string) {
        this.config         = getConfig(configString);
        this.tempProfileDir = null;
        this.cdpPort        = this.config.cdpPort;
        this.inDocker       = isDocker();
        this.activeWindowId = null;
    }

    protected async createTempProfile (proxyHostName: string, allowMultipleWindows: boolean): Promise<TempDirectory> {
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
