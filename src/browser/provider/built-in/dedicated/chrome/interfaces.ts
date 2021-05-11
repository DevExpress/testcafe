import { BrowserClient } from './cdp-client';

export interface Size {
    width: number;
    height: number;
}

export interface Config {
    cdpPort: number;
    deviceName?: string;
    headless: boolean;
    mobile: boolean;
    emulation: false;
    userAgent?: string;
    touch?: boolean;
    width: number;
    height: number;
    scaleFactor: number;
    userProfile: unknown;
}

export interface ProviderMethods {
    resizeLocalBrowserWindow (browserId: string, newWidth: number, newHeight: number, currentWidth: number, currentHeight: number): Promise<void>;
    reportWarning(...args: any[]): void;
}

export interface RuntimeInfo {
    activeWindowId: string;
    browserId: string;
    cdpPort: number;
    browserClient: BrowserClient;
    config: Config;
    viewportSize: Size;
    emulatedDevicePixelRatio: number;
    originalDevicePixelRatio: number;
    providerMethods: ProviderMethods;
    browserName: string;
}

export interface TouchConfigOptions {
    enabled: boolean;
    configuration: 'desktop' | 'mobile';
    maxTouchPoints: number;
}
