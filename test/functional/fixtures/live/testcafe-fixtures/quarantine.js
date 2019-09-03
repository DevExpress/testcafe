import helper from '../test-helper';

fixture `Live`
    .page `../pages/index.html`
    .afterEach(() => {
        helper.attempts++;
    })
    .after(() => {
        helper.emitter.emit('tests-completed');
    });

test('quarantine', async () => {
    throw new Error('error');
});
