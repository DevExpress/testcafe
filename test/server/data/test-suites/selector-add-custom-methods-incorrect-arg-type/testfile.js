import { Selector } from 'testcafe';

fixture `Test`;
Selector('span').addCustomMethods({a: () => {}});
Selector('span').addCustomMethods(42);

test('yo', () => {
});
