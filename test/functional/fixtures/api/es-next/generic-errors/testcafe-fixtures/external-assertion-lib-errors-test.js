import assert from 'assert';
import { expect } from 'chai';
import { assertionError } from './helpers';

fixture `External assertion library errors`
    .page(`http://localhost:3000/api/es-next/generic-errors/pages/index.html`);

test('Built-in assertion lib error', () => {
    assert.strictEqual('answer', '42');
});

test('Chai assertion error', () => {
    expect('answer').eql('42');
});

test('Assertion error in helper', () => {
    assertionError();
});
