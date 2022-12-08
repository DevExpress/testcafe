import unhandledRejection from '../unhandled-rejection.js';

fixture `Should fail on unhandled promise rejection`
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
