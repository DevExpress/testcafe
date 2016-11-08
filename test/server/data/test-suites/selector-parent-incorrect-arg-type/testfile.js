import { Selector } from 'testcafe';

fixture `Test`;
Selector('span').parent();
Selector('span').parent({});

test('yo', () => {
});
