import { Selector } from 'testcafe';

fixture`Custom Actions`
    .page`http://localhost:3000/fixtures/custom-actions/pages/index.html`;

test('Should run custom click action', async t => {
    await t.custom.clickBySelector('#button1');
});

test('Should return value from custom action', async t => {
    const before  = await t.custom.getSpanTextBySelector('#result1');
    const after = await t.custom.clickBySelector('#button1')
        .custom.getSpanTextBySelector('#result1');

    await t.expect(before).eql('').expect(after).eql('OK');
});

test('Should chain multiple actions', async t => {
    await t.custom.typeTextAndClickButton('#input1', '#button2', 'Some text')
        .expect(Selector('#result2').innerText).eql('Some text');
});

test('Should run custom action inside another custom action', async t => {
    await t.custom.typeToInputAndCheckResult('#input1', '#button2', '#result2', 'Some text');
});

test('Should throw an exception inside custom action', async t => {
    await t.custom.clickBySelector('blablabla');
});
