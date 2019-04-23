const { expect }     = require('chai');
const marketingTest  = require('../../lib/marketing');
const consoleWrapper = require('./helpers/console-wrapper');
const Promise        = require('pinkie');

it('Display an appropriate promo message', () => {
    const createShowMessagePromise = () => {
        let chain = Promise.resolve();

        for (let i = 0; i < marketingTest.NUMBER_RUNS_BETWEEN_SHOW_MESSAGE; i++)
            chain = chain.then(() => {
                return marketingTest.showMessageWithLinkToTestCafeStudio();
            });

        return chain;
    };

    return marketingTest._dataFile._remove()
        .then(() => {
            consoleWrapper.init();
            consoleWrapper.wrap();

            return createShowMessagePromise();
        })
        .then(() => {
            expect(consoleWrapper.messages.log).contains('Learn how to improve your testing experience with');

            return createShowMessagePromise();
        })
        .then(() => {
            expect(consoleWrapper.messages.log).contains('Support open source - check Test Cafe Studio edition with');

            return createShowMessagePromise();
        })
        .then(() => {
            expect(consoleWrapper.messages.log).contains('Share with your QA Team how to visually record');

            return createShowMessagePromise();
        })
        .then(() => {
            expect(consoleWrapper.messages.log).contains('Learn how to improve your testing experience with');

            consoleWrapper.unwrap();
            consoleWrapper.messages.clear();
        });
});
