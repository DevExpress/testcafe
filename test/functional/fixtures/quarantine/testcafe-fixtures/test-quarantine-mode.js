import quarantineScope from './quarantineScope';


fixture `Test Quarantine Mode`
    .page `http://localhost:3000/fixtures/quarantine/pages/index.html`;

test('Failing test, in quarantine mode', async () => {
    throw new Error('Quarantine error');
});

test('Check for unstable test', async t => {
    const key = t.testRun.test.name + t.browser.name;

    quarantineScope[key] = quarantineScope[key] || {};

    const attemptNumber = quarantineScope[key].attemptNumber || 0;

    quarantineScope[key].attemptNumber = attemptNumber + 1;

    if (attemptNumber < 2)
        throw new Error('Quarantine error');
});

test('Another unstable test', async t => {
    const key = t.testRun.test.name + t.browser.name;

    quarantineScope[key] = quarantineScope[key] || {};

    const attemptNumber = quarantineScope[key].attemptNumber || 0;

    quarantineScope[key].attemptNumber = attemptNumber + 1;

    if (attemptNumber === 0 || attemptNumber > 2)
        throw new Error('Quarantine error');
});
