import { getFlag1, getFlag2 } from '../helpers';

fixture `Fixture`
    .clientScripts('test/functional/fixtures/api/es-next/custom-client-scripts/data/set-flag1.js');

test
    .clientScripts({ content: 'window.flag2 = true; ' })
    ('test', async t => {
        await t
            .expect(getFlag1()).ok()
            .expect(getFlag2()).ok();
    });
