import { ClientFunction } from 'testcafe';

fixture `Test`;

ClientFunction(function* () {
    yield 1;
});

test('yo', () => {
});
