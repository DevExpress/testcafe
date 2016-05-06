import { Hybrid } from 'testcafe';

fixture `Test`;

const select  = Hybrid(id => document.querySelector(id));
const getText = '42';

var selectYo = Hybrid(() => select('#yo'), { select, getText });

test('yo', () => {
});
