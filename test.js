import { Selector } from 'testcafe';

fixture `f`
    .page `http://testcafe.io`;

test.disableNativeAutomation('t1', async t => {
    const link = Selector('a').withText('Studio');

    await t.click(link);
});
