import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import { ProtocolApi } from 'chrome-remote-interface';
import { ProxylessSetupOptions } from '../shared/types';
import { StoragesSnapshot } from 'testcafe-hammerhead';
import { Dictionary } from '../configuration/interfaces';

export interface SpecialServiceRoutes {
    errorPage1: string;
    errorPage2: string;
    openFileProtocolUrl: string;
    idlePage: string;
}

export interface DocumentResourceInfo {
    error: any;
    body: Buffer | null;
}

export interface RequestHandler {
    condition: (event: RequestPausedEvent, options?: ProxylessSetupOptions, serviceRoutes?: SpecialServiceRoutes) => boolean;
    handler: (event: RequestPausedEvent, client: ProtocolApi, options?: ProxylessSetupOptions) => Promise<void>;
}

export interface InjectableResourcesOptions {
    isIframe: boolean;
    url?: string;
    restoringStorages?: StoragesSnapshot | null;
    contextStorage?: SessionStorageInfo;
    userScripts?: string[];
}

export type SessionStorageInfo = Dictionary<Dictionary<string>> | null;

export enum EventType {
    Mouse,
    Keyboard,
    Touch,
    Delay,
}
