import helper from '../test-helper';

fixture `Live`
    .page `../pages/index.html`
    .afterEach(() => {
        helper.counter++;
    })
    .after(() => {
        helper.emitter.emit('tests-completed');
    });

for (let i = 0; i < helper.testCount; i++) {
    test(`${i}`, async () => {
    });
}
