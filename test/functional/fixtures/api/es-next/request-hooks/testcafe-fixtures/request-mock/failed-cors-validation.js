import { Selector, RequestMock } from 'testcafe';

const mock = RequestMock()
    .onRequestTo('http://dummy-url.com/get')
    .respond({ prop: 'value' }, 200, { 'not-specify-cors-headers': true });

fixture `Failed CORS validation`
    .page('http://localhost:3000/fixtures/api/es-next/request-hooks/pages/request-mock/failed-cors-validation.html')
    .requestHooks(mock);

test('Failed CORS validation', async t => {
    await t
        .click('#btnSendFetch')
        .expect(Selector('#requestStatusText').textContent).eql('Sent');
});
