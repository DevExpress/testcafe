import { Selector, ClientFunction } from 'testcafe';
fixture `Assertions`
    .page `http://localhost:3000/fixtures/api/es-next/assertions/pages/index.html`;

test('.eql() assertion', async t => {
    await t
        .expect({ a: 2 }).eql({ a: 2 })
        .expect('hey').eql('yo', 'testMessage');
});

test('.notEql() assertion', async t => {
    await t
        .expect({ b: 3 }).notEql({ a: 2 })
        .expect(2).notEql(2);
});

test('.ok() assertion', async t => {
    await t
        .expect({}).ok()
        .expect(false).ok();
});

test('.notOk() assertion', async t => {
    await t
        .expect(false).notOk()
        .expect(1).notOk();
});

test('.contains() assertion', async t => {
    await t
        .expect('heyyo').contains('hey')
        .expect([1, 2, 3]).contains(4);
});

test('.notContains() assertion', async t => {
    await t
        .expect([1, 2, 3]).notContains(4)
        .expect('answer42').notContains('42');
});

test('.typeOf() assertion', async t => {
    await t
        .expect(() => true).typeOf('function')
        .expect({}).typeOf('object')
        .expect(1).typeOf('number')
        .expect('string').typeOf('string')
        .expect(true).typeOf('boolean')
        .expect(void 0).typeOf('undefined')
        .expect(null).typeOf('null')
        .expect(new RegExp('regex')).typeOf('regexp')
        .expect(42).typeOf('function');
});

test('.notTypeOf() assertion', async t => {
    await t
        .expect('function').notTypeOf('function')
        .expect('object').notTypeOf('object')
        .expect('number').notTypeOf('number')
        .expect(1).notTypeOf('string')
        .expect('boolean').notTypeOf('boolean')
        .expect('undefined').notTypeOf('undefined')
        .expect('null').notTypeOf('null')
        .expect('regex').notTypeOf('regexp')
        .expect(42).notTypeOf('number');
});

test('.gt() assertion', async t => {
    await t
        .expect(42).gt(32)
        .expect(42).gt(42);
});

test('.gte() assertion', async t => {
    await t
        .expect(42).gte(32)
        .expect(42).gte(42)
        .expect(42).gte(53);
});

test('.lt() assertion', async t => {
    await t
        .expect(32).lt(42)
        .expect(42).lt(42);
});

test('.lte() assertion', async t => {
    await t
        .expect(32).lte(42)
        .expect(42).lte(42)
        .expect(42).lte(12);
});

test('.within() assertion', async t => {
    await t
        .expect(2.3).within(2, 3)
        .expect(4.5).within(4.6, 7);
});

test('.notWithin() assertion', async t => {
    await t
        .expect(4.5).notWithin(4.6, 7)
        .expect(2.3).notWithin(2, 3);
});

test('Selector result assertion', async t => {
    const el = Selector('#el1');

    await t
        .click('#makeFloat')
        .expect(el.getStyleProperty('float')).eql('left')
        .click('#setClass')
        .expect(el.hasClass('hey')).ok()
        .click('#setAttr')
        .expect(el.getAttribute('checked')).ok()
        .click('#setTextContent')
        .expect(el.textContent).eql('42');
});

test('Selector result assertion timeout', async t => {
    const el = Selector('#el1');

    await t
        .click('#makeFloat')
        .expect(el.getStyleProperty('float')).eql('left');
});

test('Unawaited Promise assertion', async t => {
    await t.expect(Promise.resolve()).ok();
});

test('Unawaited Promise assertion override', async t => {
    await t.expect(Promise.resolve()).ok({ allowUnawaitedPromise: true });
});

test('Missing await', async t => {
    t.expect(42).eql(43);
});

test('"timeout" is not a number', async t => {
    await t.expect(42).eql(43, { timeout: 'hey' });
});

test('"timeout" option', async t => {
    const el = Selector('#el1');

    await t
        .click('#makeFloat')
        .expect(el.getStyleProperty('float')).eql('left', { timeout: 500 })
        .click('#setClass')
        .expect(el.hasClass('hey')).ok('message', { timeout: 500 });
});

test('.match() assertion', async t => {
    await t
        .expect('42 hey').match(/\d+ hey/)
        .expect('yo').match(/[x,z]o/);
});

test('.notMatch() assertion', async t => {
    await t
        .expect('yo').notMatch(/[x,z]o/)
        .expect('42 hey').notMatch(/\d+ hey/);
});

test('ClientFunction result assertion', async t => {
    const getSomeVar = ClientFunction(() => window.someVar);

    await t.expect(getSomeVar()).eql(2);
});

test('Assertion without method call', async t => {
    await t.expect();
});

test('Passing Selector instance into an assertion', async t => {
    await t.expect(Selector('#el1')).eql(true);
});

test('Passing ClientFunction instance into an assertion', async t => {
    await t.expect(ClientFunction(() => true)).eql(true);
});

test('Await Selector property', async t => {
    await t
        .expect(Selector('#el1')).ok()
        .expect(await Selector('#el1')).ok()
        .expect(Selector('#el1').innerText).eql('')
        .expect(await Selector('#el1').innerText).eql('');
});

test('Snapshot property without await', async t => {
    await t.expect(Selector('#el1').innerText).eql('');

    console.log(Selector('#el1').innerText); //eslint-disable-line

    const tag = `element: ${Selector('#el1').tagName}`; //eslint-disable-line
});

test('Snapshot property without await but valid', async t => {
    const b = Selector('#el1').innerText; //eslint-disable-line

    await t.expect(Selector('#el1').innerText).eql('');
});

test('Reused unawaited selector property assertion from a function', async t => {
    async function assertionFunction () {
        const selector = Selector('#el1');

        await t.expect(selector.innerText).eql('');
    }

    await assertionFunction();
    await assertionFunction();
    await assertionFunction();
});

test('Reused awaited selector property assertion from a function', async t => {
    async function assertionFunction () {
        const selector = Selector('#el1');

        await t.expect(await selector.innerText).eql('');
    }

    await assertionFunction();
    await assertionFunction();
    await assertionFunction();
});

test('Reused unawaited selector property assertion in a loop', async t => {
    for (let i = 0; i < 3; i++)
        await t.expect(Selector('#el1').innerText).eql('');
});

test('Reused awaited selector property assertion in a loop', async t => {
    for (let i = 0; i < 3; i++)
        await t.expect(await Selector('#el1').innerText).eql('');
});

test('Multiple awaited selector properties in one assertion', async t => {
    const selector = Selector('#el1');

    await t.expect(await selector.innerText + await selector.innerText).eql('');
});
