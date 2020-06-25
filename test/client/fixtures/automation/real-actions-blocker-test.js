const hammerhead    = window.getTestCafeModule('hammerhead');
const nativeMethods = hammerhead.nativeMethods;

const testCafeCore = window.getTestCafeModule('testCafeCore');

const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
const ClickOptions       = testCafeAutomation.ClickOptions;
const MouseOptions       = testCafeAutomation.MouseOptions;
const ClickAutomation    = testCafeAutomation.Click;
const HoverAutomation    = testCafeAutomation.Hover;
const getOffsetOptions   = testCafeAutomation.getOffsetOptions;

testCafeCore.preventRealEvents();

$(document).ready(function () {
    const TEST_ELEMENT_CLASS = 'TestCafe-testElement';

    const createDiv = function (x, y, doc) {
        const div = doc.createElement('div');

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
        const div1 = createDiv(0, 0, document);
        const div2 = createDiv(250, 250, document);

        let documentClickCount = 0;

        nativeMethods.addEventListener.call(document, 'click', function () {
            documentClickCount++;
        }, true);

        window.async.series({
            moveToFirstElement: function (callback) {
                const offsets      = getOffsetOptions(div1);
                const hoverOptions = new MouseOptions({
                    offsetX: offsets.offsetX,
                    offsetY: offsets.offsetY
                });

                const hoverAutomation = new HoverAutomation(div1, hoverOptions);

                hoverAutomation
                    .run()
                    .then(function () {
                        callback();
                    });
            },

            clickSecondElementAndSimulateRealEvent: function (callback) {
                const clickAutomation = new ClickAutomation(div2, new ClickOptions());

                clickAutomation
                    .run()
                    .then(function () {
                        callback();
                    });

                window.setTimeout(function () {
                    nativeMethods.click.call(div1);
                }, 50);
            },

            checkRealEventBlocking: function () {
                equal(documentClickCount, 1);
                start();
            }
        });
    });
});
