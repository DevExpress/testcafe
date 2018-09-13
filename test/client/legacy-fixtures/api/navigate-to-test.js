const hammerhead = window.getTestCafeModule('hammerhead');

const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const actionsAPI           = testCafeLegacyRunner.get('./api/actions');
const StepIterator         = testCafeLegacyRunner.get('./step-iterator');
const initAutomation       = testCafeLegacyRunner.get('./init-automation');

const stepIterator = new StepIterator();

initAutomation();
actionsAPI.init(stepIterator);

$(document).ready(function () {
    asyncTest('navigate to given url', function () {
        let locationValue = null;

        hammerhead.navigateTo = function (url) {
            locationValue = url;
        };

        actionsAPI.navigateTo('http://my.site.url');

        window.setTimeout(function () {
            strictEqual(locationValue, 'http://my.site.url');
            start();
        }, 1000);
    });
});
