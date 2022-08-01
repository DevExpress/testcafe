const { CLIENT_ERROR_MESSAGE, CLIENT_PAGE_URL, CLIENT_ERROR_REGEXP, CLIENT_PAGE_URL_REGEXP } = require('../constants');

fixture`TestController method`
    .page('http://localhost:3000/fixtures/page-js-errors/pages/skip-js-errors.html');

test('Should skip JS errors with boolean param', async t => {
    await t.skipJsErrors(true)
        .click('button');
});

test('Should skip JS errors with only message param', async t => {
    await t.skipJsErrors({ message: CLIENT_ERROR_MESSAGE })
        .click('button');
});

test('Should skip JS errors with multiple options', async t => {
    await t.skipJsErrors({
        message: CLIENT_ERROR_MESSAGE,
        pageUrl: CLIENT_PAGE_URL,
    })
        .click('button');
});

test('Should skip JS errors with callback function', async t => {
    await t.skipJsErrors(({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === CLIENT_PAGE_URL,
        { CLIENT_PAGE_URL, CLIENT_ERROR_MESSAGE },
    )
        .click('button');
});

test('Should skip JS errors with callback function with dependencies', async t => {
    const deps = {
        CLIENT_ERROR_MESSAGE,
        CLIENT_PAGE_URL,
    };

    await t.skipJsErrors(({ message, pageUrl }) => {
        return message.includes(CLIENT_ERROR_MESSAGE) && pageUrl === CLIENT_ERROR_MESSAGE;
    }, deps)
        .click('button');
});

test('Should skip JS errors with regular expression in message', async t => {
    await t.skipJsErrors({ message: CLIENT_ERROR_REGEXP, pageUrl: CLIENT_PAGE_URL_REGEXP })
        .click('button');
});
test('Should fail if the regexp message option doesnt satisfy the client error message', async t => {
    await t.skipJsErrors({ message: /^Incorrect.*Regexp/, pageUrl: CLIENT_PAGE_URL_REGEXP })
        .click('button');
});

test('Should fail due to incorrect message option', async t => {
    await t.skipJsErrors({ message: 'Incorrect message' })
        .click('button');
});

test('Should fail if at least one option is incorrect', async t => {
    await t.skipJsErrors({ message: CLIENT_ERROR_MESSAGE, pageUrl: 'incorrect page url' })
        .click('button');
});

test('Should fail with callback function', async t => {
    await t.skipJsErrors(({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === 'incorrect url',
        { CLIENT_ERROR_MESSAGE })
        .click('button');
});

test('Should fail due to error in callback function', async t => {
    await t.skipJsErrors(({ message }) => message === CLIENT_ERROR_MESSAGE)
        .click('button');
});
