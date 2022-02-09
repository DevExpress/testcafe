import { Selector } from 'testcafe';
import { FAIL_RESULT_ATTEMPTS, SUCCESS_RESULT_ATTEMPTS, EXCEPTION } from '../constants';


const successTestCounter = {
    'Chrome':            -1,
    'Firefox':           -1,
    'Internet Explorer': -1,

};
const failTestCounter    = {
    'Chrome':            -1,
    'Firefox':           -1,
    'Internet Explorer': -1,

};

const processAttempt = async (attempts, testNumber, t) => {
    switch (attempts[testNumber]) {
        case EXCEPTION.Server:
            throw new Error(`Custom server exception on test #${ testNumber }`);
        case EXCEPTION.Client:
            await t
                .typeText('#testInput', `Custom client exception on test #${ testNumber }`)
                .click('#failButton')
                .expect(Selector('#testInput').value).eql('success');
            break;
        case EXCEPTION.None:
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
    successTestCounter[t.browser.name]++;

    await processAttempt(SUCCESS_RESULT_ATTEMPTS, successTestCounter[t.browser.name], t);
});


test(`Throw exceptions on three attempts`, async t => {
    failTestCounter[t.browser.name]++;

    await processAttempt(FAIL_RESULT_ATTEMPTS, failTestCounter[t.browser.name], t);
});
