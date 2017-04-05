import { missingAwaitFn } from './helpers';
// NOTE: to preserve callsites, add new tests AFTER the existing ones
fixture `TestController`
    .page `http://localhost:3000/fixtures/api/es-next/test-controller/pages/index.html`;

test('Chaining', async t => {
    await t
        .click('#btn1')
        .click('#btn2');

    await t
        .click('#btn3')
        .click('#page2-btn1')
        .click('#page2-btn2');
});

test('Chaining callsites', async t => {
    await t
        .click('#btn1')
        .click('#btn2')
        .click('#error')
        .click('#btn3');
});

test('Missing await', async t => {
    await t.click('#btn3');

    t.click('#page2-btn1');

    await t.click('#page2-btn2');
});

test('Missing await in chain', async t => {
    await t.click('#btn2');

    t
        .click('#btn3')
        .click('#page2-btn2');

    await t.click('#btn2');
});

test('Missing await in the end of the test', async t => {
    t.click('#btn3');
});

test('Error caused by action with missing await', async t => {
    t.click('#error');

    await t.click('#btn2');
});

test('Missing await with disrupted chain', async t => {
    var t2 = t.click('#btn1');

    await t2;

    t.click('#btn2');

    await t.click('#btn3');
});

test('Missing await in helper', async t => {
    await missingAwaitFn(t);
});

test('Missing await before error', async t => {
    t.click('#btn2');

    throw new Error('Hey!');
});

test('GH-1285', async t => {
    await t
        .click('#btn2')
        .expect(await t.click('#btn3')).notEql('Hey ya!');
});
