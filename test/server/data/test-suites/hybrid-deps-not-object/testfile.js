import { Hybrid } from 'testcafe';

fixture `Test`;

var selectYo = Hybrid(() => document.querySelector('#yo'), '42');

test('yo', () => {
});
