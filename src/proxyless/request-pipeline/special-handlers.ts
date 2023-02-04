import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import { DEFAULT_FAVICON_PATH } from '../../assets/injectables';
import { RequestHandler, SpecialServiceRoutes } from '../types';
import { ProtocolApi } from 'chrome-remote-interface';
import {
    requestPipelineInternalRequestLogger,
    requestPipelineLogger,
    requestPipelineServiceRequestLogger,
} from '../../utils/debug-loggers';
import { ProxylessSetupOptions } from '../../shared/types';
import { isRequest } from '../utils/cdp';
import { FAVICON_CONTENT_TYPE_HEADER } from './constants';
import { StatusCodes } from 'http-status-codes';
import loadAssets from '../../load-assets';
import { toBase64String } from '../utils/string';
import {
    safeContinueRequest,
    safeContinueResponse,
    safeFailRequest,
    safeFulfillRequest,
} from './safe-api';


const internalRequest = {
    condition: (event: RequestPausedEvent): boolean => !event.networkId && event.resourceType !== 'Document',
    handler:   async (event: RequestPausedEvent, client: ProtocolApi): Promise<void> => {
        requestPipelineInternalRequestLogger('%r', event);

        await safeFailRequest(client, event);
    },
} as RequestHandler;

const serviceRequest = {
    condition: (event: RequestPausedEvent, options: ProxylessSetupOptions, serviceRoutes: SpecialServiceRoutes): boolean => {
        const url = event.request.url;

        // NOTE: the service 'Error page' should be proxied.
        if (url === serviceRoutes.errorPage1
            || url === serviceRoutes.errorPage2)
            return false;

        return options.serviceDomains.some(domain => url.startsWith(domain));
    },
    handler: async (event: RequestPausedEvent, client: ProtocolApi): Promise<void> => {
        requestPipelineServiceRequestLogger('%r', event);

        if (isRequest(event))
            await safeContinueRequest(client, event);
        else
            await safeContinueResponse(client, event);
    },
} as RequestHandler;

const defaultFaviconRequest = {
    condition: (event: RequestPausedEvent): boolean => {
        const parsedUrl = new URL(event.request.url);

        return parsedUrl.pathname === DEFAULT_FAVICON_PATH;
    },
    handler: async (event: RequestPausedEvent, client: ProtocolApi, options: ProxylessSetupOptions): Promise<void> => {
        requestPipelineLogger('%r', event);

        if (isRequest(event))
            await safeContinueRequest(client, event);
        else {
            if (event.responseStatusCode === StatusCodes.NOT_FOUND) { // eslint-disable-line no-lonely-if
                const { favIcon } = loadAssets(options.developmentMode);

                await safeFulfillRequest(client, {
                    requestId:       event.requestId,
                    responseCode:    StatusCodes.OK,
                    responseHeaders: [ FAVICON_CONTENT_TYPE_HEADER ],
                    body:            toBase64String(favIcon),
                });
            }
            else
                await safeContinueResponse(client, event);
        }
    },
} as RequestHandler;

const SPECIAL_REQUEST_HANDLERS = [
    internalRequest,
    serviceRequest,
    defaultFaviconRequest,
];

export default function getSpecialRequestHandler (event: RequestPausedEvent, options?: ProxylessSetupOptions, serviceRoutes?: SpecialServiceRoutes): any {
    const specialRequestHandler = SPECIAL_REQUEST_HANDLERS.find(h => h.condition(event, options, serviceRoutes));

    return specialRequestHandler ? specialRequestHandler.handler : null;
}

