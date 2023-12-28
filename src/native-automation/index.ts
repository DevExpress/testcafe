import { ProtocolApi } from 'chrome-remote-interface';
import NativeAutomationRequestPipeline from './request-pipeline';
import addCustomDebugFormatters from './add-custom-debug-formatters';
import { NativeAutomationInitOptions } from '../shared/types';
import { nativeAutomationLogger } from '../utils/debug-loggers';
import SessionStorage from './session-storage';
import NativeAutomationApiBase from './api-base';
import AsyncEventEmitter from '../utils/async-event-emitter';
import { NEW_WINDOW_OPENED_IN_NATIVE_AUTOMATION } from '../browser/provider/built-in/dedicated/chrome/cdp-client';

export class NativeAutomationBase extends AsyncEventEmitter {
    protected readonly _client: ProtocolApi;
    public readonly requestPipeline;
    public readonly sessionStorage: SessionStorage;
    private readonly options: NativeAutomationInitOptions;
    protected readonly windowId: string;

    public constructor (browserId: string, windowId: string, client: ProtocolApi, options: NativeAutomationInitOptions, isMainWindow: boolean) {
        super();

        this.windowId        = windowId;
        this._client         = client;
        this.options         = options;
        this.requestPipeline = new NativeAutomationRequestPipeline(browserId, windowId, client, isMainWindow, options);
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
        nativeAutomationLogger('starting');

        for (const apiSystem of this.apiSystems)
            await apiSystem.start();

        this._addEventListeners();

        nativeAutomationLogger('started');
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

export class NativeAutomationMainWindow extends NativeAutomationBase {
    private _resolveNewWindowOpeningPromise: Promise<any> | undefined;

    public constructor (browserId: string, windowId: string, client: ProtocolApi, options: NativeAutomationInitOptions) {
        super(browserId, windowId, client, options, true);
    }

    async start (): Promise<void> {
        await super.start();

        await this._client.Target.setDiscoverTargets({ discover: true });

        this._client.Target.on('targetCreated', async ({ targetInfo }) => {
            if (targetInfo.type !== 'page' || targetInfo.targetId === this.windowId)
                return;

            this._resolveNewWindowOpeningPromise = this.emit(NEW_WINDOW_OPENED_IN_NATIVE_AUTOMATION, targetInfo);
        });
    }

    public async getNewWindowIdInNativeAutomation (): Promise<string> {
        if (!this._resolveNewWindowOpeningPromise)
            throw new Error('Cannot get new window id');

        return this._resolveNewWindowOpeningPromise
            .then(res => {
                const windowId = res[0];

                return windowId;
            });
    }
}

export class NativeAutomationChildWindow extends NativeAutomationBase {
    public constructor (browserId: string, windowId: string, client: ProtocolApi, options: NativeAutomationInitOptions) {
        super(browserId, windowId, client, options, false);
    }
}

