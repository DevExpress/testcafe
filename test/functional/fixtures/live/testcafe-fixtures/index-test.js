import helper from '../test-helper';

fixture `Live`
    .page `../pages/index.html`
    .afterEach(() => {
        helper.counter++;
    })
    .after(() => {
        helper.watcher.emit('test-complete');
    });

for (let i = 0; i < helper.testCount; i++) {
    test(`${i}`, async () => {
    });
}
