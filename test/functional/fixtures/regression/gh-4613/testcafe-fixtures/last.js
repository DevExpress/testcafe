import methodWithFailedAssertion from '../common/method-with-failed-assertion.js';

fixture `Last`;

test('1', async t => {
    await t.wait(2000);
});

test('2', async t => {
    await t.wait(2000);
});

test('3', async () => {
    methodWithFailedAssertion();
});
