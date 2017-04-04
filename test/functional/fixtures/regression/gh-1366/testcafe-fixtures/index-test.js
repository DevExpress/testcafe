import { ClientFunction } from 'testcafe';

fixture `test`
    .page`http://localhost:3000/fixtures/regression/gh-1366/pages/index.html`;


const getSelectValue = ClientFunction(() => window.selectValue);

test(`choose value`, async t => {
    await t
        .click('select')
        .click('option[value=Nissan]')
        .expect(getSelectValue()).eql('Nissan');
});
