import { ProtocolApi } from 'chrome-remote-interface';
import NativeAutomationRequestPipeline from './request-pipeline';
import addCustomDebugFormatters from './add-custom-debug-formatters';
import { NativeAutomationSetupOptions } from '../shared/types';
import { nativeAutomationLogger } from '../utils/debug-loggers';
import SessionStorage from './session-storage';

export default class NativeAutomation {
    private readonly _client: ProtocolApi;
    public readonly requestPipeline;
    public readonly sessionStorage: SessionStorage;

    public constructor (browserId: string, client: ProtocolApi) {
        this._client         = client;
        this.requestPipeline = new NativeAutomationRequestPipeline(browserId, client);
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

    public async init (options: NativeAutomationSetupOptions): Promise<void> {
        const nativeAutomationSystems = [
            this.requestPipeline,
            this.sessionStorage,
        ];

        for (const api of nativeAutomationSystems)
            await api.init(options);

        nativeAutomationLogger('nativeAutomation initialized');
    }

    public async dispose (): Promise<void> {
        this.requestPipeline.stop();

        await this.requestPipeline.dispose();

        nativeAutomationLogger('nativeAutomation disposed');
    }
}
