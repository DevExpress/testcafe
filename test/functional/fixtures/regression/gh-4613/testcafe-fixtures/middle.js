import methodWithFailedAssertion from '../common/method-with-failed-assertion.js';

fixture `Middle`;

test('1', async t => {
    await t.wait(2000);
});

test('2', async () => {
    methodWithFailedAssertion();
});

test('3', async t => {
    await t.wait(2000);
});
