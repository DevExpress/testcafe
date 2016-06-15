import { Selector } from 'testcafe';

fixture `Test`;

Selector(() => {}).with({ timeout: -5 });

test('yo', () => {
});
