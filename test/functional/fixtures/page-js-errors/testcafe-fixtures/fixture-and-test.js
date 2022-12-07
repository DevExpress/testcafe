import { SKIP_JS_ERRORS_CALLBACK_OPTIONS } from '../constants.js';

fixture`Fixture and Test methods`
    .page('http://localhost:3000/fixtures/page-js-errors/pages/skip-js-errors.html')
    .skipJsErrors(SKIP_JS_ERRORS_CALLBACK_OPTIONS);


test('Should skip JS errors with callback function specified in fixture', async t => {
    await t.click('button');
});

test.skipJsErrors(false)('Should fail due to test skipJsErrors(false) method call', async t => {
    await t.click('button');
});

test('Should skip JS errors with callback function specified in test', async t => {
    await t.click('button');
}).skipJsErrors(({ message }) => message === `Custom client error`);

test('Should fail if value specified in test is overridden to false in TestController', async t => {
    await t.skipJsErrors(false)
        .click('button');
}).skipJsErrors(true);
