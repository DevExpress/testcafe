const { EOL }           = require('os');
const { expect }        = require('chai');
const proxyquire        = require('proxyquire');
const consoleWrapper    = require('./helpers/console-wrapper');


describe('Promo messages', () => {
    before(() => {
        consoleWrapper.init();
        consoleWrapper.wrap();
    });

    beforeEach(() => {
        consoleWrapper.messages.clear();
    });

    after(() => {
        consoleWrapper.unwrap();
    });

    it('Should display an appropriate promo message', async () => {
        const marketingTest = require('../../lib/marketing');

        const runsCount = 50;

        const runNumberHistory = [];
        let messageLog         = '';

        await marketingTest._dataFile._remove();

        for (let i = 1; i <= runsCount; i++) {
            await marketingTest.showMessageWithLinkToTestCafeStudio();

            if (consoleWrapper.messages.log) {
                messageLog += consoleWrapper.messages.log;

                runNumberHistory.push(i);
                consoleWrapper.messages.clear();
            }
        }

        expect(runNumberHistory).deep.equal([1, 10, 20, 30, 40, 50]);

        expect(messageLog).contains(
            EOL + 'You can stop writing and start recording. Check out our commercial testing platform – now with a fully integrated visual test recorder: https://devexpress.com/testcafe-studio' +
            EOL + 'Support open source – Help us spread the word about TestCafe Studio – IDE with a fully integrated visual test recorder: https://devexpress.com/test-cafe-studio' +
            EOL + 'Does your QA team hate writing test scripts? Check out TestCafe Studio – now with an easy-to-use visual test recorder: https://devexpress.com/testcafe/studio' +
            EOL + 'You can stop writing and start recording. Check out our commercial testing platform – now with a fully integrated visual test recorder: https://devexpress.com/testcafe-studio'
        );
    });

    it('Should have uniform distribution of the first displayed message', async () => {
        const marketingTest = proxyquire('../../lib/marketing', {
            './data-file': class {
                async load () {
                    return {
                        runCount:              0,
                        displayedMessageIndex: void 0
                    };
                }

                async save () {

                }
            }
        });

        const attemptsCount = 100000;
        const accuracy      = 100;

        const messageStats = {};

        for (let i = 0; i < attemptsCount; i++) {
            await marketingTest.showMessageWithLinkToTestCafeStudio();

            const message = consoleWrapper.messages.log;

            if (!messageStats[message])
                messageStats[message] = 0;

            messageStats[message]++;
        }

        Object.keys(messageStats).forEach(message => {
            messageStats[message] = Math.floor(messageStats[message] / attemptsCount * accuracy);
        });

        const messageRates = Object.values(messageStats);

        expect(messageRates).to.deep.equal([33, 33, 33]);
    });
});

