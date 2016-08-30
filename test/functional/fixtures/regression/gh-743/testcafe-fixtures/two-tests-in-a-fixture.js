import { expect } from 'chai';

fixture `GH-743`;

var secondTestInProgress = false;

var wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('First test', async () => {
    await wait(100);
    expect(secondTestInProgress).to.be.false;
});

test('Second test', async () => {
    secondTestInProgress = true;
    await wait(500);
    secondTestInProgress = false;
});
