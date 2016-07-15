import { ClientFunction } from 'testcafe';

fixture `Test`;

var selectYo = ClientFunction(() => document.querySelector('#yo'), { dependencies: '42' });

test('yo', () => {
});
