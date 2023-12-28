import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import { DEFAULT_FAVICON_PATH } from '../../assets/injectables';
import {
    RequestHandler,
    SessionId,
    SpecialServiceRoutes,
} from '../types';
import { ProtocolApi } from 'chrome-remote-interface';
import {
    requestPipelineInternalRequestLogger,
    requestPipelineLogger,
    requestPipelineServiceRequestLogger,
} from '../../utils/debug-loggers';
import { NativeAutomationInitOptions } from '../../shared/types';
import { isRequest } from '../utils/cdp';
import { FAVICON_CONTENT_TYPE_HEADER } from './constants';
import { StatusCodes } from 'http-status-codes';
import loadAssets from '../../load-assets';
import { toBase64String } from '../utils/string';
import {
    safeContinueRequest,
    safeContinueResponse,
    safeFulfillRequest,
} from './safe-api';

async function handleRequestPauseEvent (event: RequestPausedEvent, client: ProtocolApi, sessionId: SessionId): Promise<void> {
    if (isRequest(event))
        await safeContinueRequest(client, event, sessionId);
    else
        await safeContinueResponse(client, event, sessionId);
}


const internalRequest = {
    condition: (event: RequestPausedEvent): boolean => !event.networkId && event.resourceType !== 'Document' && !event.request.url,
    handler:   async (event: RequestPausedEvent, client: ProtocolApi, isMainWindow: boolean, options: NativeAutomationInitOptions, sessionId: SessionId): Promise<void> => {
        requestPipelineInternalRequestLogger('%r', event);

        await handleRequestPauseEvent(event, client, sessionId);
    },
} as RequestHandler;

const serviceRequest = {
    condition: (event: RequestPausedEvent, options: NativeAutomationInitOptions, serviceRoutes: SpecialServiceRoutes): boolean => {
        const url = event.request.url;

        // NOTE: the service 'Error page' should be proxied.
        if (url === serviceRoutes.errorPage1
            || url === serviceRoutes.errorPage2)
            return false;

        return options.serviceDomains.some(domain => url.startsWith(domain));
    },
    handler: async (event: RequestPausedEvent, client: ProtocolApi, isMainWindow: boolean, options: NativeAutomationInitOptions, sessionId: SessionId): Promise<void> => {
        requestPipelineServiceRequestLogger('%r', event);

        try {
            await handleRequestPauseEvent(event, client, sessionId);
        }
        catch (err) {
            if (isMainWindow) {
                requestPipelineServiceRequestLogger('Failed to process request in main window: %s', event.request.url);

                throw err;
            }
            else {
                // NOTE: Sometimes, a child window sends a heartbeat request and then immediately closes.
                // In these situations, we need to catch errors because we can't handle this request correctly
                // when the cdpClient has already closed.
                requestPipelineServiceRequestLogger('Failed to process request in child window: %s', event.request.url);
            }
        }
    },
} as RequestHandler;

const defaultFaviconRequest = {
    condition: (event: RequestPausedEvent): boolean => {
        const parsedUrl = new URL(event.request.url);

        return parsedUrl.pathname === DEFAULT_FAVICON_PATH;
    },
    handler: async (event: RequestPausedEvent, client: ProtocolApi, isMainWindow: boolean, options: NativeAutomationInitOptions, sessionId: SessionId): Promise<void> => {
        requestPipelineLogger('%r', event);

        if (isRequest(event))
            await safeContinueRequest(client, event, sessionId);
        else {
            if (event.responseStatusCode === StatusCodes.NOT_FOUND) { // eslint-disable-line no-lonely-if
                const { favIcon } = loadAssets(options.developmentMode);

                await safeFulfillRequest(client, {
                    requestId:       event.requestId,
                    responseCode:    StatusCodes.OK,
                    responseHeaders: [ FAVICON_CONTENT_TYPE_HEADER ],
                    body:            toBase64String(favIcon),
                }, sessionId);
            }
            else
                await safeContinueResponse(client, event, sessionId);
        }
    },
} as RequestHandler;

const SPECIAL_REQUEST_HANDLERS = [
    internalRequest,
    serviceRequest,
    defaultFaviconRequest,
];

export default function getSpecialRequestHandler (event: RequestPausedEvent, options?: NativeAutomationInitOptions, serviceRoutes?: SpecialServiceRoutes): RequestHandler['handler'] | null {
    const specialRequestHandler = SPECIAL_REQUEST_HANDLERS.find(h => h.condition(event, options, serviceRoutes));

    return specialRequestHandler ? specialRequestHandler.handler : null;
}

