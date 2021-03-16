import { RequestMock, Selector } from 'testcafe';

const getUrlPromise = new Promise(resolve => {
    setTimeout(() => {
        resolve('http://dummy-url.com/get');
    }, 2000);
});

const mock = RequestMock()
    .onRequestTo(async req => {
        return req.url === await getUrlPromise;
    })
    .respond('Done!', 200, { 'access-control-allow-origin': '*' });

fixture `Fixture`
    .requestHooks(mock)
    .page('http://localhost:3000/fixtures/api/es-next/request-hooks/pages/api/request-filter-rule-async-predicate.html');

test('test', async t => {
    await t
        .click('button')
        .expect(Selector('h2').textContent).eql('Done!');
});
