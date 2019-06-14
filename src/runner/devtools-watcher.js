import cri from 'chrome-remote-interface';
import DevToolsInjector from './devtools-injector';


export default class DevToolsWatcher {
    constructor (bc, debugInfo) {
        this.bc = bc;
        this.debugInfo = debugInfo;

        this.bc.on('debug-protocol-connected', cdpClient => this._connectionOpened(cdpClient));
    }

    async _connectionOpened (cdpClient) {
        await cdpClient.Target.setDiscoverTargets({ discover: true });

        cdpClient.Target.targetCreated(async ({ targetInfo }) => {
            if (!targetInfo.url.startsWith('chrome-devtools://'))
                return;

            const devToolsClient = await cri({ target: targetInfo.targetId, port: cdpClient.port });

            await devToolsClient.Console.enable();

            devToolsClient.Console.messageAdded(async ({ message }) => {
                if (!message.text.startsWith('Main._initializeTarget'))
                    return;

                    await devToolsClient.Runtime.enable();
                    await devToolsClient.Runtime.evaluate({expression: `(${DevToolsInjector.toString()}).inject(${JSON.stringify(this.debugInfo.host)}, ${this.debugInfo.port}, '')`});
            });
        });
    }
}
