// NOTE: to preserve callsites, add new tests AFTER the existing ones
import throwError from './helpers';

fixture `Errors in test code`
    .page `http://localhost:3000/fixtures/api/es-next/generic-errors/pages/index.html`;

test('Test code throws Error', () => {
    throw new Error('Yo!');
});

test('Test code throws non-Error object', () => {
    throw 42;
});

test('Test code throws null', () => {
    throw null;
});

test('Helper code throws Error', () => {
    throwError();
});
