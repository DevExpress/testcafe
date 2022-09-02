import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import RequestPattern = Protocol.Fetch.RequestPattern;
import GetResponseBodyResponse = Protocol.Fetch.GetResponseBodyResponse;
import FrameNavigatedEvent = Protocol.Page.FrameNavigatedEvent;
import HeaderEntry = Protocol.Fetch.HeaderEntry;
import {
    injectResources,
    PageInjectableResources,
    INJECTABLE_SCRIPTS as HAMMERHEAD_INJECTABLE_SCRIPTS,
    SPECIAL_BLANK_PAGE,
    getAssetPath,
} from 'testcafe-hammerhead';
import BrowserConnection from '../browser/connection';
import { SCRIPTS, TESTCAFE_UI_STYLES } from '../assets/injectables';
import ABOUT_BLANK_PAGE_MARKUP from './about-blank-page-markup';
import { remove } from 'lodash';
import debug from 'debug';
import { StatusCodes } from 'http-status-codes';

const ALL_DOCUMENT_RESPONSES = {
    urlPattern:   '*',
    resourceType: 'Document',
    requestStage: 'Response',
} as RequestPattern;

const CONTENT_SECURITY_POLICY_HEADER_NAMES = [
    'content-security-policy',
    'content-security-policy-report-only',
];

const debugLogger = debug('testcafe:proxyless:resource-injector');

export default class ResourceInjector {
    private readonly _browserId: string;
    private readonly _idlePageUrl: string;

    public constructor (browserId: string) {
        this._browserId   = browserId;
        this._idlePageUrl = this._getIdlePageUrl(browserId);
    }

    private _getIdlePageUrl (browserId: string): string {
        return BrowserConnection.getById(browserId)
            ?.idleUrl || '';
    }

    private _getResponseAsString (response: GetResponseBodyResponse): string {
        return response.base64Encoded
            ? Buffer.from(response.body, 'base64').toString()
            : response.body;
    }

    private _isServicePage (url: string): boolean {
        const browserConnection = BrowserConnection.getById(this._browserId) as BrowserConnection;
        const proxy             = browserConnection.browserConnectionGateway.proxy;

        return url.startsWith(proxy.server1Info.domain);
    }

    private async _prepareInjectableResources (): Promise<PageInjectableResources | null> {
        const browserConnection = BrowserConnection.getById(this._browserId) as BrowserConnection;
        const proxy             = browserConnection.browserConnectionGateway.proxy;
        const windowId          = browserConnection.activeWindowId;
        const currentTestRun    = browserConnection?.currentJob?.currentTestRun;

        if (!currentTestRun)
            return null;

        const taskScript = await currentTestRun.session.getTaskScript({
            referer:     '',
            cookieUrl:   '',
            isIframe:    false,
            withPayload: true,
            serverInfo:  proxy.server1Info,
            windowId,
        });

        const injectableResources = {
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

        remove(headers, header => CONTENT_SECURITY_POLICY_HEADER_NAMES.includes(header.name));

        return headers;
    }

    private _tryToHandlePageError (err: Error, url: string): void {
        const browserConnection = BrowserConnection.getById(this._browserId) as BrowserConnection;
        const currentTestRun    = browserConnection?.currentJob?.currentTestRun;

        if (!currentTestRun)
            return;

        const ctxMock = {
            reqOpts: { url },
        };

        currentTestRun.session.handlePageError(ctxMock, err);
    }

    private async _handleHTTPPages (client: ProtocolApi): Promise<void> {
        await client.Fetch.enable({ patterns: [ALL_DOCUMENT_RESPONSES] });

        client.Fetch.on('requestPaused', async (params: RequestPausedEvent) => {
            const {
                requestId,
                responseHeaders,
                responseStatusCode,
            } = params;

            if (this._isServicePage(params.request.url))
                await client.Fetch.continueRequest({ requestId });
            else {
                try {
                    const responseObj         = await client.Fetch.getResponseBody({ requestId });
                    const responseStr         = this._getResponseAsString(responseObj);
                    const injectableResources = await this._prepareInjectableResources();

                    // NOTE: an unhandled exception interrupts the test execution,
                    // and we are force to redirect manually to the idle page.
                    if (!injectableResources) {
                        await client.Fetch.fulfillRequest({
                            requestId,
                            responseCode:    StatusCodes.MOVED_PERMANENTLY,
                            responseHeaders: [
                                { name: 'location', value: this._idlePageUrl },
                            ],
                        });
                    }
                    else {
                        const updatedResponseStr  = injectResources(responseStr, injectableResources);

                        await client.Fetch.fulfillRequest({
                            requestId,
                            responseCode:    responseStatusCode || StatusCodes.OK,
                            responseHeaders: this._processResponseHeaders(responseHeaders),
                            body:            Buffer.from(updatedResponseStr).toString('base64'),
                        });
                    }
                }
                catch (err) {
                    this._tryToHandlePageError(err as Error, params.request.url);

                    debugLogger('Failed to process request: %s', params.request.url);
                }
            }
        });
    }

    private _topFrameNavigationToAboutBlank (event: FrameNavigatedEvent): boolean {
        if (event.frame.url !== SPECIAL_BLANK_PAGE)
            return false;

        if (event.type !== 'Navigation')
            return false;

        if (event.frame.parentId)
            return false;

        return true;
    }

    private async _handleAboutBlankPage (client: ProtocolApi): Promise<void> {
        await client.Page.enable();

        client.Page.on('frameNavigated', async (params: FrameNavigatedEvent) => {
            if (!this._topFrameNavigationToAboutBlank(params))
                return;

            const injectableResources = await this._prepareInjectableResources() as PageInjectableResources;
            const html                = injectResources(ABOUT_BLANK_PAGE_MARKUP, injectableResources);

            await client.Page.setDocumentContent({
                frameId: params.frame.id,
                html,
            });
        });
    }

    public async setup (client: ProtocolApi): Promise<void> {
        await this._handleHTTPPages(client);
        await this._handleAboutBlankPage(client);
    }
}
