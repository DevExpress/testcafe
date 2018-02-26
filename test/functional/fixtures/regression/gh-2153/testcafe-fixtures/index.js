import { Selector } from 'testcafe';

fixture `GH-2153 - Shouldn't call document and window handlers extra times`
    .page `http://localhost:3000/fixtures/regression/gh-2153/pages/index.html`;

test(`Shouldn't call document and window handlers extra times`, async t => {
    const select  = Selector('#select');
    const option  = select.find('option').withText('Two');
    const counter = Selector('#logger');

    await t
        .click(select)
        .click(option)
        .expect(counter.innerText).eql('window|document|window|document|');
});
