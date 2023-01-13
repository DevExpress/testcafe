import { ClientFunction } from 'testcafe';
import { INDEX1_URL, INDEX2_URL } from '../constants.js';

const getLocation = ClientFunction(() => window.location.href);

fixture`GH-1932 - Fixture without page url`;

test(`Test page URL is not specified`, async t => {
    await t.expect(getLocation()).eql(INDEX1_URL);
});

test.page(INDEX2_URL)(`Test page URL is specified`, async t => {
    await t.expect(getLocation()).eql(INDEX2_URL);
});
