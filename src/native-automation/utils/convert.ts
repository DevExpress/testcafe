import { NativeAutomationSetupOptions, OpenBrowserAdditionalOptions } from '../../shared/types';

export function toNativeAutomationSetupOptions (options: OpenBrowserAdditionalOptions): NativeAutomationSetupOptions {
    return {
        serviceDomains:  options.serviceDomains,
        developmentMode: options.developmentMode,
    };
}
