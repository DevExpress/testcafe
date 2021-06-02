fixture `Debug`
    .page `http://localhost:3000/fixtures/api/es-next/click/pages/index.html`;

test(`JS Debugger`, async t => {
    // eslint-disable-next-line no-debugger
    debugger;

    await t.debug();
});
