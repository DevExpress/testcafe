import { NativeAutomationInitOptions, OpenBrowserAdditionalOptions } from '../../shared/types';

export function toNativeAutomationSetupOptions (options: OpenBrowserAdditionalOptions, isHeadless: boolean): NativeAutomationInitOptions {
    return {
        serviceDomains:  options.serviceDomains,
        developmentMode: options.developmentMode,
        isHeadless,
    };
}
