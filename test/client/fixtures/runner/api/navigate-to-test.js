var hammerhead = window.getTestCafeModule('hammerhead');

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var actionsAPI     = testCafeRunner.get('./api/actions');
var StepIterator   = testCafeRunner.get('./step-iterator');


var stepIterator = new StepIterator();
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
    }
);
