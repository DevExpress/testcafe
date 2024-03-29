// NOTE: to preserve callsites, add new tests AFTER the existing ones

import { expect } from 'chai';
import { ClientFunction, Selector } from 'testcafe';

fixture `Click`
    .page `http://localhost:3000/fixtures/api/es-next/click/pages/index.html`;

const getClickOffset = ClientFunction(() => window.clickOffset);

test('Incorrect action selector', async t => {
    await t.click(123);
});

test('Incorrect action option', async t => {
    await t.click('#btn', { offsetX: -3.5 });
});

test('Click button', async t => {
    await t.click('#btn');
});

test('Click without offset options', async t=> {
    await t.click('#div');

    const expectedClickOffset = { x: 50, y: 50 };
    const actualClickOffset   = await getClickOffset();

    expect(actualClickOffset.x).eql(expectedClickOffset.x);
    expect(actualClickOffset.y).eql(expectedClickOffset.y);
});

test('Error in selector', async t => {
    await t.click(() => {
        throw new Error('yo');
    });
});

const isStatusBtnClicked = ClientFunction(() => document.querySelector('#status').textContent === 'Clicked!');
const getStatusBtn       = Selector('#statusBtn');


test('Function as selector', async t => {
    await t.click(() => document.querySelector('#statusBtn'));

    expect(await isStatusBtnClicked()).to.be.true;
});

test('Selector function as selector', async t => {
    await t.click(getStatusBtn);

    expect(await isStatusBtnClicked()).to.be.true;
});

test('Node snapshot as selector', async t => {
    const statusBtn = await getStatusBtn();

    await t.click(statusBtn);

    expect(await isStatusBtnClicked()).to.be.true;
});

test('Promise returned by selector as selector', async t => {
    const getElementByIdAndIncCounter = Selector(id => {
        window.selectorCallCount++;

        return document.getElementById(id);
    });

    await t.click(getElementByIdAndIncCounter('statusBtn'));

    expect(await isStatusBtnClicked()).to.be.true;

    // NOTE: test selector optimization - it should be executed only once.
    await new Promise(resolve => setTimeout(resolve, 800));

    expect(await t.eval(() => window.selectorCallCount)).eql(1);
});

test('Selector returns text node', async t => {
    const getNode = Selector(() => document.getElementById('btn').childNodes[0]);

    await t.click(getNode);
});


test('Click on a more than half-shifted element', async t => {
    await t.click('#shifted-element');

    const expectedClickOffset = { x: 75, y: 25 };
    const actualClickOffset   = await getClickOffset();

    expect(actualClickOffset.x).eql(expectedClickOffset.x);
    expect(actualClickOffset.y).eql(expectedClickOffset.y);
});

test('Click on an element with overlapped center', async t => {
    await t.click('#overlapped-center');

    const expectedClickOffset = { x: 75, y: 25 };
    const actualClickOffset   = await getClickOffset();

    expect(actualClickOffset.x).eql(expectedClickOffset.x);
    expect(actualClickOffset.y).eql(expectedClickOffset.y);
});

test('Click overlapped element', async t => {
    await t.click('.child1');
}).page('http://localhost:3000/fixtures/api/es-next/click/pages/overlapped.html');

test('Check click pressure', async t => {
    await t.click('#statusBtn');

    expect(await t.eval(() => window.pointerdownPressure)).gt(0);
});
