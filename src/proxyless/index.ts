import { ProtocolApi } from 'chrome-remote-interface';
import ProxylessRequestPipeline from './request-pipeline';
import addCustomDebugFormatters from './add-custom-debug-formatters';
import { ProxylessSetupOptions } from '../shared/types';
import { proxylessLogger } from '../utils/debug-loggers';
import SessionStorage from './session-storage';

export default class Proxyless {
    private readonly _client: ProtocolApi;
    public readonly requestPipeline;
    public readonly sessionStorage: SessionStorage;

    public constructor (browserId: string, client: ProtocolApi) {
        this._client         = client;
        this.requestPipeline = new ProxylessRequestPipeline(browserId, client);
        this.sessionStorage  = new SessionStorage(browserId, client);

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

        await this.requestPipeline.dispose();

        proxylessLogger('proxyless disposed');
    }
}
