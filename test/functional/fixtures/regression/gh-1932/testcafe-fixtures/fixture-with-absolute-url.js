import { ClientFunction } from 'testcafe';
import {
    INDEX1_WITH_UPDIR_RELATIVE_URL,
    INDEX1_URL,
    INDEX2_RELATIVE_URL,
    INDEX2_URL,
} from '../constants.js';

const getLocation = ClientFunction(() => window.location.href);

fixture`GH-1932 - Fixture with absolute page URL`
    .page`${INDEX1_URL}`;

test(`Fixture page URL is used`, async t => {
    await t.expect(getLocation()).eql(INDEX1_URL);
});

test.page(INDEX2_RELATIVE_URL)(`Test page URL is relative`, async t => {
    await t.expect(getLocation()).eql(INDEX2_URL);
});

test.page(INDEX1_WITH_UPDIR_RELATIVE_URL)(`Test page URL is relative with UpDir symbol`, async t => {
    await t.expect(getLocation()).eql(INDEX1_URL);
});
