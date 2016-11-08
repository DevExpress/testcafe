import { Selector } from 'testcafe';

fixture `Test`;
Selector('span').child();
Selector('span').child({});

test('yo', () => {
});
