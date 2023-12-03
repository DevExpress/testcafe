import { expect } from 'chai';

let beforeHookCallNumber = 0;

fixture('Concurrent fixture before hook')
    .before(async () => {
        await new Promise(r => setTimeout(r, 10000));
        beforeHookCallNumber += 1;
    })
    .after(() => {
        expect(beforeHookCallNumber).eql(1);
    });

test('test1', async t => {
    await t.expect(beforeHookCallNumber).eql(1);
});

test('test2', async t => {
    await t.expect(beforeHookCallNumber).eql(1);
});

test('test3', async t => {
    await t.expect(beforeHookCallNumber).eql(1);
});
