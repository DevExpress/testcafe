const { expect }         = require('chai');
const path               = require('path');
const createTestCafe     = require('../../../../../lib');
const config             = require('../../../config.js');
const delay              = require('../../../../../lib/utils/delay');
const { createReporter } = require('../../../utils/reporter');

let cafe   = null;
let runner = null;
const log  = [];

const expectedLog = [
    'Fixture 1',
    ...new Array(10).fill('Test 1'),
    'Fixture 2',
    ...new Array(10).fill('Test 2'),
    'Fixture 3',
    ...new Array(10).fill('Test 3'),
];

async function sleep () {
    return delay(100);
}

const reporter = createReporter({
    async reportFixtureStart (name) {
        log.push(name);

        await sleep();
    },
    async reportTestStart (name) {
        log.push(name);

        await sleep();
    },
    async reportTestDone (name) {
        log.push(name);

        await sleep();
    }
});

if (config.useLocalBrowsers && !config.useHeadlessBrowsers) {
    describe('[Regression](GH-4787) - Should wait for last report before new fixture starts', function () {
        it('Should wait for last report before new fixture starts', function () {
            return createTestCafe('127.0.0.1', 1335, 1336)
                .then(testcafe => {
                    runner = testcafe.createRunner();
                    cafe   = testcafe;
                })
                .then(() => {
                    return runner
                        .src(path.join(__dirname, './testcafe-fixtures/index.js'))
                        .browsers(['chrome', 'firefox'])
                        .reporter(reporter)
                        .run();
                })
                .then(() => {
                    return cafe.close();
                })
                .then(() => {
                    expect(log).eql(expectedLog);
                });
        });
    });
}
