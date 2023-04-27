import { NativeAutomationInitOptions, OpenBrowserAdditionalOptions } from '../../shared/types';

export function toNativeAutomationSetupOptions (options: OpenBrowserAdditionalOptions): NativeAutomationInitOptions {
    return {
        serviceDomains:  options.serviceDomains,
        developmentMode: options.developmentMode,
    };
}
