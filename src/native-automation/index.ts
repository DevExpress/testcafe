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
    private readonly browserId: string;

    public constructor (browserId: string, client: ProtocolApi, options: NativeAutomationInitOptions) {
        this._client         = client;
        this.options         = options;
        this.browserId       = browserId;
        this.requestPipeline = new NativeAutomationRequestPipeline(browserId, client, options);
        this.sessionStorage  = new SessionStorage(browserId, client, options);

        addCustomDebugFormatters();
    }

    private _onContextStorageSynHandler ({ sessionStorage, testRunId, frameDriverId }: any): void {
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
        this.sessionStorage.on('contextStorageSync', this._onContextStorageSynHandler.bind(this));
        this.sessionStorage.on('contextStorageTestRunDone', this._onContextStorageTestRunDoneHandler.bind(this));
    }

    private _removeEventListeners (): void {
        this.sessionStorage.off('contextStorageSync', this._onContextStorageSynHandler.bind(this));
        this.sessionStorage.off('contextStorageTestRunDone', this._onContextStorageTestRunDoneHandler.bind(this));

    }

    public async start (): Promise<void> {
        nativeAutomationLogger('starting %s', this.browserId);

        for (const apiSystem of this.apiSystems)
            await apiSystem.start();

        this._addEventListeners();

        nativeAutomationLogger('started %s', this.browserId);
    }

    public async stop (): Promise<void> {
        nativeAutomationLogger('stopping %s', this.browserId);

        for (const apiSystem of this.apiSystems)
            await apiSystem.stop();

        this._removeEventListeners();

        nativeAutomationLogger('stopped %s', this.browserId);
    }

    public get apiSystems (): NativeAutomationApiBase [] {
        return [
            this.requestPipeline,
            this.sessionStorage,
        ];
    }
}
