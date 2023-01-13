import {
    CLIENT_ERROR_MESSAGE,
    CLIENT_PAGE_URL,
    CLIENT_PAGE_URL_REGEXP,
    SKIP_JS_ERRORS_CALLBACK_OPTIONS,
    CLIENT_ERROR_REGEXP,
} from '../constants.js';

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

test('Should skip JS errors with SkipJsErrorsCallbackOptions', async t => {
    await t.skipJsErrors(SKIP_JS_ERRORS_CALLBACK_OPTIONS)
        .click('button');
});

test('Should skip JS errors with callback function returning Promise', async t => {
    const asyncFunc = () =>
        new Promise(resolve => setTimeout(() => resolve(true), 3000));

    await t.skipJsErrors(asyncFunc)
        .click('button');
});

test('Should skip JS errors without param', async t => {
    await t.skipJsErrors();
});

test('Should skip JS errors if some SkipJsErrorsCallbackOptions prop is string containing RegExp', async t => {
    await t.skipJsErrors({
        message: `${ CLIENT_ERROR_REGEXP }`,
    })
        .click('button');
});

test('Should correctly skip JS errors with multiple method calls', async t => {
    await t.skipJsErrors(true)
        .click('button')
        .skipJsErrors(false)
        .click('button');
});

test('Should fail with SkipJsErrorsCallbackOptions', async t => {
    const errMessage      = CLIENT_ERROR_MESSAGE;
    const callbackOptions = {
        fn:           ({ message, pageUrl }) => message === errMessage && pageUrl === 'incorrect url',
        dependencies: { errMessage },
    };

    await t.skipJsErrors(callbackOptions)
        .click('button');
});

test("Should fail if message option doesn't satisfy the client error message", async t => {
    await t.skipJsErrors({
        message: /incorrect message/,
        pageUrl: CLIENT_PAGE_URL_REGEXP,
    })
        .click('button');
});

test('Should fail due to error in callback function', async t => {
    await t.skipJsErrors(() => {
        throw new Error('Error in the skipJsError callback function');
    })
        .click('button');
});
