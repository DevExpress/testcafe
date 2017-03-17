import { Selector } from 'testcafe';

fixture `Test`;
Selector('rect').addCustomDOMProperties({ prop1: 1, prop2: () => 42 });

test('yo', () => {
});
