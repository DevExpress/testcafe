import delay from '../../../../../../../src/utils/delay';
import timeLimit from 'time-limit-promise';

var hooksExecuted = {
    fixture1Before: 0,
    fixture1After:  0,
    fixture2Before: 0
};

fixture `Fixture 1`
    .before(async () => {
        await delay(100);

        hooksExecuted.fixture1Before++;
    })
    .after(async () => {
        await delay(100);

        hooksExecuted.fixture1After++;
    });

test('Test1', async t => {
    await t
        .expect(hooksExecuted.fixture1Before).eql(1)
        .expect(hooksExecuted.fixture1After).eql(0);
});

test('Test2', async t => {
    await t
        .expect(hooksExecuted.fixture1Before).eql(1)
        .expect(hooksExecuted.fixture1After).eql(0);
});

fixture `Fixture2`
    .before(async () => {
        hooksExecuted.fixture2Before++;
    });

test('Test3', async t => {
    await t
        .expect(hooksExecuted.fixture1Before).eql(1)
        .expect(hooksExecuted.fixture2Before).eql(1);

    // NOTE: after hook for first fixture runs in parallel with test,
    // so we just expect it to be executed eventually at some point.
    async function check () {
        if (hooksExecuted.fixture1After !== 1) {
            await delay(1000);
            await check();
        }
    }

    await timeLimit(check(), 3000, { rejectWith: new Error('Fixture1 after hook is not executed') });
});

fixture `Fixture3`
    .before(() => {
        throw new Error('Should be unreachable');
    })
    .after(() => {
        throw new Error('Should be unreachable');
    });

test.skip('Test4', () => {
    throw new Error('Should be unreachable');
});
