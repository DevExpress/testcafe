const { CLIENT_ERROR_MESSAGE, CLIENT_PAGE_URL, CLIENT_ERROR_REGEXP, CLIENT_PAGE_URL_REGEXP } = require('../constants');

fixture`Fixture and Test methods`
    .page('http://localhost:3000/fixtures/page-js-errors/pages/skip-js-errors.html')
    .skipJsErrors(({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === CLIENT_PAGE_URL, {
        CLIENT_ERROR_MESSAGE,
        CLIENT_PAGE_URL,
    });


test('Should skip JS errors with callback function specified in fixture', async t => {
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

test('Should skip JS errors with regular expression in message', async t => {
    await t.click('button');
}).skipJsErrors({
    message: CLIENT_ERROR_REGEXP,
    pageUrl: CLIENT_PAGE_URL_REGEXP,
});

test('Should fail if the regexp message option doesnt satisfy the client error message', async t => {
    await t.click('button');
}).skipJsErrors({
    message: /incorrect regexp/,
    pageUrl: CLIENT_PAGE_URL_REGEXP,
});

test('Should fail if error occurred in callback function', async t => {
    await t.click('button');
}).skipJsErrors(({ message }) => message === CLIENT_ERROR_MESSAGE);

test('Should fail if value specified in test is overridden to false in TestController', async t => {
    await t.skipJsErrors(false)
        .click('button');
}).skipJsErrors(true);

test('Should fail with test callback function', async t => {
    await t.click('button');
}).skipJsErrors(({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === 'incorrect url',
    { CLIENT_ERROR_MESSAGE });
