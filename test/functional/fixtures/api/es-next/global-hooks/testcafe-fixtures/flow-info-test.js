import flowInfoStorage from '../utils/flow-info-storage.js';

fixture ('Fixture')
    .before(async function () {
        flowInfoStorage.safeAdd('localFixtureBefore');
    })
    .after(async function () {
        flowInfoStorage.safeAdd('localFixtureAfter');
    });

test
    .before(async function () {
        flowInfoStorage.safeAdd('localTestBefore');
    })
    .after(async function () {
        flowInfoStorage.safeAdd('localTestAfter');
    })
    ('Test with local hooks', async () => {
        flowInfoStorage.safeAdd('test body');
    });

fixture ('Fixture')
    .before(async function () {
        flowInfoStorage.safeAdd('localFixtureBefore');
    })
    .after(async function () {
        flowInfoStorage.safeAdd('localFixtureAfter');
    })
    .beforeEach(async function () {
        flowInfoStorage.safeAdd('eachTestBefore');
    })
    .afterEach(async function () {
        flowInfoStorage.safeAdd('eachTestAfter');
    });

test('Test with each hooks', async () => {
    flowInfoStorage.safeAdd('test body');
});

fixture ('Fixture')
    .before(async function () {
        flowInfoStorage.safeAdd('localFixtureBefore');
    })
    .after(async function () {
        flowInfoStorage.safeAdd('localFixtureAfter');
    })
    .beforeEach(async function () {
        flowInfoStorage.safeAdd('eachTestBefore');
    })
    .afterEach(async function () {
        flowInfoStorage.safeAdd('eachTestAfter');
    });

test
    .before(async function () {
        flowInfoStorage.safeAdd('localTestBefore');
    })
    .after(async function () {
        flowInfoStorage.safeAdd('localTestAfter');
    })
    ('Test with all hooks', async () => {
        flowInfoStorage.safeAdd('test body');
    });
