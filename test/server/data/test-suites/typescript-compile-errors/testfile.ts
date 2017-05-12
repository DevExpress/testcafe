import 'testcafe';

fixture('Test');

test('Yo', async t => {
    await t.doSmthg();
});

test(123, async() => {
});
