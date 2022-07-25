const { CLIENT_ERROR_MESSAGE, CLIENT_PAGE_URL } = require('../constants');

fixture`Fixture and Test methods`
    .page('http://localhost:3000/fixtures/regression/gh-2775/pages/index.html')
    .skipJsErrors(({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === CLIENT_PAGE_URL, {
        CLIENT_ERROR_MESSAGE,
        CLIENT_PAGE_URL,
    });


test('Should skip JS errors due to fixture callback', async t => {
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

test('Should fail due to errors in callback function', async t => {
    await t.click('button');
}).skipJsErrors(({ message }) => message === CLIENT_ERROR_MESSAGE);

test('Should fail due to TestController value override', async t => {
    await t.skipJsErrors({ message: 'Incorrect message' });
    await t.click('button');
}).skipJsErrors(true);

test('Should fail with test callback function', async t => {
    await t.click('button');
}).skipJsErrors(({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === 'incorrect url',
    { CLIENT_ERROR_MESSAGE });
