import { Selector } from 'testcafe';

fixture `Test`;
Selector('span').nextSibling();
Selector('span').nextSibling({});

test('yo', () => {
});
