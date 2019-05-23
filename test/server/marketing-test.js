const { EOL }    = require('os');
const { expect } = require('chai');
const proxyquire = require('proxyquire');


describe('Promo messages', () => {
    it('Should display an appropriate promo message', async () => {
        const runsCount = 50;

        const runNumberHistory = [];
        let messageLog         = '';
        let currentRun         = 0;

        const marketingTest = proxyquire('../../lib/marketing', {
            '../cli/log': {
                write (data) {
                    messageLog += data;

                    runNumberHistory.push(currentRun);
                }
            }
        });

        await marketingTest._dataFile._remove();

        for (currentRun = 1; currentRun <= runsCount; currentRun++)
            await marketingTest.showMessageWithLinkToTestCafeStudio();

        expect(runNumberHistory).deep.equal([1, 10, 20, 30, 40, 50]);

        expect(messageLog).contains(
            EOL + 'You can stop writing and start recording. Check out our commercial testing platform – now with a fully integrated visual test recorder: https://devexpress.com/testcafe-studio' +
            EOL + 'Support open source – Help us spread the word about TestCafe Studio – IDE with a fully integrated visual test recorder: https://devexpress.com/test-cafe-studio' +
            EOL + 'Does your QA team hate writing test scripts? Check out TestCafe Studio – now with an easy-to-use visual test recorder: https://devexpress.com/testcafe/studio' +
            EOL + 'You can stop writing and start recording. Check out our commercial testing platform – now with a fully integrated visual test recorder: https://devexpress.com/testcafe-studio'
        );
    });

    it('Should have uniform distribution of the first displayed message', async () => {
        const attemptsCount = 100000;
        const accuracy      = 100;

        const messageStats = {};

        const marketingTest = proxyquire('../../lib/marketing', {
            '../cli/log': {
                write (data) {
                    if (!messageStats[data])
                        messageStats[data] = 0;

                    messageStats[data]++;
                }
            },

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

        for (let i = 0; i < attemptsCount; i++)
            await marketingTest.showMessageWithLinkToTestCafeStudio();

        Object.keys(messageStats).forEach(message => {
            messageStats[message] = Math.floor(messageStats[message] / attemptsCount * accuracy);
        });

        const messageRates = Object.values(messageStats);

        expect(messageRates).to.deep.equal([33, 33, 33]);
    });
});
