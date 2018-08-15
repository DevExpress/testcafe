import fs from 'fs';

fixture `Stop on first fail test`;

let countExecutedTest = 0;

const updateCountExecutedTests = () => {
    countExecutedTest++;

    fs.writeFileSync('countExecutedTests.txt', countExecutedTest);
};

test('test1', async t => {
    updateCountExecutedTests();

    await t.expect(false).eql(true);
});

test('test2', async () => {
    updateCountExecutedTests();
});
