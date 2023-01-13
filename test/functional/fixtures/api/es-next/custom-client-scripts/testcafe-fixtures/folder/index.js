import { getFlag1 } from '../../common/index.js';

fixture `Fixture`
    .clientScripts('script.js');

test('test', async t => {
    await t.expect(getFlag1()).ok();
});
