var testCafeCore      = window.getTestCafeModule('testCafeCore');
var preventRealEvents = testCafeCore.get('./prevent-real-events');
var parseKeySequence  = testCafeCore.get('./utils/parse-key-sequence');
var domUtils          = testCafeCore.get('./utils/dom');
var textSelection     = testCafeCore.get('./utils/text-selection');

var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
var PressAutomation    = testCafeAutomation.Press;

preventRealEvents();

var hammerhead    = window.getTestCafeModule('hammerhead');
var iframeSandbox = hammerhead.sandbox.iframe;


$(document).ready(function () {
    var $input = null;

    //constants
    var TEST_ELEMENT_CLASS = 'testElement';


    //tests
    QUnit.testStart(function () {
        $input          = $('<input type="text" id="input" class="input"/>').addClass(TEST_ELEMENT_CLASS).appendTo($('body'));
        $input[0].value = 'test';
        $input[0].focus();

        textSelection.select($input[0], 4, 4);

        iframeSandbox.on(iframeSandbox.RUN_TASK_SCRIPT, window.initIFrameTestHandler);
        iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT, iframeSandbox.iframeReadyToInitHandler);
    });

    QUnit.testDone(function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
        iframeSandbox.off(iframeSandbox.RUN_TASK_SCRIPT, window.initIFrameTestHandler);
    });

    module('different scenarios');

    asyncTest('press a', function () {
        var press = new PressAutomation(parseKeySequence('left a').combinations);

        press
            .run()
            .then(function () {
                equal($input[0].value, 'tesat');
                start();
            });
    });

    asyncTest('press +', function () {
        var press = new PressAutomation(parseKeySequence('+ shift++').combinations);

        press
            .run()
            .then(function () {
                equal($input[0].value, 'test++');
                start();
            });
    });

    asyncTest('press space', function () {
        var press = new PressAutomation(parseKeySequence('left space').combinations);

        press
            .run()
            .then(function () {
                equal($input[0].value, 'tes t');
                start();
            });
    });

    asyncTest('press shift+a', function () {
        var press = new PressAutomation(parseKeySequence('shift+a').combinations);

        press
            .run()
            .then(function () {
                equal($input[0].value, 'testA');
                start();
            });
    });

    asyncTest('press shift+1', function () {
        var press = new PressAutomation(parseKeySequence('shift+1').combinations);

        press
            .run()
            .then(function () {
                equal($input[0].value, 'test!');
                start();
            });
    });

    asyncTest('press tab', function () {
        domUtils.getActiveElement().blur();
        $('body').focus();
        $input.attr('tabIndex', 1);

        var press = new PressAutomation(parseKeySequence('tab').combinations);

        press
            .run()
            .then(function () {
                deepEqual(domUtils.getActiveElement(), $input[0]);
                equal($input[0].selectionStart, 0);
                equal($input[0].selectionEnd, $input[0].value.length);
                start();
            });
    });

    asyncTest('press tab with tabIndexes', function () {
        var $input2 = $('<input type="text" id="$input2" class="input"/>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($('body'))
            .attr('tabIndex', 1);

        $input.attr('tabIndex', 2);
        domUtils.getActiveElement().blur();
        $('body').focus();

        var press = new PressAutomation(parseKeySequence('tab').combinations);

        press
            .run()
            .then(function () {
                deepEqual(domUtils.getActiveElement(), $input2[0]);
                start();
            });
    });

    asyncTest('press tab with iframe', function () {
        var $iframe = $('<iframe id="test1" src="about:blank"/>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($('body'));

        var $iframeInput = $('<input type="text" id="iframeInput"/>')
            .addClass(TEST_ELEMENT_CLASS);

        window.QUnitGlobals.waitForIframe($iframe[0])
            .then(function () {
                $($iframe.contents()[0]).find('body').append($iframeInput);

                domUtils.getActiveElement().blur();
                $input.focus();

                var press = new PressAutomation(parseKeySequence('tab').combinations);

                press
                    .run()
                    .then(function () {
                        ok(domUtils.getActiveElement() !== $input[0]);
                        start();
                    });
            });
    });
});
