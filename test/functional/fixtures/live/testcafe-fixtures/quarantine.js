import helper from '../test-helper';

fixture `Live`
    .page `../pages/index.html`
    .afterEach(() => {
        helper.attempts++;
    })
    .after(() => {
        helper.watcher.emit('test-complete');
    });

test('quarantine', async () => {
    throw new Error('error');
});
