import { expect } from 'chai';

fixture `GH-743`;

var secondStarted = false;

var wait = ms => new Promise(resolve => setTimeout(resolve, ms));

test('First test', async () => {
    await wait(100);
    expect(secondStarted).to.be.false;
});

test('Second test', async () => {
    secondStarted = true;
    await wait(500);
});
