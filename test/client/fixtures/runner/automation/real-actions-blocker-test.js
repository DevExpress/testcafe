var hammerhead    = window.getTestCafeModule('hammerhead');
var nativeMethods = hammerhead.nativeMethods;

var testCafeRunner  = window.getTestCafeModule('testCafeRunner');
var automation      = testCafeRunner.get('./automation/automation');
var MouseOptions    = testCafeRunner.get('./automation/options').MouseOptions;
var ClickOptions    = testCafeRunner.get('./automation/options').ClickOptions;
var HoverAutomation = testCafeRunner.get('./automation/playback/hover');
var ClickAutomation = testCafeRunner.get('./automation/playback/click');
var mouseUtils      = testCafeRunner.get('./utils/mouse');

automation.init();

$(document).ready(function () {
    var TEST_ELEMENT_CLASS = 'TestCafe-testElement';

    var createDiv = function (x, y, doc) {
        var div = doc.createElement('div');

        div.style.position = 'absolute';
        div.style.left     = x + 'px';
        div.style.top      = y + 'px';
        div.style.border   = '1px solid black';
        div.style.width    = '50px';
        div.style.height   = '50px';

        div.className = TEST_ELEMENT_CLASS;

        doc.body.appendChild(div);

        return div;
    };

    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    });

    asyncTest('prevent real mouse event', function () {
        var div1               = createDiv(0, 0, document),
            div2               = createDiv(250, 250, document),

            documentClickCount = 0;

        nativeMethods.addEventListener.call(document, 'click', function () {
            documentClickCount++;
        }, true);

        window.async.series({
            moveToFirstElement: function (callback) {
                var offsets      = mouseUtils.getOffsetOptions(div1);
                var hoverOptions = new MouseOptions({
                    offsetX: offsets.offsetX,
                    offsetY: offsets.offsetY
                });

                var hoverAutomation = new HoverAutomation(div1, hoverOptions);

                hoverAutomation
                    .run()
                    .then(callback);
            },

            clickSecondElementAndSimulateRealEvent: function (callback) {
                var clickAutomation = new ClickAutomation(div2, new ClickOptions());

                clickAutomation
                    .run()
                    .then(callback);

                window.setTimeout(function () {
                    var click = nativeMethods.click.call(div1);
                }, 50);
            },

            checkRealEventBlocking: function () {
                equal(documentClickCount, 1);
                start();
            }
        });
    });
});
