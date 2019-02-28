import { expect } from 'chai';
import { ClientFunction } from 'testcafe';
import { saveWindowState, restoreWindowState } from '../../../../window-helpers';
import config from '../../../../config';


fixture `gh-913`
    .page `http://localhost:3000/fixtures/regression/gh-913/pages/index.html`;

const getWindowScrollTop = ClientFunction(() => window.pageYOffset);

test
    .before(async t => {
        if (!config.useLocalBrowsers)
            return;

        await saveWindowState(t);
        await t.maximizeWindow();
    })
    .after(async t => {
        if (!config.useLocalBrowsers)
            return;

        await restoreWindowState(t);
    })
    ("Shouldn't scroll to target parent while performing click", async t => {
        const oldWindowScrollValue = await getWindowScrollTop();

        await t.click('#child');

        const newWindowScrollValue = await getWindowScrollTop();

        expect(newWindowScrollValue).eql(oldWindowScrollValue);
    });
