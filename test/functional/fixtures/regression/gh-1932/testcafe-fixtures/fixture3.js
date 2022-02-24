import {ClientFunction} from 'testcafe';
import { pathToFileURL, URL } from 'url';
import {
    ABSOLUTE_BASE_URL,
    INDEX1_RELATIVE_URL,
    INDEX2_RELATIVE_URL,
    INDEX1_WITH_UPDIR_RELATIVE_URL
} from '../constants';

const getLocation = ClientFunction(() => window.location.href);
const ABSOLUTE_BASE_PATH = pathToFileURL(ABSOLUTE_BASE_URL.replace(/\/?$/, '/'));

fixture`GH-1932 - Global Start URL Option - 3`
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
