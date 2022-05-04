import flowInfoStorage from '../utils/flow-info-storage.js';

fixture ('Fixture')
    .before(async function () {
        flowInfoStorage.add('localFixtureBefore');
    })
    .after(async function () {
        flowInfoStorage.add('localFixtureAfter');
    });

test
    .before(async function () {
        flowInfoStorage.add('localTestBefore');
    })
    .after(async function () {
        flowInfoStorage.add('localTestAfter');
    })
    ('Test', async () => {
        flowInfoStorage.add('test body');
    });
