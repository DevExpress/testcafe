var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var domUtils     = testCafeCore.get('./utils/dom');

var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
var PressAutomation    = testCafeAutomation.Press;
var parseKeySequence   = testCafeCore.get('./utils/parse-key-sequence');

testCafeCore.preventRealEvents();

QUnit.config.testTimeout = 15000;

$(document).ready(function () {
    //consts
    var TEST_ELEMENT_CLASS = 'testElement';

    var focusedElements          = [];
    var $expectedFocusedElements = [];
    var $inputText               = null;
    var $textarea                = null;
    var $link                    = null;
    var $linkWithTabIndex        = null;
    var $divWithTabIndex         = null;

    //contentEditable elements
    var $divContentEditable             = null;
    var $divContentEditableWithTabIndex = null;
    var $buttonInContentEditable        = null;
    var $inputSubmit                    = null;
    var $inputCheckBox                  = null;
    var $select                         = null;
    var $selectMultiple                 = null;
    var $optionOneWithTabIdex           = null;
    var $optionTwoWithTabIdex           = null;
    var $radioGroupOnePart1             = null;
    var $radioInput1                    = null;
    var $radioInput2                    = null;
    var $radioGroupOnePart2             = null;
    var $radioInput3                    = null;
    var $radioInput4                    = null;
    var $radioGroupSecond               = null;
    var $radioInput5                    = null;
    var $radioInput6                    = null;
    var $invisibleInput                 = null;

    //utils
    var createElements = function () {
        var $body = $('body');

        $inputText        = $('<input type="text">').attr('value', 'text input').addClass(TEST_ELEMENT_CLASS).appendTo($body);
        $textarea         = $('<textarea>').css('height', 100).attr('value', 'textarea').addClass(TEST_ELEMENT_CLASS).appendTo($body);
        $link             = $('<a>').attr('href', 'http://www.example.org/').attr('tabIndex', 2).text('Link with href').addClass(TEST_ELEMENT_CLASS).appendTo($body);
        $linkWithTabIndex = $('<a>').attr('tabIndex', '0').text('Link without href but with tabIndex').addClass(TEST_ELEMENT_CLASS).appendTo($body);

        $('<a>').text('Link without href').addClass(TEST_ELEMENT_CLASS).appendTo($body);
        $('<a>').attr('tabIndex', '-10').text('Link without href and with negative tabIndex').addClass(TEST_ELEMENT_CLASS).appendTo($body);
        $('<div></div>').text('div tag').addClass(TEST_ELEMENT_CLASS).appendTo($body);

        $divWithTabIndex = $('<div></div>').text('div tag with tabIndex').attr('tabIndex', 1).addClass(TEST_ELEMENT_CLASS).appendTo($body);

        //contentEditable elements
        $divContentEditable             = $('<div></div>').text('content editable div').attr('contenteditable', '').addClass(TEST_ELEMENT_CLASS).appendTo($body);
        $divContentEditableWithTabIndex = $('<div></div>').text('content editable div 2').attr('contenteditable', 'true').attr('tabIndex', '4').addClass(TEST_ELEMENT_CLASS).appendTo($body);
        $buttonInContentEditable        = $('<button>button</button>').attr('tabIndex', '4').addClass(TEST_ELEMENT_CLASS).appendTo($divContentEditableWithTabIndex);

        $('<p>paragraph</p>').addClass(TEST_ELEMENT_CLASS).appendTo($divContentEditableWithTabIndex);

        $('<input type="button">').attr('value', 'button input').attr('tabIndex', -1).addClass(TEST_ELEMENT_CLASS).appendTo($body);

        $inputSubmit   = $('<input type="submit">').attr('value', 'submit input').addClass(TEST_ELEMENT_CLASS).appendTo($body);
        $inputCheckBox = $('<input type="checkbox">').attr('value', 'checkbox').addClass(TEST_ELEMENT_CLASS).appendTo($body);
        $select        = $('<select></select>').attr('tabIndex', 0).addClass(TEST_ELEMENT_CLASS).appendTo($body);

        $('<option></option>').text('option one').addClass(TEST_ELEMENT_CLASS).appendTo($select);
        $('<option></option>').text('option two').addClass(TEST_ELEMENT_CLASS).appendTo($select);

        $selectMultiple       = $('<select></select>').attr('multiple', 'multiple').addClass(TEST_ELEMENT_CLASS).appendTo($body);
        $optionOneWithTabIdex = $('<option></option>').text('option tab index 2').attr('tabIndex', 3).addClass(TEST_ELEMENT_CLASS).appendTo($selectMultiple);
        $optionTwoWithTabIdex = $('<option></option>').text('option tab index 3').attr('tabIndex', 4).addClass(TEST_ELEMENT_CLASS).appendTo($selectMultiple);
        $radioGroupOnePart1   = $('<fieldset></fieldset>').addClass(TEST_ELEMENT_CLASS).appendTo($body);
        $radioInput1          = $('<input type="radio">').attr('name', 'radioGroup1').addClass(TEST_ELEMENT_CLASS).appendTo($radioGroupOnePart1);
        $radioInput2          = $('<input type="radio">').attr('name', 'radioGroup1').attr('tabIndex', 5).addClass(TEST_ELEMENT_CLASS).appendTo($radioGroupOnePart1);
        $radioGroupOnePart2   = $('<fieldset></fieldset>').addClass(TEST_ELEMENT_CLASS).appendTo($body);
        $radioInput3          = $('<input type="radio">').attr('name', 'radioGroup1').addClass(TEST_ELEMENT_CLASS).appendTo($radioGroupOnePart2);
        $radioInput4          = $('<input type="radio">').attr('name', 'radioGroup1').addClass(TEST_ELEMENT_CLASS).appendTo($radioGroupOnePart2);
        $radioGroupSecond     = $('<fieldset></fieldset>').addClass(TEST_ELEMENT_CLASS).appendTo($body);
        $radioInput5          = $('<input type="radio">').attr('name', 'radioGroup2').attr('tabIndex', 0).addClass(TEST_ELEMENT_CLASS).appendTo($radioGroupSecond);
        $radioInput6          = $('<input type="radio">').attr('name', 'radioGroup1').attr('tabIndex', 0).addClass(TEST_ELEMENT_CLASS).appendTo($radioGroupSecond);

        //T297258
        $('<div style="display: none;"><input/></div>').addClass(TEST_ELEMENT_CLASS).appendTo($body);

        var $hiddenParent = $('<div style="width: 0px; height: 0px;"></div>').addClass(TEST_ELEMENT_CLASS).appendTo($body);

        $invisibleInput = $('<input style="width: 0px; height: 0px;"/>').addClass(TEST_ELEMENT_CLASS).appendTo($hiddenParent);
    };

    var createExpectedLog = function () {
        $expectedFocusedElements.push($divWithTabIndex);
        $expectedFocusedElements.push($link);

        if (!browserUtils.isIE && !browserUtils.isAndroid)
            $expectedFocusedElements.push($optionOneWithTabIdex);

        $expectedFocusedElements.push($divContentEditableWithTabIndex);
        $expectedFocusedElements.push($buttonInContentEditable);

        if (!browserUtils.isIE && !browserUtils.isAndroid)
            $expectedFocusedElements.push($optionTwoWithTabIdex);

        $expectedFocusedElements.push($radioInput2);
        $expectedFocusedElements.push($inputText);
        $expectedFocusedElements.push($textarea);

        //GH-1803
        $expectedFocusedElements.push($linkWithTabIndex);

        $expectedFocusedElements.push($divContentEditable);

        $expectedFocusedElements.push($inputSubmit);
        $expectedFocusedElements.push($inputCheckBox);
        $expectedFocusedElements.push($select);
        $expectedFocusedElements.push($selectMultiple);
        $expectedFocusedElements.push($radioInput1);

        if (browserUtils.isFirefox) {
            $expectedFocusedElements.push($radioInput3);
            $expectedFocusedElements.push($radioInput4);
        }

        $expectedFocusedElements.push($radioInput5);
        $expectedFocusedElements.push($radioInput6);

        //T297258
        $expectedFocusedElements.push($invisibleInput);
    };

    var logElement = function () {
        var element = domUtils.getActiveElement();

        if ($(element).hasClass(TEST_ELEMENT_CLASS))
            focusedElements.push(element);
    };

    var finishActions = function (actionsType) {
        if (actionsType === 'shift+tab') {
            $expectedFocusedElements    = $expectedFocusedElements.reverse();
            $expectedFocusedElements[3] = $radioInput4;
        }

        equal($expectedFocusedElements.length, focusedElements.length);

        $.each($expectedFocusedElements, function (index, value) {
            equal(focusedElements[index], value[0]);
        });

        start();
    };

    var runPressAutomation = function (keys, callback) {
        var pressAutomation = new PressAutomation(parseKeySequence(keys).combinations, {});

        pressAutomation
            .run()
            .then(callback);
    };

    QUnit.testStart = function () {
        $('#qunit-tests').css('display', 'none');
    };

    QUnit.testDone(function () {
        $('#qunit-tests').css('display', '');
        $('.' + TEST_ELEMENT_CLASS).remove();
        focusedElements          = [];
        $expectedFocusedElements = [];
    });

    module('tab');

    asyncTest('press tab test', function () {
        createElements();
        createExpectedLog();

        var pressTabRecursive = function () {
            runPressAutomation('tab', function (callback) {
                if (focusedElements.length === $expectedFocusedElements.length - 1) {
                    logElement();
                    finishActions('tab');
                }
                else {
                    logElement();
                    pressTabRecursive(callback);
                }
            });
        };

        pressTabRecursive(logElement);
    });

    module('shift+tab');

    asyncTest('press shift+tab test', function () {
        createElements();
        createExpectedLog();

        var pressShiftTabRecursive = function () {
            runPressAutomation('shift+tab', function (callback) {
                if (focusedElements.length === $expectedFocusedElements.length - 1) {
                    logElement();
                    finishActions('shift+tab');
                }
                else {
                    logElement();
                    pressShiftTabRecursive(callback);
                }
            });
        };

        pressShiftTabRecursive();
    });
});
