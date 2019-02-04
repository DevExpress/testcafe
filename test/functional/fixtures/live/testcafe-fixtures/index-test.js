import helper from '../test-helper';

fixture `Live`
    .page `../pages/index.html`
    .afterEach(() => {
        helper.counter++;
    })
    .after(() => {
        helper.watcher.emit('test-complete');
    });

test('First', async t => {
    await t.click('body');
});

test('Second', async t => {
    await t.click('body');
});
