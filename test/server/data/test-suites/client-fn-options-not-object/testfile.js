import { ClientFunction } from 'testcafe';

fixture `Test`;

ClientFunction(() => {}).with(123);

test('yo', () => {
});
