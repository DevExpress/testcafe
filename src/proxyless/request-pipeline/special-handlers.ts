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
import { FAVICON_CONTENT_TYPE_HEADER, INVALID_INTERCEPTED_RESPONSE_ERROR_MSG } from './constants';
import { StatusCodes } from 'http-status-codes';
import loadAssets from '../../load-assets';
import { toBase64String } from '../utils/string';


const internalRequest = {
    condition: (event: RequestPausedEvent): boolean => !event.networkId,
    handler:   async (event: RequestPausedEvent, client: ProtocolApi): Promise<void> => {
        requestPipelineInternalRequestLogger('%r', event);

        await client.Fetch.failRequest({
            requestId:   event.requestId,
            errorReason: 'Aborted',
        });
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

        const { requestId } = event;

        if (isRequest(event))
            await client.Fetch.continueRequest({ requestId });
        else {
            // Hack: CDP doesn't allow to continue response for requests sent from the reloaded page.
            // Such situation rarely occurs on 'heartbeat' or 'open-file-protocol' requests.
            // We are using the simplest way to fix it - just omit such errors.
            try {
                await client.Fetch.continueResponse({ requestId });
            }
            catch (err: any) {
                if (err.message === INVALID_INTERCEPTED_RESPONSE_ERROR_MSG)
                    return;

                throw err;
            }

        }
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
            await client.Fetch.continueRequest({ requestId: event.requestId });
        else {
            if (event.responseStatusCode === StatusCodes.NOT_FOUND) { // eslint-disable-line no-lonely-if
                const { favIcon } = loadAssets(options.developmentMode);

                await client.Fetch.fulfillRequest({
                    requestId:       event.requestId,
                    responseCode:    StatusCodes.OK,
                    responseHeaders: [ FAVICON_CONTENT_TYPE_HEADER ],
                    body:            toBase64String(favIcon),
                });
            }
            else
                await client.Fetch.continueResponse({ requestId: event.requestId });
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

