import { ClientFunction } from 'testcafe';
import { expect } from 'chai';


fixture `GH-423`
    .page `http://localhost:3000/fixtures/regression/gh-423/pages/index.html`;

const getEventStorage = ClientFunction(()=> window.eventStorage);


test("Don't raise click if target is overlapped", async t => {
    const expectedEvents = ['target1 mousedown', 'element mouseup'];

    await t.click('#target1');

    const actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});

test('Raise click if target appends child', async t => {
    const expectedEvents = ['target2 mousedown', 'child mouseup', 'target2 mouseup', 'target2 click'];

    await t.click('#target2');

    const actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});

test("Don't raise click if target element appends child", async t => {
    const expectedEvents = ['target2 mousedown', 'child mouseup', 'target2 mouseup'];

    await t.click('#target2');

    const actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});

test("Don't raise click if target parent changed", async t => {
    const expectedEvents = ['target3 mousedown', 'target3 mouseup', 'newParent mouseup'];

    await t.click('#target3');

    const actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});

test('Raise click if target parent changed', async t => {
    const expectedEvents = ['target3 mousedown', 'target3 mouseup', 'newParent mouseup', 'target3 click', 'newParent click'];

    await t.click('#target3');

    const actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});

test("Don't raise click event if target appends input element", async t => {
    const expectedEvents = ['target4 mousedown', 'input mouseup', 'target4 mouseup'];

    await t.click('#target4', { offsetX: 5, offsetY: 5 });

    const actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});
