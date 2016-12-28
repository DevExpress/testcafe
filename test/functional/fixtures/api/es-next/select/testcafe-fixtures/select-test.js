// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { expect } from 'chai';
import { Selector } from 'testcafe';

fixture `t.select`
    .page `http://localhost:3000/fixtures/api/es-next/select/pages/index.html`;


test('Select element', async t => {
    const el = await t.select('#answer');

    expect(el.innerText).eql('42');
});

test('Select with dependencies', async t => {
    const getById = Selector(id => document.getElementById(id));
    const el      = await t.select(() => getById('answer'), { dependencies: { getById } });

    expect(el.innerText).eql('42');
});

test('Error on instantiation', async t => {
    await t.select(42);
});

test('Error during execution', async t => {
    await t.select(() => {
        throw new Error('yo');
    });
});

test('Select with options', async t => {
    const el = await t.select('#invisible', { visibilityCheck: true });

    expect(el).to.be.null;

    const div = await t.select('div', { index: -2 });

    expect(div.id).to.be.equal('answer');
});
