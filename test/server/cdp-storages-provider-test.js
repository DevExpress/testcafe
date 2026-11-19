const { expect }                                 = require('chai');
const { CdpStoragesProvider }                    = require('../../lib/native-automation/storages-provider');
const { addVisitedOrigin, addVisitedStorageKey } = require('../../lib/native-automation/visited-storages');

function createProvider (wildcardError) {
    const calls  = [];
    const client = {
        Storage: {
            clearDataForOrigin: async params => {
                calls.push(['clearDataForOrigin', params.origin]);

                if (wildcardError && params.origin === '*')
                    throw wildcardError;
            },
            clearDataForStorageKey: async params => calls.push(['clearDataForStorageKey', params.storageKey]),
        },
    };

    const connection = {
        id:       'browser',
        provider: { plugin: { openedBrowsers: { browser: { browserClient: { getActiveClient: async () => client } } } } },
    };

    return { calls, connection, provider: new CdpStoragesProvider({ browserConnection: connection }) };
}

describe('CDP storages provider', () => {
    it('clears every origin with the wildcard when Chrome accepts it', async () => {
        const { calls, connection, provider } = createProvider(null);

        addVisitedOrigin(connection, 'https://example.com/page');

        await provider.clearStorages();

        expect(calls).eql([['clearDataForOrigin', '*']]);
    });

    it('clears each visited origin and iframe storage key when Chrome rejects the wildcard', async () => {
        const { calls, connection, provider } = createProvider(new Error('* is not a valid URL'));

        addVisitedOrigin(connection, 'https://example.com/page?a=1');
        addVisitedOrigin(connection, 'https://example.com/other');
        addVisitedOrigin(connection, 'http://localhost:3000/api');
        addVisitedOrigin(connection, 'data:text/html,hi');
        addVisitedOrigin(connection, 'http://[malformed');
        addVisitedStorageKey(connection, 'https://widget.example/^0https://example.com');

        await provider.clearStorages();

        expect(calls).eql([
            ['clearDataForOrigin', '*'],
            ['clearDataForOrigin', 'https://example.com'],
            ['clearDataForOrigin', 'http://localhost:3000'],
            ['clearDataForStorageKey', 'https://widget.example/^0https://example.com'],
        ]);
    });

    it('does not retry the wildcard after Chrome rejected it for the connection', async () => {
        const { calls, connection, provider } = createProvider(new Error('* is not a valid URL'));

        addVisitedOrigin(connection, 'https://example.com/');

        await provider.clearStorages();

        calls.length = 0;

        await provider.clearStorages();

        expect(calls).eql([['clearDataForOrigin', 'https://example.com']]);
    });

    it('rethrows errors other than the wildcard rejection', async () => {
        const { calls, provider } = createProvider(new Error('Target closed'));

        let error = null;

        try {
            await provider.clearStorages();
        }
        catch (err) {
            error = err;
        }

        expect(error.message).eql('Target closed');
        expect(calls).eql([['clearDataForOrigin', '*']]);
    });
});
