const { expect }  = require('chai');
const proxyquire  = require('proxyquire');

describe('BrowserClient isolated contexts', () => {
    let connections = null;
    let disposed    = null;
    let tab         = null;

    function createFakeClient () {
        const listeners = {};

        return {
            listeners,

            on (event, cb) {
                listeners[event] = cb;
            },

            close: async () => {},

            Target: {
                createBrowserContext:  async () => ({ browserContextId: 'ctx-1' }),
                createTarget:          async () => ({ targetId: 'target-1' }),
                disposeBrowserContext: async ({ browserContextId }) => {
                    disposed.push(browserContextId);
                },
            },
        };
    }

    function createBrowserClient () {
        const remoteChrome = async () => {
            const client = createFakeClient();

            connections.push(client);

            return client;
        };

        remoteChrome.Version = async () => ({ webSocketDebuggerUrl: 'ws://localhost/devtools/browser' });

        remoteChrome['@noCallThru'] = true;

        const { BrowserClient } = proxyquire('../../lib/browser/provider/built-in/dedicated/chrome/cdp-client', {
            'chrome-remote-interface': remoteChrome,
            './utils':                 { getTabById: async () => tab, '@noCallThru': false },
        });

        return new BrowserClient({ browserId: 'browser-1', cdpPort: 9222 });
    }

    beforeEach(() => {
        connections = [];
        disposed    = [];
        tab         = null;
    });

    it('Should dispose the browser context when the isolated tab cannot be attached', async () => {
        const browserClient = createBrowserClient();

        let error = null;

        try {
            await browserClient.createIsolatedContext();
        }
        catch (err) {
            error = err;
        }

        expect(error.message).contains('target-1');
        expect(disposed).eql(['ctx-1']);
    });

    it('Should open one browser-level connection for concurrent callers', async () => {
        const browserClient = createBrowserClient();

        const [first, second] = await Promise.all([
            browserClient.getBrowserLevelClient(),
            browserClient.getBrowserLevelClient(),
        ]);

        expect(connections.length).eql(1);
        expect(first).equal(second);
    });

    it('Should reconnect after the browser-level connection is lost', async () => {
        const browserClient = createBrowserClient();

        const first = await browserClient.getBrowserLevelClient();

        first.listeners.disconnect();

        const second = await browserClient.getBrowserLevelClient();

        expect(connections.length).eql(2);
        expect(second).not.equal(first);
    });

    it('Should not open a browser-level connection after the tab is closed', async () => {
        const browserClient = createBrowserClient();

        await browserClient.getBrowserLevelClient();
        await browserClient.closeTab();
        await browserClient.disposeIsolatedContext('ctx-1');

        expect(connections.length).eql(1);
        expect(disposed).eql([]);
    });
});
