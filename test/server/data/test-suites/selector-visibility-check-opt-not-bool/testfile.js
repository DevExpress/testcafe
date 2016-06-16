import { Selector } from 'testcafe';

fixture `Test`;

Selector(() => {}).with({ visibilityCheck: 42 });

test('yo', () => {
});
