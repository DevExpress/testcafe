const { CLIENT_ERROR_MESSAGE, CLIENT_PAGE_URL } = require('../constants');

fixture`TestController method`
    .page('http://localhost:3000/fixtures/regression/gh-2775/pages/index.html');

test('Should skip JS errors with boolean param', async t => {
    await t.skipJsErrors(true);
    await t.click('button');
});

test('Should skip JS errors with only message param', async t => {
    await t.skipJsErrors({ message: CLIENT_ERROR_MESSAGE });
    await t.click('button');
});

test('Should skip JS errors with multiple options', async t => {
    await t.skipJsErrors({
        message: CLIENT_ERROR_MESSAGE,
        pageUrl: CLIENT_PAGE_URL,
    });
    await t.click('button');
});

test('Should skip JS errors with callback function', async t => {
    await t.skipJsErrors(({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === CLIENT_PAGE_URL,
        { CLIENT_PAGE_URL, CLIENT_ERROR_MESSAGE }
    );

    await t.click('button');
});

test('Should skip JS errors with callback function with dependencies', async t => {
    const deps = {
        CLIENT_ERROR_MESSAGE,
        CLIENT_PAGE_URL,
    };

    await t.skipJsErrors(({ message, pageUrl }) => {
        return message.includes(CLIENT_ERROR_MESSAGE) && pageUrl === CLIENT_ERROR_MESSAGE;
    }, deps);

    await t.click('button');
});

test('Should fail due to incorrect message option', async t => {
    await t.skipJsErrors({ message: 'Incorrect message' });
    await t.click('button');
});

test('Should fail if at least one option is incorrect', async t => {
    await t.skipJsErrors({ message: CLIENT_ERROR_MESSAGE, pageUrl: 'incorrect page url' });
    await t.click('button');
});

test('Should fail with callback function', async t => {
    await t.skipJsErrors(({ message, pageUrl }) => message === CLIENT_ERROR_MESSAGE && pageUrl === 'incorrect url',
        { CLIENT_ERROR_MESSAGE });
    await t.click('button');
});

test('Should fail due to error in callback function', async t => {
    await t.skipJsErrors(({ message }) => message === CLIENT_ERROR_MESSAGE);
    await t.click('button');
});
