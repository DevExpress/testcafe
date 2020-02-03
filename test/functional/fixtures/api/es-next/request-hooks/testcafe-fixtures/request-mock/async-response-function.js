import { RequestMock, Selector } from 'testcafe';

const responsePromise = new Promise(resolve => {
    setTimeout(() => {
        resolve('response');
    }, 1000);
});

const requestMock = RequestMock()
    .onRequestTo('http://dummy-url.com/route')
    .respond(async (req, res) => {
        const response = await responsePromise;

        res.headers['access-control-allow-origin'] = '*';
        res.setBody(response);
    });

fixture `Fixture`
    .page('http://localhost:3000/fixtures/api/es-next/request-hooks/pages/request-mock/async-response-function.html')
    .requestHooks(requestMock);

test('test', async t => {
    await t
        .click('#sendRequest')
        .expect(Selector('#result').textContent).eql('response');
});
