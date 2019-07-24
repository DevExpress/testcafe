import { getFlag1 } from '../helpers';

fixture `Fixture`;

test('test', async t => {
    await t
        .expect(getFlag1()).notOk()
        .navigateTo('http://localhost:3000/fixtures/api/es-next/custom-client-scripts/pages/index.html')
        .expect(getFlag1()).ok();
});
