import { Selector } from 'testcafe';

fixture `Test`;
Selector('span').sibling();
Selector('span').sibling({});

test('yo', () => {
});
