import { ProtocolApi } from 'chrome-remote-interface';
import Protocol from 'devtools-protocol';
import ConsoleMessageFormatter from './formatter';
import { Dictionary } from '../../configuration/interfaces';
import ProxylessApiBase from '../api-base';

import {
    CONSOLE_MESSAGES_ENTRY_KEYS,
    ConsoleMessageEntries,
    ConsoleMessagesEntryKeys,
} from './types';


export default class ConsoleMessagesAPI extends ProxylessApiBase {
    private readonly _consoleMessages: Dictionary<ConsoleMessageEntries>;

    constructor (browserId: string, client: ProtocolApi) {
        super(browserId, client);

        this._consoleMessages = {};
    }

    private _getBrowserConsoleMessages (url: string, type: ConsoleMessagesEntryKeys): string[] {
        if (!this._consoleMessages[this._testRun.id])
            this._consoleMessages[this._testRun.id] = {};

        const testRunMessages = this._consoleMessages[this._testRun.id];

        if (!testRunMessages[url]) {
            testRunMessages[url] = {
                error:   [],
                warning: [],
                log:     [],
                info:    [],
            };
        }

        return testRunMessages[url][type];
    }

    public async init (): Promise<void> {
        this._client.Runtime.on('consoleAPICalled', async ({ type, args }: Protocol.Runtime.ConsoleAPICalledEvent) => {
            if (!CONSOLE_MESSAGES_ENTRY_KEYS.includes(type))
                return;

            console.log('--log called: ' + args[0].value);

            const { host } = await this._getCurrentUrl();
            const messages = this._getBrowserConsoleMessages(host, type as ConsoleMessagesEntryKeys);

            messages.push(ConsoleMessageFormatter.format(args));
        });
    }

    private static _createBrowserConsoleMessages (
        info: string[],
        log: string[],
        error: string[],
        warn: string[]
    ): BrowserConsoleMessages {
        return {
            info,
            log,
            error,
            warn,
        };
    }

    public async getBrowserConsoleMessages (): Promise<BrowserConsoleMessages> {
        const { host }        = await this._getCurrentUrl();
        const testRunMessages = this._consoleMessages[this._testRun.id];

        if (!testRunMessages || !testRunMessages[host])
            return ConsoleMessagesAPI._createBrowserConsoleMessages([], [], [], []);

        const messages = JSON.parse(JSON.stringify(testRunMessages[host]));

        return ConsoleMessagesAPI._createBrowserConsoleMessages(
            messages.info,
            messages.log,
            messages.error,
            messages.warning);
    }
}
