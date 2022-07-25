const { CLIENT_ERROR_MESSAGE, CLIENT_PAGE_URL } = require('../constants');

fixture`Runner run options`
    .page('http://localhost:3000/fixtures/regression/gh-2775/pages/index.html');


test('Throw client error', async t => {
    await t.click('button');
});

test.skipJsErrors(false)('Should fail due to test skipJsErrors(false) method call', async t => {
    await t.click('button');
});

test('Should skip JS errors with callback function specified in test', async t => {
    await t.click('button');
}).skipJsErrors(({ message }) => message === CLIENT_ERROR_MESSAGE, { CLIENT_ERROR_MESSAGE });

test('Should skip JS errors with skipJsErrorsOptions object in test', async t => {
    await t.click('button');
}).skipJsErrors({
    message: CLIENT_ERROR_MESSAGE,
    pageUrl: CLIENT_PAGE_URL,
});
