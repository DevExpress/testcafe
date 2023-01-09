import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';
import RequestPattern = Protocol.Network.RequestPattern;
import ProxylessRequestPipeline from './request-pipeline';
import addCustomDebugFormatters from './add-custom-debug-formatters';
import { ProxylessSetupOptions } from '../shared/types';
import { proxylessLogger } from '../utils/debug-loggers';
import ConsoleMessagesAPI from './console-messages';
import NativeDialogsAPI from './native-dialogs';
import SessionStorage from './session-storage';
import { Dictionary } from '../configuration/interfaces';

const ALL_REQUEST_RESPONSES = { requestStage: 'Request' } as RequestPattern;
const ALL_REQUEST_REQUESTS  = { requestStage: 'Response' } as RequestPattern;

const ALL_REQUESTS_DATA = [ALL_REQUEST_REQUESTS, ALL_REQUEST_RESPONSES];

export default class Proxyless {
    private readonly _client: ProtocolApi;
    public readonly requestPipeline;
    public readonly consoleMessagesApi: ConsoleMessagesAPI;
    public readonly nativeDialogsApi: NativeDialogsAPI;
    public readonly sessionStorage: SessionStorage;

    public constructor (browserId: string, client: ProtocolApi) {
        this._client         = client;
        this.requestPipeline = new ProxylessRequestPipeline(browserId, client);
        this.consoleMessagesApi = new ConsoleMessagesAPI(browserId, client);
        this.nativeDialogsApi = new NativeDialogsAPI(browserId, client);
        this.sessionStorage = new SessionStorage(browserId, client);

        this.sessionStorage.on('contextStorageModified', sessionStorage => {
            const COMMAND_EXECUTING_FLAG = 'testcafe|driver|command-executing-flag';

            if (sessionStorage) {
                const parsed = JSON.parse(sessionStorage);

                if (parsed.hasOwnProperty(COMMAND_EXECUTING_FLAG)) {
                    const storage: Dictionary<boolean> = {};

                    storage[COMMAND_EXECUTING_FLAG] = parsed[COMMAND_EXECUTING_FLAG];

                    this.requestPipeline.contextStorage = JSON.stringify(storage);
                }
            }
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
            this.consoleMessagesApi,
            this.nativeDialogsApi,
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
