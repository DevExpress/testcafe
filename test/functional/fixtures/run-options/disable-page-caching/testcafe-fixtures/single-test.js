import { role, url, expectedRoleLastPageLocation } from '../common/index';

fixture `Fixture`;

test
    .disablePageCaching
    .page(url)
    .before(async t => {
        await t.useRole(role);
    })
    ('test', async t => {
        await t.expect(role.lastPageLocation).eql(expectedRoleLastPageLocation);
    });

