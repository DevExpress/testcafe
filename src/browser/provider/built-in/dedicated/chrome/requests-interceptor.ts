import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';
import RequestPausedEvent = Protocol.Fetch.RequestPausedEvent;
import RequestPattern = Protocol.Fetch.RequestPattern;
import GetResponseBodyResponse = Protocol.Fetch.GetResponseBodyResponse;
import { injectResources, PageInjectableResources } from 'testcafe-hammerhead';
import BrowserConnection from '../../../../connection';
import { SCRIPTS } from '../../../../../assets/injectables';

const HTTP_STATUS_OK = 200;

export default class RequestsInterceptor {
    private readonly _browserId: string;

    public constructor (browserId: string) {
        this._browserId = browserId;
    }

    private _getResponseAsString (response: GetResponseBodyResponse): string {
        return response.base64Encoded
            ? Buffer.from(response.body, 'base64').toString()
            : response.body;
    }

    private async _prepareInjectableResources (): Promise<PageInjectableResources> {
        const browserConnection = BrowserConnection.getById(this._browserId) as BrowserConnection;
        const proxy             = browserConnection.browserConnectionGateway.proxy;

        const payloadScript = await browserConnection.currentJob.currentTestRun.getPayloadScript();

        const injectableResources = {
            stylesheets: [
                '/testcafe-ui-styles.css',
            ],
            scripts: [
                '/hammerhead.js',
                ...SCRIPTS,
            ],
            embeddedScripts: [payloadScript],
        };

        for (let i = 0; i < injectableResources.scripts.length; i++)
            injectableResources.scripts[i] = proxy.resolveRelativeServiceUrl(injectableResources.scripts[i]);

        for (let j = 0; j < injectableResources.stylesheets.length; j++)
            injectableResources.stylesheets[j] = proxy.resolveRelativeServiceUrl(injectableResources.stylesheets[j]);

        return injectableResources;
    }

    public async setup (client: ProtocolApi): Promise<void> {
        const fetchAllDocumentsPattern = {
            urlPattern:   '*',
            resourceType: 'Document',
            requestStage: 'Response',
        } as RequestPattern;

        await client.Fetch.enable({ patterns: [fetchAllDocumentsPattern] });

        client.Fetch.on('requestPaused', async (params: RequestPausedEvent) => {
            const {
                requestId,
                responseHeaders,
                responseStatusCode,
            } = params;

            const responseObj         = await client.Fetch.getResponseBody({ requestId });
            const responseStr         = this._getResponseAsString(responseObj);
            const injectableResources = await this._prepareInjectableResources();
            const updatedResponseStr  = injectResources(responseStr, injectableResources);

            await client.Fetch.fulfillRequest({
                requestId,
                responseCode:    responseStatusCode || HTTP_STATUS_OK,
                responseHeaders: responseHeaders || [],
                body:            Buffer.from(updatedResponseStr).toString('base64'),
            });
        });
    }
}
