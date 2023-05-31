import { ProtocolApi } from 'chrome-remote-interface';
import NativeAutomationRequestPipeline from './request-pipeline';
import addCustomDebugFormatters from './add-custom-debug-formatters';
import { NativeAutomationInitOptions } from '../shared/types';
import { nativeAutomationLogger } from '../utils/debug-loggers';
import SessionStorage from './session-storage';
import NativeAutomationApiBase from './api-base';

export default class NativeAutomation {
    private readonly _client: ProtocolApi;
    public readonly requestPipeline;
    public readonly sessionStorage: SessionStorage;
    private readonly options: NativeAutomationInitOptions;

    public constructor (browserId: string, client: ProtocolApi, options: NativeAutomationInitOptions) {
        this._client         = client;
        this.options         = options;
        this.requestPipeline = new NativeAutomationRequestPipeline(browserId, client, options);
        this.sessionStorage  = new SessionStorage(browserId, client, options);

        addCustomDebugFormatters();
    }

    private _onContextStorageSyncHandler ({ sessionStorage, testRunId, frameDriverId }: any): void {
        if (sessionStorage) {
            this.requestPipeline.contextStorage                           = this.requestPipeline.contextStorage || {};
            this.requestPipeline.contextStorage[testRunId]                = this.requestPipeline.contextStorage[testRunId] || {};
            this.requestPipeline.contextStorage[testRunId][frameDriverId] = sessionStorage;
        }
    }

    private _onContextStorageTestRunDoneHandler ({ testRunId }: any): void {
        if (this.requestPipeline.contextStorage)
            delete this.requestPipeline.contextStorage[testRunId];
    }

    private _addEventListeners (): void {
        this.sessionStorage.on('contextStorageSync', this._onContextStorageSyncHandler.bind(this));
        this.sessionStorage.on('contextStorageTestRunDone', this._onContextStorageTestRunDoneHandler.bind(this));
    }

    public async start (): Promise<void> {
        for (const apiSystem of this.apiSystems)
            await apiSystem.start();

        this._addEventListeners();

        nativeAutomationLogger('nativeAutomation initialized');
    }

    public async dispose (): Promise<void> {
        this.requestPipeline.stop();

        await this.requestPipeline.dispose();

        nativeAutomationLogger('nativeAutomation disposed');
    }

    public get apiSystems (): NativeAutomationApiBase [] {
        return [
            this.requestPipeline,
            this.sessionStorage,
        ];
    }
}
