import { ClientFunction } from 'testcafe';

fixture `Test`;

const select  = ClientFunction(id => document.querySelector(id));
const getText = '42';

var selectYo = ClientFunction(() => select('#yo'), { select, getText });

test('yo', () => {
});
