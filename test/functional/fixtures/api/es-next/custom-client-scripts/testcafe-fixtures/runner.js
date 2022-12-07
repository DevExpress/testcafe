import { getFlag1 } from '../helpers/index.js';

fixture `Fixture`;

test('test', async t => {
    await t.expect(getFlag1()).ok();
});
