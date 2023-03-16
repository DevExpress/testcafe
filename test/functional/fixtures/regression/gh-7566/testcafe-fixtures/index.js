fixture `Should has the 'which' property equal to '0' for move events`
    .page `http://localhost:3000/fixtures/regression/gh-7566/pages/index.html`;

test(`Should has the "which" property equal to "0" for move events`, async t => {
    await t.click('#btn1');
    await t.click('#btn2');

    const log = await t.eval(() => Object.keys(window.log));

    await t.expect(log).eql([
        'mouseover:0',
        'mouseenter:0',
        'mousemove:0',
        'mousedown:1',
        'mouseup:1',
        'click:1',
        'mouseout:0',
        'mouseleave:0',
    ]);
});

