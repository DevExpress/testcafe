import { ClientFunction } from 'testcafe';

fixture `Test`;

var selectYo = ClientFunction(() => document.querySelector('#yo'), { scopeVars: '42' });

test('yo', () => {
});
