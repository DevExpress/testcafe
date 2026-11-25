const proxyquire = require('proxyquire');
const { expect } = require('chai');
const sinon      = require('sinon');

const { VisitedOrigins } = require('../../lib/native-automation/visited-origins');

describe('Native automation storages provider', () => {
    function createProvider ({ pageUrl, clearDataForOrigin = sinon.stub().resolves() }) {
        const visitedOrigins  = new VisitedOrigins();
        const getActiveClient = sinon.stub().resolves({ Storage: { clearDataForOrigin } });

        const { CdpStoragesProvider } = proxyquire('../../lib/native-automation/storages-provider', {
            './utils/get-active-client': { getActiveClient },
        });

        const testRun = {
            browserConnection: { visitedOrigins },
            test:              { pageUrl },
        };

        return {
            visitedOrigins,
            clearDataForOrigin,
            provider: new CdpStoragesProvider(testRun),
        };
    }

    function getClearedOrigins (clearDataForOrigin) {
        return clearDataForOrigin.getCalls().map(call => call.args[0].origin);
    }

    it('Should clear storages for origins visited by previous tests and for the test page origin', async () => {
        const { provider, visitedOrigins, clearDataForOrigin } = createProvider({ pageUrl: 'https://example.com/path' });

        visitedOrigins.track('https://auth.example.com/login?redirect=1');
        visitedOrigins.track('https://example.com/other');
        visitedOrigins.track('file:///C:/tests/page.html');

        await provider.clearStorages();

        expect(getClearedOrigins(clearDataForOrigin)).deep.equal([
            'https://auth.example.com',
            'https://example.com',
            'file://',
        ]);

        sinon.assert.alwaysCalledWithMatch(clearDataForOrigin, { storageTypes: 'all' });
    });

    it('Should not clear the same visited origins twice', async () => {
        const { provider, visitedOrigins, clearDataForOrigin } = createProvider({ pageUrl: 'about:blank' });

        visitedOrigins.track('https://example.com/');

        await provider.clearStorages();
        await provider.clearStorages();

        expect(getClearedOrigins(clearDataForOrigin)).deep.equal(['https://example.com']);
    });

    it('Should skip opaque and invalid URLs', async () => {
        const { provider, visitedOrigins, clearDataForOrigin } = createProvider({ pageUrl: 'about:blank' });

        visitedOrigins.track('data:text/html,<p>test</p>');
        visitedOrigins.track('');

        await provider.clearStorages();

        sinon.assert.notCalled(clearDataForOrigin);
    });

    it('Should not fail if clearing storages for an origin fails and should retry it next time', async () => {
        const clearDataForOrigin = sinon.stub().resolves();

        clearDataForOrigin.withArgs(sinon.match({ origin: 'https://broken.com' })).onFirstCall().rejects(new Error('Invalid origin'));

        const { provider, visitedOrigins } = createProvider({ pageUrl: 'about:blank', clearDataForOrigin });

        visitedOrigins.track('https://broken.com/');
        visitedOrigins.track('https://example.com/');

        await provider.clearStorages();

        expect(getClearedOrigins(clearDataForOrigin)).deep.equal(['https://broken.com', 'https://example.com']);

        clearDataForOrigin.resetHistory();

        await provider.clearStorages();

        expect(getClearedOrigins(clearDataForOrigin)).deep.equal(['https://broken.com']);
    });
});
