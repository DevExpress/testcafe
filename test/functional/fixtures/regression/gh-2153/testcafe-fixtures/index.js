import { Selector } from 'testcafe';

fixture `GH-2153 - Shadow element should not appear in user event handler`
    .page `http://localhost:3000/fixtures/regression/gh-2153/pages/index.html`;

test(`Shadow element should not appear in user event handler`, async t => {
    const select  = Selector('#select');
    const option  = select.find('option').withText('Two');

    await t
        .click(select)
        .click(option);
});
