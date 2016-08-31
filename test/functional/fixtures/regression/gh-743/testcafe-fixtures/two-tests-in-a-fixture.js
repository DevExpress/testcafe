import { expect } from 'chai';

fixture `GH-743`;

var secondStarted = false;

test('First test', async t => {
    await t.wait(100);
    expect(secondStarted).to.be.false;
});

test('Second test', async () => {
    secondStarted = true;
});
