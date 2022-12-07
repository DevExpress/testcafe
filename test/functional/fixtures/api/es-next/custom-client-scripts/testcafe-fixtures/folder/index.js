import { getFlag1 } from '../../helpers/index.js';

fixture `Fixture`
    .clientScripts('script.js');

test('test', async t => {
    await t.expect(getFlag1()).ok();
});
