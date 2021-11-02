fixture `GH-2846`;

test(`Debug`, async t => {
    await t.debug();

    // NOTE: for https://github.com/DevExpress/testcafe/issues/6605
    await t.wait(1);
});
