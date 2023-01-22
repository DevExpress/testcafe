import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';
import RequestPattern = Protocol.Network.RequestPattern;
import ProxylessRequestPipeline from './request-pipeline';
import addCustomDebugFormatters from './add-custom-debug-formatters';
import { ProxylessSetupOptions } from '../shared/types';
import { proxylessLogger } from '../utils/debug-loggers';
import SessionStorage from './session-storage';

const ALL_REQUEST_RESPONSES = { requestStage: 'Request' } as RequestPattern;
const ALL_REQUEST_REQUESTS  = { requestStage: 'Response' } as RequestPattern;

const ALL_REQUESTS_DATA = [ALL_REQUEST_REQUESTS, ALL_REQUEST_RESPONSES];

export default class Proxyless {
    private readonly _client: ProtocolApi;
    public readonly requestPipeline;
    public readonly sessionStorage: SessionStorage;

    public constructor (browserId: string, client: ProtocolApi) {
        this._client         = client;
        this.requestPipeline = new ProxylessRequestPipeline(browserId, client);
        this.sessionStorage = new SessionStorage(browserId, client);

        this.sessionStorage.on('contextStorageSync', ({ sessionStorage, testRunId, frameDriverId }) => {
            if (sessionStorage) {
                this.requestPipeline.contextStorage = this.requestPipeline.contextStorage || {};
                this.requestPipeline.contextStorage[testRunId] = this.requestPipeline.contextStorage[testRunId] || {};
                this.requestPipeline.contextStorage[testRunId][frameDriverId] = sessionStorage;
            }
        });

        this.sessionStorage.on('contextStorageTestRunDone', ({ testRunId }) => {
            if (this.requestPipeline.contextStorage)
                delete this.requestPipeline.contextStorage[testRunId];
        });

        addCustomDebugFormatters();
    }

    public async init (options: ProxylessSetupOptions): Promise<void> {
        // NOTE: We are forced to handle all requests and responses at once
        // because CDP API does not allow specifying request filtering behavior for different handlers.
        await this._client.Fetch.enable({
            patterns: ALL_REQUESTS_DATA,
        });

        const proxylessSystems = [
            this.requestPipeline,
            this.sessionStorage,
        ];

        for (const api of proxylessSystems)
            await api.init(options);

        proxylessLogger('proxyless initialized');
    }

    public async dispose (): Promise<void> {
        this.requestPipeline.stop();

        await this._client.Fetch.disable();

        proxylessLogger('proxyless disposed');
    }
}
