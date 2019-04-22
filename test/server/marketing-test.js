const { expect }     = require('chai');
const marketingTest  = require('../../lib/marketing');
const consoleWrapper = require('./helpers/console-wrapper');
const Promise        = require('pinkie');

it('Display an appropriate promo message', () => {
    consoleWrapper.init();
    consoleWrapper.wrap();

    const createShowMessageWithLinkPromiseChain =  () => {
        const promiseChain = Promise.resolve();

        for (let i = 0; i < 1; i++) {
            promiseChain.then(() => {
                return marketingTest.showMessageWithLinkToTestCafeStudio();
            });
        }

        return promiseChain;
    };

    return marketingTest._dataFile._remove()
        .then(() => {
            return createShowMessageWithLinkPromiseChain();
        })
        .then(() => {
            expect(consoleWrapper.messages.log).contains('');

            return createShowMessageWithLinkPromiseChain();
        })
        .then(() => {
            expect(consoleWrapper.messages.log).contains('');

            return createShowMessageWithLinkPromiseChain();
        })
        .then(() => {
            expect(consoleWrapper.messages.log).contains('');

            return createShowMessageWithLinkPromiseChain();
        })
        .then(() => {
            expect(consoleWrapper.messages.log).contains('');

            consoleWrapper.unwrap();
            consoleWrapper.messages.clear();
        });
});
