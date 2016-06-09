import { ClientFunction } from 'testcafe';

fixture `Test`;

var selectYo = ClientFunction(() => document.querySelector('#yo'), '42');

test('yo', () => {
});
