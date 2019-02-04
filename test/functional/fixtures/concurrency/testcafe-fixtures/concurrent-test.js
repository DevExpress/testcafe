fixture `Concurrent`.page`../pages/index.html`;

global.timeline = [];

test('Long test', async t => {
    global.timeline.push('long started');

    await t.wait(10000);

    global.timeline.push('long finished');
});

test('Short test', async t => {
    global.timeline.push('short started');

    await t.wait(1000);

    global.timeline.push('short finished');
});
