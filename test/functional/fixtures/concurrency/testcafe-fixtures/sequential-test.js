fixture `Sequential`.page`../pages/index.html`;

const timeline = [];

test('Long test', async t => {
    timeline.push('long started');

    await t.wait(5000);

    timeline.push('long finished');
});

test('Short test', async t => {
    timeline.push('short started');

    await t.wait(1000);

    timeline.push('short finished');
});

test('Results', async t => {
    await t.expect(timeline).eql(['long started', 'long finished', 'short started', 'short finished']);
});
