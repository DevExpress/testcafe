import helper from '../test-helper';

fixture `Stops and starts 2`
    .page `../pages/index.html`
    .after(() => {
        helper.emitter.emit('tests-completed');
    });

test('Stops and starts 2', async t => {
    for (let i = 0; i < 10; i++)
        await t.click('h1');
});
