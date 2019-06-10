import { getFlag1 } from '../helpers';

fixture `Fixture`;

test('test', async t => {
    await t.expect(getFlag1()).ok();
});
