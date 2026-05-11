import { ClientFunction } from 'testcafe';

fixture('GH-8391 - Firefox proxy mode should preserve WebCrypto')
    .page`http://localhost:3000/fixtures/regression/gh-8391/pages/index.html`;

const getCryptoState = ClientFunction(() => ({
    hasSubtle:       !!(window.crypto && window.crypto.subtle),
    isSecureContext: window.isSecureContext,
}));

test('Should expose window.crypto.subtle in Firefox proxy mode', async t => {
    const cryptoState = await getCryptoState();

    await t.expect(cryptoState.isSecureContext).ok('Expected secure context in proxy mode');
    await t.expect(cryptoState.hasSubtle).ok('Expected WebCrypto API to be available in proxy mode');
});
