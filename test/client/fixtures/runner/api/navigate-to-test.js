var hammerhead     = window.getTestCafeModule('hammerhead');
var jsProcessor    = hammerhead.jsProcessor;

var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var actionsAPI     = testCafeRunner.get('./api/actions');
var StepIterator   = testCafeRunner.get('./step-iterator');


var stepIterator = new StepIterator();
actionsAPI.init(stepIterator);

$(document).ready(function () {

        var asyncActionCallback,

            runAsyncTest = function (actions, assertions, timeout) {
                var callbackFunction = function () {
                    clearTimeout(timeoutId);
                    assertions();
                    start();
                };
                asyncActionCallback  = function () {
                    callbackFunction();
                };
                actions();
                var timeoutId        = setTimeout(function () {
                    callbackFunction = function () {
                    };
                    ok(false, 'Timeout is exceeded');
                    start();
                }, timeout);
            };

        StepIterator.prototype.asyncAction = function (action) {
            action(asyncActionCallback);
        };


        asyncTest('navigate to given url', function () {
            var savedSetProperty = window[jsProcessor.SET_PROPERTY_METH_NAME],
                locationValue    = null;

            window[jsProcessor.SET_PROPERTY_METH_NAME] = function (owner, propName, value) {
                if (owner === window && propName === 'location')
                    locationValue = value;
            };

            runAsyncTest(
                function () {
                    actionsAPI.navigateTo('http://my.site.url');
                },
                function () {
                    window[jsProcessor.SET_PROPERTY_METH_NAME] = savedSetProperty;
                    strictEqual(locationValue, 'http://my.site.url');
                },
                2000
            );
        });
    }
);
