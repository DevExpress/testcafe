import { ProtocolApi } from 'chrome-remote-interface';
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
    StoragesSnapshot,
    Proxy,
} from 'testcafe-hammerhead';
import { SCRIPTS, TESTCAFE_UI_STYLES } from '../assets/injectables';
import EMPTY_PAGE_MARKUP from './empty-page-markup';
import { StatusCodes } from 'http-status-codes';
import { PageLoadError } from '../errors/test-run';
import { redirect, navigateTo } from './utils/cdp';

import {
    DocumentResourceInfo,
    InjectableResourcesOptions,
    SessionStorageInfo,
    SpecialServiceRoutes,
} from './types';

import { resourceInjectorLogger } from '../utils/debug-loggers';
import {
    getResponseAsString,
    stringifyHeaderValues,
    toBase64String,
} from './utils/string';
import { safeFulfillRequest } from './request-pipeline/safe-api';
import TestRunBridge from './request-pipeline/test-run-bridge';

const RESPONSE_REMOVED_HEADERS = [
    'cross-origin-embedder-policy',
    'cross-origin-opener-policy',
    'cross-origin-resource-policy',
];

export default class ResourceInjector {
    private readonly _specialServiceRoutes: SpecialServiceRoutes;
    private readonly _testRunBridge: TestRunBridge;

    public constructor (testRunBridge: TestRunBridge, specialServiceRoutes: SpecialServiceRoutes) {
        this._specialServiceRoutes = specialServiceRoutes;
        this._testRunBridge        = testRunBridge;
    }

    private _getRestoreContextStorageScript (contextStorage?: SessionStorageInfo | null): string {
        const currentTestRun = this._testRunBridge.getCurrentTestRun();
        const value = JSON.stringify(contextStorage?.[currentTestRun.id] || '');

        return `Object.defineProperty(window, '%proxylessContextStorage%', { configurable: true, value: ${value} });`;
    }

    private _getRestoreStoragesScript (restoringStorages: StoragesSnapshot | null | undefined): string {
        if (!restoringStorages)
            return '(function() {})()';

        return `(function() {
            window.localStorage.clear();
            window.sessionStorage.clear();

            const snapshot = ${JSON.stringify(restoringStorages)};
            const ls       = JSON.parse(snapshot.localStorage);
            const ss       = JSON.parse(snapshot.sessionStorage);

            for (let i = 0; i < ls[0].length; i++)
                window.localStorage.setItem(ls[0][i], ls[1][i]);

            for (let i = 0; i < ss[0].length; i++)
                window.sessionStorage.setItem(ss[0][i], ss[1][i]);
        })();
        `;
    }

    private _resolveRelativeUrls (proxy: Proxy, relativeUrls: string[]): string[] {
        return relativeUrls.map(url => proxy.resolveRelativeServiceUrl(url));
    }

    private async _prepareInjectableResources ({ isIframe, restoringStorages, contextStorage, userScripts }: InjectableResourcesOptions): Promise<PageInjectableResources | null> {
        if (!this._testRunBridge.getCurrentTestRun())
            return null;

        const taskScript = await this._testRunBridge.getTaskScript({ isIframe, restoringStorages, contextStorage, userScripts });
        const proxy      = this._testRunBridge.getBrowserConnection().browserConnectionGateway.proxy;

        const injectableResources = {
            stylesheets: [
                TESTCAFE_UI_STYLES,
            ],
            scripts: [
                ...HAMMERHEAD_INJECTABLE_SCRIPTS.map(hs => getAssetPath(hs, proxy.options.developmentMode)),
                ...SCRIPTS.map(s => getAssetPath(s, proxy.options.developmentMode)),
            ],
            embeddedScripts: [ this._getRestoreStoragesScript(restoringStorages), this._getRestoreContextStorageScript(contextStorage), taskScript],
            userScripts:     userScripts || [],
        };

        injectableResources.scripts     = this._resolveRelativeUrls(proxy, injectableResources.scripts);
        injectableResources.userScripts = this._resolveRelativeUrls(proxy, injectableResources.userScripts);
        injectableResources.stylesheets = this._resolveRelativeUrls(proxy, injectableResources.stylesheets);

        return injectableResources;
    }

    private _processResponseHeaders (headers: HeaderEntry[] | undefined): HeaderEntry[] {
        if (!headers)
            return [];

        headers = headers.filter(header => !RESPONSE_REMOVED_HEADERS.includes(header.name.toLowerCase()));

        return stringifyHeaderValues(headers);
    }

    private async _fulfillRequest (client: ProtocolApi, fulfillRequestInfo: FulfillRequestRequest, body: string): Promise<void> {
        await safeFulfillRequest(client, {
            requestId:       fulfillRequestInfo.requestId,
            responseCode:    fulfillRequestInfo.responseCode || StatusCodes.OK,
            responsePhrase:  fulfillRequestInfo.responsePhrase,
            responseHeaders: this._processResponseHeaders(fulfillRequestInfo.responseHeaders),
            body:            toBase64String(body),
        });
    }

    public async redirectToErrorPage (client: ProtocolApi, err: Error, url: string): Promise<void> {
        const currentTestRun = this._testRunBridge.getCurrentTestRun();

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

    public async processAboutBlankPage (event: FrameNavigatedEvent, userScripts: string[], contextStorage: SessionStorageInfo | null, client: ProtocolApi): Promise<void> {
        resourceInjectorLogger('Handle page as about:blank. Origin url: %s', event.frame.url);

        const injectableResources = await this._prepareInjectableResources({ isIframe: false, userScripts, contextStorage }) as PageInjectableResources;
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

            await this._fulfillRequest(client, fulfillRequestInfo, updatedResponseStr);
        }
    }

    public async processNonProxiedContent (fulfillRequestInfo: FulfillRequestRequest, client: ProtocolApi): Promise<void> {
        await this._fulfillRequest(client, fulfillRequestInfo, fulfillRequestInfo.body as string);
    }

    private _getPageInjectableResourcesOptions (injectableResourcesOptions: InjectableResourcesOptions): PageRestoreStoragesOptions | undefined {
        const { url, restoringStorages } = injectableResourcesOptions;

        if (url && restoringStorages) {
            return {
                host:      new URL(url).host,
                sessionId: this._testRunBridge.getSessionId(),
            };
        }

        return void 0;
    }
}
