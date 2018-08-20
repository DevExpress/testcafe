import fs from 'fs';

fixture `Stop on first fail test`;

let testRunCount = 0;

const updateTestRunCount = () => {
    testRunCount++;

    fs.writeFileSync('testRunCount.txt', testRunCount);
};

test('test1', async () => {
    updateTestRunCount();
});

test('test2', async t => {
    updateTestRunCount();

    await t.expect(false).ok();
});

test('test3', async () => {
    updateTestRunCount();
});
