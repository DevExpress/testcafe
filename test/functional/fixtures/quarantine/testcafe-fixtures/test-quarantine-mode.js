import quarantineScope from './quarantineScope';


// NOTE: to preserve callsites, add new tests AFTER the existing ones
fixture `Test Quarantine Mode`
    .page `../pages/index.html`
    .after(() => {
        quarantineScope['attempt'] = {};
    });

test('Failing test, in quarantine mode', async t => {
    await t.click('.notExist');
});

test('Check for unstable test', async () => {
    quarantineScope['attempt'] = quarantineScope['attempt'] || {};
    const attemptNumber = quarantineScope['attempt'].attemptNumber || 0;

    quarantineScope['attempt'].attemptNumber = attemptNumber + 1;
    if (attemptNumber % 2 === 0) throw new Error('Quarantine error');
});

test('Another unstable test', async () => {
    quarantineScope['attempt'] = quarantineScope['attempt'] || {};
    const attemptNumber = quarantineScope['attempt'].attemptNumber || 0;

    quarantineScope['attempt'].attemptNumber = attemptNumber + 1;

    if (attemptNumber === 0 || attemptNumber > 2)
        throw new Error('Quarantine error');
});
