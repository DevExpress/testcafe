import unhandledRejection from '../unhandled-rejection';

fixture `Should fail on unhandled promise rejection`
    .page `http://localhost:3000/fixtures/regression/gh-2546/pages/index.html`
    .after(() => {
        unhandledRejection.save();
        unhandledRejection.clear();
    });

process.on('unhandledRejection', e => {
    unhandledRejection.add(e.message);
});

test('Unhandled promise rejection', async t => {
    await t.wait(0);

    /* eslint-disable no-new */
    new Promise((resolve, reject) => {
        reject(new Error('reject'));
    });
    /* eslint-enable no-new */
});
