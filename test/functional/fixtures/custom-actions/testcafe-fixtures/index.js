import { Selector } from 'testcafe';

fixture`Custom Actions`
    .page`http://localhost:3000/fixtures/custom-actions/pages/index.html`;

test('Should run custom click action', async t => {
    await t.customActions.clickBySelector('#button1');
});

test('Should return value from custom action', async t => {
    const before  = await t.customActions.getSpanTextBySelector('#result1');
    const after = await t.customActions.clickBySelector('#button1')
        .customActions.getSpanTextBySelector('#result1');

    await t.expect(before).eql('').expect(after).eql('OK');
});

test('Should chain multiple actions', async t => {
    await t.customActions.typeTextAndClickButton('#input1', '#button2', 'Some text')
        .expect(Selector('#result2').innerText).eql('Some text');
});

test('Should run custom action inside another custom action', async t => {
    await t.customActions.typeToInputAndCheckResult('#input1', '#button2', '#result2', 'Some text');
});

test('Should run non-async custom action', async t => {
    const result = await t.customActions.getTextValue();

    await t.expect(result).eql('some text');
});

test('Should throw an exception inside custom action', async t => {
    await t.customActions.clickBySelector('blablabla');
});
