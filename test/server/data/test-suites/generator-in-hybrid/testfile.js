import { Hybrid } from 'testcafe';

fixture `Test`;

Hybrid(function* () {
    yield 1;
});

test('yo', () => {
});
