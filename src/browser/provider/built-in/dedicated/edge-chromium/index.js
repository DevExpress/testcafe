import dedicatedProviderChrome from '../chrome';
import EdgeChromiumRunTimeInfo from './runtime-info';

export default {
    ...dedicatedProviderChrome,

    async _createRunTimeInfo (hostName, configString, allowMultipleWindows) {
        return await EdgeChromiumRunTimeInfo.create(hostName, configString, allowMultipleWindows);
    },
};
