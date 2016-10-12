import { expect } from 'chai';
import { ClientFunction } from 'testcafe';

fixture `GH-851`
    .page `http://localhost:3000/fixtures/regression/gh-851/pages/index.html`;

const getEventStorage = ClientFunction(() => window.eventStorage);

test('Raise click for common parent', async t => {
    var expectedEvents = ['body click'];

    await t.click('#div1');

    var actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});

test('Raise click for top element', async t => {
    var expectedEvents = ['body click'];

    await t.click('#div2');

    var actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});

test('Raise dblclick for common element', async t => {
    var expectedEvents = ['div click', 'body click', 'body dblclick'];

    await t.doubleClick('#div3');

    var actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});

test('Raise dblclick for a top element', async t => {
    var expectedEvents = ['div click', 'body click', 'body dblclick'];

    await t.doubleClick('#div4');

    var actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});

test("Don't raise click for common parent", async t => {
    var expectedEvents = [];

    await t.click('#div1');

    var actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});

test("Don't raise click for top element", async t => {
    var expectedEvents = [];

    await t.click('#div2');

    var actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});

test("Don't raise dblclick for common element", async t => {
    var expectedEvents = ['div click'];

    await t.doubleClick('#div3');

    var actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});

test("Don't raise dblclick for a top element", async t => {
    var expectedEvents = ['div click'];

    await t.doubleClick('#div4');

    var actualEvents = await getEventStorage();

    expect(actualEvents).deep.eql(expectedEvents);
});
