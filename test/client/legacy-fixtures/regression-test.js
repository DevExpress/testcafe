var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
var getAutomations       = testCafeLegacyRunner.get('./automation-storage').getAutomations;
var initAutomation       = testCafeLegacyRunner.get('./init-automation');

var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');

var ClickOptions    = testCafeAutomation.get('../../test-run/commands/options').ClickOptions;

var getOffsetOptions = testCafeAutomation.getOffsetOptions;

initAutomation();

$(document).ready(function () {
    //consts
    var TEST_ELEMENT_CLASS = 'testElement';

    //vars
    var body = $('body')[0];

    $(body).css('height', 1500);

    //NOTE: problem with window.top bodyMargin in IE9 if test 'runAll'
    //because we can't determine that element is in qunit test iframe
    if (browserUtils.isIE9)
        $(window.top.document).find('body').css('marginTop', '0px');

    var startNext = function () {
        if (browserUtils.isIE) {
            removeTestElements();
            window.setTimeout(start, 30);
        }
        else
            start();
    };

    var removeTestElements = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    };

    var runClickAutomationInIframe = function (iframe, el, options, callback) {
        var offsets      = getOffsetOptions(el, options.offsetX, options.offsetY);
        var clickOptions = new ClickOptions({
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

        var iframeAutomations = getAutomations(iframe.contentWindow);
        var clickAutomation   = new iframeAutomations.Click(el, clickOptions);

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
        var focusEventCount = 0;
        var $iFrame         = $('<iframe></iframe>')
            .width(500)
            .height(500)
            .attr('src', window.QUnitGlobals.getResourceUrl('../data/runner/iframe.html'))
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body');

        $iFrame.load(function () {
            var $iFrameBody = $($iFrame[0].contentWindow.document.body);

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
