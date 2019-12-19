import ChromeRuntimeInfo from '../chrome/runtime-info';

export default class EdgeChromiumRuntimeInfo extends ChromeRuntimeInfo {
    async createTempProfile (proxyHostName: string, allowMultipleWindows: boolean) {
        return await super.createTempProfile(proxyHostName, allowMultipleWindows);
    }
}
