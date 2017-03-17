import { Selector } from 'testcafe';

fixture `Test`;
Selector('span').addCustomMethods({ prop1: 1, prop2: () => 42 });

test('yo', () => {
});
