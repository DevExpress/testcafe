import { Selector } from 'testcafe';

fixture `Test`;
Selector('span').addCustomDOMProperties({a: () => {}});
Selector('span').addCustomDOMProperties(42);

test('yo', () => {
});
