import 'testcafe';

fixture('Fixture1');

test('Fixture1Test1', async () => {
});

const test2Name = 'Fixture1Test2';

test(test2Name, async () => {
    return 'F1T2';
});

fixture(`Fixture${1 + 1}`);

test('Fixture2Test1', async () => {
    return 'F2T1';
});
