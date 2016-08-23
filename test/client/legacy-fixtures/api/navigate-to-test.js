var hammerhead = window.getTestCafeModule('hammerhead');

var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
var actionsAPI           = testCafeLegacyRunner.get('./api/actions');
var StepIterator         = testCafeLegacyRunner.get('./step-iterator');
var initAutomation       = testCafeLegacyRunner.get('./init-automation');

var stepIterator = new StepIterator();

initAutomation();
actionsAPI.init(stepIterator);

$(document).ready(function () {
    asyncTest('navigate to given url', function () {
        var locationValue = null;

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
