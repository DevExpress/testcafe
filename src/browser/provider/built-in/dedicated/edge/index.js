import dedicatedProviderChrome from '../chrome';
import EdgeRunTimeInfo from './runtime-info';

export default {
    ...dedicatedProviderChrome,

    async _createRunTimeInfo (hostName, configString, allowMultipleWindows) {
        return EdgeRunTimeInfo.create(hostName, configString, allowMultipleWindows);
    },
};
