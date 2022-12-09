import methodWithFailedAssertion from '../common/method-with-failed-assertion.js';

fixture `First`;

test('1', async () => {
    methodWithFailedAssertion();
});

test('2', async t => {
    await t.wait(2000);
});

test('3', async t => {
    await t.wait(2000);
});
