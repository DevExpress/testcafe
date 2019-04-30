const { expect }     = require('chai');
const marketingTest  = require('../../lib/marketing');
const consoleWrapper = require('./helpers/console-wrapper');
const Promise        = require('pinkie');
const { EOL }        = require('os');

it('Display an appropriate promo message', () => {
    const createShowMessagePromise = (runNumber) => {
        runNumber = runNumber || marketingTest.NUMBER_RUNS_BETWEEN_SHOW_MESSAGE;

        let chain = Promise.resolve();

        for (let i = 0; i < runNumber; i++) {
            chain = chain.then(() => {
                return marketingTest.showMessageWithLinkToTestCafeStudio();
            });
        }

        return chain;
    };

    return marketingTest._dataFile._remove()
        .then(() => {
            consoleWrapper.init();
            consoleWrapper.wrap();

            return createShowMessagePromise(1);
        })
        .then(() => {
            expect(consoleWrapper.messages.log).contains(EOL + 'You can stop writing and start recording. Check out');

            return createShowMessagePromise();
        })
        .then(() => {
            expect(consoleWrapper.messages.log).contains(EOL + 'Support open source – Help us spread the word');

            return createShowMessagePromise();
        })
        .then(() => {
            expect(consoleWrapper.messages.log).contains(EOL + 'Does your QA team hate writing test scripts?');

            return createShowMessagePromise();
        })
        .then(() => {
            expect(consoleWrapper.messages.log).contains(EOL + 'You can stop writing and start recording. Check out');

            consoleWrapper.unwrap();
            consoleWrapper.messages.clear();
        });
});
