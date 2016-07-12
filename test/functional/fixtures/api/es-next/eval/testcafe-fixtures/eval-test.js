// NOTE: to preserve callsites, add new tests AFTER the existing ones
import { ClientFunction } from 'testcafe';
import { expect } from 'chai';

fixture `t.eval`
    .page `http://localhost:3000/fixtures/api/es-next/eval/pages/index.html`;

const getById = ClientFunction(id => document.getElementById(id));

test('Get UA', async t => {
    throw await t.eval(() => navigator.userAgent);
});

test('Eval with dependencies', async t => {
    const answer = await t.eval(() => getById('answer').textContent, { dependencies: { getById } });

    expect(answer).eql('42');
});

test('Error on instantiation', async t => {
    await t.eval('42');
});

test('Error during execution', async t => {
    await t.eval(() => {
        throw new Error('Hi there!');
    });
});
