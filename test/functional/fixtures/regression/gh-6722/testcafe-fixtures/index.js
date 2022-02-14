import { Selector } from 'testcafe';
import { FAIL_RESULT_ATTEMPTS, SUCCESS_RESULT_ATTEMPTS, ERRORS } from '../constants';


const successTestCounter = {};
const failTestCounter    = {};

const processAttempt = async (attempts, testNumber, t) => {
    switch (attempts[testNumber]) {
        case ERRORS.Server:
            throw new Error(`Custom server exception on test #${ testNumber }`);
        case ERRORS.Client:
            await t
                .typeText('#testInput', `Custom client exception on test #${ testNumber }`)
                .click('#failButton')
                .expect(Selector('#testInput').value).eql('success');
            break;
        case ERRORS.None:
            await t
                .click('#successButton')
                .expect(Selector('#testInput').value).eql('success');
            break;
    }
};

fixture`GH-1994 - The element that matches the specified selector is not visible`
    .page`http://localhost:3000/fixtures/regression/gh-6722/pages/index.html`;

test(`Paste text on button click`, async t => {
    await t
        .click('#successButton')
        .expect(Selector('#testInput').value).eql('success');
});

test(`Throw exceptions on two attempts`, async t => {
    if (!successTestCounter.hasOwnProperty(t.browser.alias))
        successTestCounter[t.browser.alias] = -1;

    successTestCounter[t.browser.alias]++;

    const attempts = typeof SUCCESS_RESULT_ATTEMPTS[t.browser.alias] !== 'undefined' ? SUCCESS_RESULT_ATTEMPTS[t.browser.alias] : SUCCESS_RESULT_ATTEMPTS['default'];

    await processAttempt(attempts, successTestCounter[t.browser.alias], t);
});


test(`Throw exceptions on three attempts`, async t => {
    if (!failTestCounter.hasOwnProperty(t.browser.alias))
        failTestCounter[t.browser.alias] = -1;

    failTestCounter[t.browser.alias]++;

    const attempts = typeof FAIL_RESULT_ATTEMPTS[t.browser.alias] !== 'undefined' ? FAIL_RESULT_ATTEMPTS[t.browser.alias] : FAIL_RESULT_ATTEMPTS['default'];

    await processAttempt(attempts, failTestCounter[t.browser.alias], t);
});
