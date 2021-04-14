import { RequestHook, Selector } from 'testcafe';

const HEADER_MANIPULATION_ROUTE = '/echo-custom-request-headers-in-response-headers';

class HeaderManipulationHook extends RequestHook {
    constructor () {
        super(new RegExp(HEADER_MANIPULATION_ROUTE));
    }

    onRequest () { }

    onResponse () { }

    async _onConfigureResponse (event) {
        await super._onConfigureResponse(event);

        await event.setHeader('x-header-1', 'value-1');
        await event.setHeader('x-header-2', 'value-2');
        await event.removeHeader('x-header-3');
        await event.removeHeader('x-header-4');
    }
}

fixture `Fixture`
    .page('http://localhost:3000/fixtures/api/es-next/request-hooks/pages/api/change-remove-response-headers.html')
    .requestHooks(new HeaderManipulationHook());

test('test', async t => {
    await t
        .click('#sendRequest')
        .expect(Selector('#requestStatus').textContent).eql('Received');

    const headersText = await Selector('#result').textContent;
    const headersObj  = JSON.parse(headersText);

    await t.expect(headersObj).eql({
        'x-header-1': 'value-1',
        'x-header-2': 'value-2',
        'x-header-5': 'value-5'
    });
});
