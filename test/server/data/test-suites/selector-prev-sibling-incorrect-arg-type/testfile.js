import { Selector } from 'testcafe';

fixture `Test`;
Selector('span').prevSibling();
Selector('span').prevSibling({});

test('yo', () => {
});
