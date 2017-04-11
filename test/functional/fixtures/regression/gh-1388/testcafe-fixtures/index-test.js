fixture `gh-1388`
    .page `http://localhost:3000/fixtures/regression/gh-1388/pages/index.html`;

test('Press keys in a textarea', async t => {
    await t
        .click('#textarea', { caretPos: 0 })
        .pressKey('space enter backspace home delete');

    const selectionLog = await t.eval(() => window.selectionLog);

    await t.expect(selectionLog).eql([1, 2, 1, 0]);
});
