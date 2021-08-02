fixture `Should not throw error on \`tab\` action when cross-domain iframe presents on page`
    .page `http://localhost:3000/fixtures/regression/gh-6405/pages/index.html`;

test(`press tab`, async t => {
    await t.pressKey('tab');
});
