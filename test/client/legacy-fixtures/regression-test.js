const hammerhead   = window.getTestCafeModule('hammerhead');
const browserUtils = hammerhead.utils.browser;

const testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
const getAutomations       = testCafeLegacyRunner.get('./automation-storage').getAutomations;
const initAutomation       = testCafeLegacyRunner.get('./init-automation');

const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');

const ClickOptions    = testCafeAutomation.get('../../test-run/commands/options').ClickOptions;

const getOffsetOptions = testCafeAutomation.getOffsetOptions;

initAutomation();

$(document).ready(function () {
    //consts
    const TEST_ELEMENT_CLASS = 'testElement';

    //vars
    const body = $('body')[0];

    $(body).css('height', 1500);

    //NOTE: problem with window.top bodyMargin in IE9 if test 'runAll'
    //because we can't determine that element is in qunit test iframe
    if (browserUtils.isIE9)
        $(window.top.document).find('body').css('marginTop', '0px');

    const startNext = function () {
        if (browserUtils.isIE) {
            removeTestElements();
            window.setTimeout(start, 30);
        }
        else
            start();
    };

    const removeTestElements = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    };

    const runClickAutomationInIframe = function (iframe, el, options, callback) {
        const offsets      = getOffsetOptions(el, options.offsetX, options.offsetY);
        const clickOptions = new ClickOptions({
            offsetX:  offsets.offsetX,
            offsetY:  offsets.offsetY,
            caretPos: options.caretPos,

            modifiers: {
                ctrl:  options.ctrl,
                alt:   options.ctrl,
                shift: options.shift,
                meta:  options.meta
            }
        });

        const iframeAutomations = getAutomations(iframe.contentWindow);
        const clickAutomation   = new iframeAutomations.Click(el, clickOptions);

        clickAutomation
            .run()
            .then(callback);
    };

    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();
    });

    module('regression tests');

    asyncTest('T235186 - Focus event handlers don\'t call for iframe\'s contenteditable body', function () {
        let focusEventCount = 0;

        const $iFrame = $('<iframe></iframe>')
            .width(500)
            .height(500)
            .attr('src', window.QUnitGlobals.getResourceUrl('../data/runner/iframe.html'))
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');

        $iFrame.load(function () {
            const $iFrameBody = $($iFrame[0].contentWindow.document.body);

            $iFrameBody.attr('contenteditable', true);

            $iFrameBody.bind('focus', function () {
                focusEventCount++;
            });

            runClickAutomationInIframe($iFrame[0], $iFrameBody[0], {}, function () {
                equal(focusEventCount, 1);
                runClickAutomationInIframe($iFrame[0], $iFrameBody[0], {}, function () {
                    equal(focusEventCount, 1);
                    startNext();
                });
            });
        });
    });
});
