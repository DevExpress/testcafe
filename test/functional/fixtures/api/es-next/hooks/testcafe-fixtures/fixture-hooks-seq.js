import delay from '../../../../../../../src/utils/delay';

fixture `Fixture 1`
    .after(async () => {
        await delay(500);

        throw new Error('$$afterhook1$$');
    });

test('Test1', async () => {
    throw new Error('$$test1$$');
});


fixture `Fixture2`
    .after(async () => {
        throw new Error('$$afterhook2$$');
    });

test('Test2', async () => {
    throw new Error('$$test2$$');
});

fixture `Fixture3`;

test('Test3', async () => {
    throw new Error('$$test3$$');
});
