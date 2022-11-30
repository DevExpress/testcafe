import { ProtocolApi } from 'chrome-remote-interface';
// @ts-ignore
import { TestRun as LegacyTestRun } from 'testcafe-legacy-api';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import FrameNavigatedEvent = Protocol.Page.FrameNavigatedEvent;
import FulfillRequestRequest = Protocol.Fetch.FulfillRequestRequest;
import HeaderEntry = Protocol.Fetch.HeaderEntry;
import {
    injectResources,
    PageInjectableResources,
    INJECTABLE_SCRIPTS as HAMMERHEAD_INJECTABLE_SCRIPTS,
    getAssetPath,
    PageRestoreStoragesOptions,
} from 'testcafe-hammerhead';
import BrowserConnection from '../browser/connection';
import { SCRIPTS, TESTCAFE_UI_STYLES } from '../assets/injectables';
import EMPTY_PAGE_MARKUP from './empty-page-markup';
import { StatusCodes } from 'http-status-codes';
import { PageLoadError } from '../errors/test-run';
import { redirect, navigateTo } from './utils/cdp';

import {
    DocumentResourceInfo,
    InjectableResourcesOptions,
    SpecialServiceRoutes,
} from './types';

import { resourceInjectorLogger } from '../utils/debug-loggers';
import {
    getResponseAsString,
    stringifyHeaderValues,
    toBase64String,
} from './utils/string';
import { safeFulfillRequest } from './request-pipeline/safe-api';
import TestRun from '../test-run';


export default class ResourceInjector {
    private readonly _browserId: string;
    private readonly _specialServiceRoutes: SpecialServiceRoutes;

    public constructor (browserId: string, specialServiceRoutes: SpecialServiceRoutes) {
        this._browserId            = browserId;
        this._specialServiceRoutes = specialServiceRoutes;
    }

    private get _browserConnection (): BrowserConnection {
        return BrowserConnection.getById(this._browserId) as BrowserConnection;
    }

    private get _currentTestRun (): LegacyTestRun | TestRun | null {
        return this._browserConnection.getCurrentTestRun();
    }

    private async _prepareInjectableResources ({ isIframe, restoringStorages }: InjectableResourcesOptions): Promise<PageInjectableResources | null> {
        const proxy    = this._browserConnection.browserConnectionGateway.proxy;
        const windowId = this._browserConnection.activeWindowId;

        if (!this._currentTestRun)
            return null;

        const taskScript = await this._currentTestRun.session.getTaskScript({
            referer:     '',
            cookieUrl:   '',
            withPayload: true,
            serverInfo:  proxy.server1Info,
            windowId,
            isIframe,
        });

        const injectableResources = {
            storages:    restoringStorages,
            stylesheets: [
                TESTCAFE_UI_STYLES,
            ],
            scripts: [
                ...HAMMERHEAD_INJECTABLE_SCRIPTS.map(hs => getAssetPath(hs, proxy.options.developmentMode)),
                ...SCRIPTS.map(s => getAssetPath(s, proxy.options.developmentMode)),
            ],
            embeddedScripts: [taskScript],
        };

        injectableResources.scripts     = injectableResources.scripts.map(script => proxy.resolveRelativeServiceUrl(script));
        injectableResources.stylesheets = injectableResources.stylesheets.map(style => proxy.resolveRelativeServiceUrl(style));

        return injectableResources;
    }

    private _processResponseHeaders (headers: HeaderEntry[] | undefined): HeaderEntry[] {
        if (!headers)
            return [];

        return stringifyHeaderValues(headers);
    }

    public async redirectToErrorPage (client: ProtocolApi, err: Error, url: string): Promise<void> {
        const browserConnection = BrowserConnection.getById(this._browserId) as BrowserConnection;
        const currentTestRun    = browserConnection.getCurrentTestRun();

        if (!currentTestRun)
            return;

        currentTestRun.pendingPageError = new PageLoadError(err, url);

        await navigateTo(client, this._specialServiceRoutes.errorPage1);
    }

    public async getDocumentResourceInfo (event: RequestPausedEvent, client: ProtocolApi): Promise<DocumentResourceInfo> {
        const {
            requestId,
            request,
            responseErrorReason,
            resourceType,
        } = event;

        if (resourceType !== 'Document') {
            return {
                error: null,
                body:  null,
            };
        }

        try {
            if (responseErrorReason === 'NameNotResolved') {
                const err = new Error(`Failed to find a DNS-record for the resource at "${event.request.url}"`);

                return {
                    error: err,
                    body:  null,
                };
            }

            const responseObj = await client.Fetch.getResponseBody({ requestId });
            const responseStr = getResponseAsString(responseObj);

            return {
                error: null,
                body:  Buffer.from(responseStr),
            };
        }
        catch (err) {
            resourceInjectorLogger('Failed to process request: %s', request.url);

            return {
                error: err,
                body:  null,
            };
        }
    }

    public async processAboutBlankPage (event: FrameNavigatedEvent, client: ProtocolApi): Promise<void> {
        resourceInjectorLogger('Handle page as about:blank. Origin url: %s', event.frame.url);

        const injectableResources = await this._prepareInjectableResources({ isIframe: false }) as PageInjectableResources;
        const html                = injectResources(EMPTY_PAGE_MARKUP, injectableResources);

        await client.Page.setDocumentContent({
            frameId: event.frame.id,
            html,
        });
    }

    public async processHTMLPageContent (fulfillRequestInfo: FulfillRequestRequest, injectableResourcesOptions: InjectableResourcesOptions, client: ProtocolApi): Promise<void> {
        const injectableResources = await this._prepareInjectableResources(injectableResourcesOptions);

        // NOTE: an unhandled exception interrupts the test execution,
        // and we are force to redirect manually to the idle page.
        if (!injectableResources)
            await redirect(client, fulfillRequestInfo.requestId, this._specialServiceRoutes.idlePage);
        else {
            const updatedResponseStr = injectResources(
                fulfillRequestInfo.body as string,
                injectableResources,
                this._getPageInjectableResourcesOptions(injectableResourcesOptions),
            );

            await safeFulfillRequest(client, {
                requestId:       fulfillRequestInfo.requestId,
                responseCode:    fulfillRequestInfo.responseCode || StatusCodes.OK,
                responseHeaders: this._processResponseHeaders(fulfillRequestInfo.responseHeaders),
                body:            toBase64String(updatedResponseStr),
            });
        }
    }

    public async processNonProxiedContent (fulfillRequestInfo: FulfillRequestRequest, client: ProtocolApi): Promise<void> {
        await safeFulfillRequest(client, {
            requestId:       fulfillRequestInfo.requestId,
            responseCode:    fulfillRequestInfo.responseCode || StatusCodes.OK,
            responseHeaders: this._processResponseHeaders(fulfillRequestInfo.responseHeaders),
            body:            toBase64String(fulfillRequestInfo.body as string),
        });
    }

    private _getPageInjectableResourcesOptions (injectableResourcesOptions: InjectableResourcesOptions): PageRestoreStoragesOptions | undefined {
        const { url, restoringStorages } = injectableResourcesOptions;

        if (url && restoringStorages) {
            return {
                host:      new URL(url).host,
                sessionId: this._currentTestRun.session.id,
            };
        }

        return void 0;
    }
}
