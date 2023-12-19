import testFunction from "../imports/script";

fixture `[Regression](GH-8091)`

test('simple test', async t => {
    const test = await testFunction();
    
    await t.expect(test).eql(true);
})