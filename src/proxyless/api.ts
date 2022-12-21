import { ProtocolApi } from 'chrome-remote-interface';
import ConsoleMessagesAPI from './console-messages';

export default class ProxylessAPI {
    private readonly _consoleMessagesApi: ConsoleMessagesAPI;

    constructor (browserId: string, client: ProtocolApi) {
        this._consoleMessagesApi = new ConsoleMessagesAPI(browserId, client);
    }

    public async init (): Promise<void> {
        await this._consoleMessagesApi.init();
    }

    public async getBrowserConsoleMessages (): Promise<BrowserConsoleMessages> {
        return this._consoleMessagesApi.getBrowserConsoleMessages();
    }
}
