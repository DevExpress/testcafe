import { watcher } from '../test-watcher';

fixture `Live`
    .page `../pages/index.html`;

test('First', async () => {
}).after(() => {
    watcher.emit('test-complete');
});
