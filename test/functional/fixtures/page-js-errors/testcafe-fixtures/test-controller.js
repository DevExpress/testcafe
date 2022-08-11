const { CLIENT_ERROR_MESSAGE, CLIENT_PAGE_URL, CLIENT_PAGE_URL_REGEXP } = require('../constants');

fixture`TestController method`
    .page('http://localhost:3000/fixtures/page-js-errors/pages/skip-js-errors.html');

test('Should skip JS errors with boolean param', async t => {
    await t.skipJsErrors(true)
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

test('Should fail with callback function', async t => {
    await t.skipJsErrors(({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === 'incorrect url',
        { CLIENT_ERROR_MESSAGE })
        .click('button');
});

test('Should fail if message option doesn\'t satisfy the client error message', async t => {
    await t.skipJsErrors({
        message: /incorrect message/,
        pageUrl: CLIENT_PAGE_URL_REGEXP,
    })
        .click('button');
});

test('Should fail due to error in callback function', async t => {
    await t.skipJsErrors(({ message }) => message === CLIENT_ERROR_MESSAGE)
        .click('button');
});

test('Should skip JS errors, with async callback function', async t => {
    const asyncFunc = ({ message }) =>
        new Promise(resolve => setTimeout(() => resolve(message.includes(CLIENT_ERROR_MESSAGE)), 3000));

    await t.skipJsErrors(asyncFunc, { CLIENT_ERROR_MESSAGE })
        .click('button');
});

test('Should skip JS errors without param', async t => {
    await t.skipJsErrors();
});

test('Should correctly skip JS errors with multiple method calls', async t => {
    await t.skipJsErrors(true)
        .click('button')
        .skipJsErrors(false)
        .click('button');
});
