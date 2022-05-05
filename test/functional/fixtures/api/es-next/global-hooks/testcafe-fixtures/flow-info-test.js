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
    ('Test', async () => {
        flowInfoStorage.safeAdd('test body');
    });
