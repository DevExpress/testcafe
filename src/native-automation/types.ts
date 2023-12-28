import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import { ProtocolApi } from 'chrome-remote-interface';
import { NativeAutomationInitOptions } from '../shared/types';
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
    condition: (event: RequestPausedEvent, options?: NativeAutomationInitOptions, serviceRoutes?: SpecialServiceRoutes) => boolean;
    handler: (event: RequestPausedEvent, client: ProtocolApi, isMainWindow: boolean, options?: NativeAutomationInitOptions, sessionId?: SessionId) => Promise<void>;
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
    InsertText,
}

export interface ContinueRequestArgs {
    postData?: string;
    method?: string;
    url?: string;
    headers?: Protocol.Fetch.HeaderEntry[];
}

export type SessionId = string | undefined;
