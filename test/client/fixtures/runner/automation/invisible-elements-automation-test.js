//TODO: move to recording because SETTINGS.RECORDING = true???
var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var SETTINGS     = testCafeCore.get('./settings').get();

var testCafeRunner             = window.getTestCafeModule('testCafeRunner');
var automation                 = testCafeRunner.get('./automation/automation');
var clickPlaybackAutomation    = testCafeRunner.get('./automation/playback/click');
var rClickPlaybackAutomation   = testCafeRunner.get('./automation/playback/rclick');
var dblClickPlaybackAutomation = testCafeRunner.get('./automation/playback/dblclick');
var dragPlaybackAutomation     = testCafeRunner.get('./automation/playback/drag');
var typePlaybackAutomation     = testCafeRunner.get('./automation/playback/type');
var hoverPlaybackAutomation    = testCafeRunner.get('./automation/playback/hover');

var testCafeUI = window.getTestCafeModule('testCafeUI');
var cursor     = testCafeUI.get('./cursor');


automation.init();
cursor.init();

SETTINGS.RECORDING = true;

$(document).ready(function () {
    //consts
    var TEST_ELEMENT_CLASS = 'testElement';

    //utils
    var createTextInput = function () {
        return $('<input type="text">').attr('id', 'input').addClass(TEST_ELEMENT_CLASS).appendTo('body');
    };

    var createInvisibleInputWithHandlers = function (events) {
        var $input = createTextInput()
            .css('visibility', 'hidden');

        if (!events || !events.length)
            return $input;

        $.each(events, function (index, value) {
            $input.bind(value, function (e) {
                $input.attr('value', $input.attr('value') + e.type);
            });
        });
        return $input;
    };

    $('body').css('height', 1500);

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

    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();
    });

    //tests
    module('actions with invisible element during recording');

    asyncTest('Click playback on invisible input', function () {
        var $input = createInvisibleInputWithHandlers(['mousedown', 'mouseup', 'click']);

        clickPlaybackAutomation($input[0], {}, function () {
            equal($input.attr('value'), 'mousedownmouseupclick');
            startNext();
        });
    });

    asyncTest('RClick playback on invisible input', function () {
        var $input = createInvisibleInputWithHandlers(['mousedown', 'mouseup', 'contextmenu']);

        rClickPlaybackAutomation($input[0], {}, function () {
            equal($input.attr('value'), 'mousedownmouseupcontextmenu');
            startNext();
        });
    });

    asyncTest('DblClick playback on invisible input', function () {
        var $input = createInvisibleInputWithHandlers(['mousedown', 'mouseup', 'click', 'dblclick']);

        dblClickPlaybackAutomation($input[0], {}, function () {
            equal($input.attr('value'), 'mousedownmouseupclickmousedownmouseupclickdblclick');
            startNext();
        });
    });

    asyncTest('Drag playback on invisible input', function () {
        var $input = createInvisibleInputWithHandlers(['mousedown', 'mouseup', 'click']),
            to     = { x: 100, y: 100 };

        dragPlaybackAutomation($input[0], to, {}, function () {
            equal($input.attr('value'), '');
            startNext();
        });
    });

    asyncTest('Type playback on invisible input', function () {
        var $input = createInvisibleInputWithHandlers(['mousedown', 'mouseup', 'click', 'keydown', 'keypress', 'keyup']),
            text   = 'test';

        typePlaybackAutomation($input[0], text, {}, function () {
            equal($input.attr('value'), '');
            startNext();
        });
    });

    asyncTest('Hover playback on invisible input', function () {
        var $input = createInvisibleInputWithHandlers(['mouseenter', 'mouseover']),
            text   = 'test';

        hoverPlaybackAutomation($input[0], {}, function () {
            equal($input.attr('value'), '');
            startNext();
        });
    });
});
