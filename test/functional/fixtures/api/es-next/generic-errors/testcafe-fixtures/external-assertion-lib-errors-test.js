import assert from 'assert';
import { expect, config as chaiConfig } from 'chai';
import { assertionError } from './helpers';

// NOTE: set this flag to check that TestCafe adds a correct callsite to
// the report when there are chai module files on top of the error stack.
chaiConfig.includeStack = true;

fixture `External assertion library errors`
    .page(`http://localhost:3000/fixtures/api/es-next/generic-errors/pages/index.html`);

test('Built-in assertion lib error', () => {
    assert.strictEqual('answer', '42');
});

test('Chai assertion error', () => {
    expect('answer').eql('42');
});

test('Assertion error in helper', () => {
    assertionError();
});
