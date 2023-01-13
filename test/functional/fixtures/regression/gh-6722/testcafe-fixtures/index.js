import {
    FAIL_RESULT_ATTEMPTS,
    SUCCESS_RESULT_ATTEMPTS,
    ERRORS,
    Counter,
} from '../constants.js';

const counter = new Counter();

const processAttempt = async (attempts, testNumber, t) => {
    if (attempts[testNumber] === ERRORS.Server)
        throw new Error(`Custom server exception on test #${ testNumber }`);

    if (attempts[testNumber] === ERRORS.Client) {
        await t
            .typeText('#testInput', `Custom client exception on test #${ testNumber }`)
            .click('#failButton');
    }
};

fixture`GH-6722 - Provide more information about errors for each test run in quarantine mode`
    .page`http://localhost:3000/fixtures/regression/gh-6722/pages/index.html`;

test(`Throw exceptions on two attempts`, async t => {
    counter.add(t.browser.alias);

    await processAttempt(SUCCESS_RESULT_ATTEMPTS, counter.get(t.browser.alias), t);
});


test(`Throw exceptions on three attempts`, async t => {
    counter.add(t.browser.alias);

    await processAttempt(FAIL_RESULT_ATTEMPTS, counter.get(t.browser.alias), t);
});
