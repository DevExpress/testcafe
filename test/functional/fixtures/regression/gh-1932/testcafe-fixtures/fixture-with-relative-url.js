import { ClientFunction } from 'testcafe';
import { pathToFileURL, URL } from 'url';
import { join } from 'path';
import {
    FILE_PROTOCOL_URL,
    INDEX1_RELATIVE_URL,
    INDEX2_RELATIVE_URL,
    INDEX1_WITH_UPDIR_RELATIVE_URL,
} from '../constants.js';

const getLocation = ClientFunction(() => window.location.href);
const ABSOLUTE_BASE_PATH = pathToFileURL(join(FILE_PROTOCOL_URL, '/'));

fixture`GH-1932 - Fixture with relative page URL`
    .page`${ INDEX1_RELATIVE_URL }`;

test(`Fixture relative url is used`, async t => {
    const finalUrl = new URL(INDEX1_RELATIVE_URL, ABSOLUTE_BASE_PATH).toString();

    await t.expect(getLocation()).eql(finalUrl);
});

test.page(INDEX2_RELATIVE_URL)(`Test page URL is relative`, async t => {
    const finalUrl = new URL(INDEX2_RELATIVE_URL, ABSOLUTE_BASE_PATH).toString();

    await t.expect(getLocation()).eql(finalUrl);
});

test.page(INDEX1_WITH_UPDIR_RELATIVE_URL)(`Test page URL is relative with UpDir symbol`, async t => {
    const finalUrl = new URL(INDEX1_WITH_UPDIR_RELATIVE_URL, ABSOLUTE_BASE_PATH).toString();

    await t.expect(getLocation()).eql(finalUrl);
});
