import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import { ProtocolApi } from 'chrome-remote-interface';
import { ProxylessSetupOptions } from '../shared/types';

export interface SpecialServiceRoutes {
    errorPage1: string;
    errorPage2: string;
    openFileProtocolUrl: string;
    idlePage: string;
}

export interface DocumentResourceInfo {
    success: boolean;
    body: Buffer | null;
}

export interface RequestHandler {
    condition: (event: RequestPausedEvent, options?: ProxylessSetupOptions, serviceRoutes?: SpecialServiceRoutes) => boolean;
    handler: (event: RequestPausedEvent, client: ProtocolApi, options?: ProxylessSetupOptions) => Promise<void>;
}
