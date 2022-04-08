const hammerhead   = window.getTestCafeModule('hammerhead');
const browserUtils = hammerhead.utils.browser;

const testCafeCore = window.getTestCafeModule('testCafeCore');
const domUtils     = testCafeCore.domUtils;

const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
const PressAutomation    = testCafeAutomation.Press;
const parseKeySequence   = testCafeCore.parseKeySequence;

testCafeCore.preventRealEvents();

QUnit.config.testTimeout = 15000;

$(document).ready(function () {
    const TEST_ELEMENT_CLASS = 'testElement';

    let focusedElements          = [];
    let $expectedFocusedElements = [];

    let $inputText               = null;
    let $textarea                = null;
    let $link                    = null;
    let $linkWithTabIndex        = null;
    let $divWithTabIndex         = null;

    //contentEditable elements
    let $divContentEditable             = null;
    let $divContentEditableWithTabIndex = null;
    let $buttonInContentEditable        = null;
    let $inputSubmit                    = null;
    let $inputCheckBox                  = null;
    let $select                         = null;
    let $selectMultiple                 = null;
    let $optionOneWithTabIdex           = null;
    let $optionTwoWithTabIdex           = null;
    let $radioGroupOnePart1             = null;
    let $radioInput1                    = null;
    let $radioInput2                    = null;
    let $radioGroupOnePart2             = null;
    let $radioInput3                    = null;
    let $radioInput4                    = null;
    let $radioGroupSecond               = null;
    let $radioInput5                    = null;
    let $radioInput6                    = null;
    let $invisibleInput                 = null;

    //utils
    const createElements = function () {
        const $body = $('body');

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

        const $hiddenParent = $('<div style="width: 0px; height: 0px;"></div>').addClass(TEST_ELEMENT_CLASS).appendTo($body);

        $invisibleInput = $('<input style="width: 0px; height: 0px;"/>').addClass(TEST_ELEMENT_CLASS).appendTo($hiddenParent);
    };

    const createExpectedLog = function () {
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

    const logElement = function () {
        const element = domUtils.getActiveElement();

        if ($(element).hasClass(TEST_ELEMENT_CLASS))
            focusedElements.push(element);
    };

    const finishActions = function (actionsType) {
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

    const runPressAutomation = function (keys, callback) {
        const pressAutomation = new PressAutomation(parseKeySequence(keys).combinations, {});

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

        const pressTabRecursive = function () {
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

        const pressShiftTabRecursive = function () {
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

    if (!browserUtils.isIE11) {
        module('shadow root');

        asyncTest('tab', function () {
            const btn1 = document.createElement('button'); // <button>not shadow - no tabIndex</button>
            const btn2 = document.createElement('button'); // <button tabindex="1">not shadow - tabIndex === 1</button>
            const div1 = document.createElement('div'); // <div style="width: 100px; height: 100px; border: 1px solid black;"></div>
            const div2 = document.createElement('div'); // <div tabindex="4"></div>
            const btn3 = document.createElement('button'); // <button tabindex="3">not shadow - tabIndex === 3</button>
            const btn4 = document.createElement('button'); // <button>not shadow - no tabIndex</button>

            btn1.innerHTML = 'not shadow - no tabIndex';
            btn2.innerHTML = 'not shadow - tabIndex === 1';
            btn3.innerHTML = 'not shadow - tabIndex === 3';
            btn4.innerHTML = 'not shadow - no tabIndex';

            div1.style.width = '100px;';
            div1.style.height = '100px;';
            div1.style.border = '1px solid black';

            btn2.setAttribute('tabindex', '1');
            btn3.setAttribute('tabindex', '3');
            div2.setAttribute('tabindex', '4');

            // shadow root for non tabIndex div1
            const btn5 = document.createElement('button');
            const btn6 = document.createElement('button');

            btn5.innerHTML = 'shadow - no tabIndex';
            btn5.id        = 'btnShadow_on_tabIndex_c2';

            btn6.innerHTML = 'shadow - tabIndex === 2';
            btn6.id        = 'btnShadow_tabIndex2_c2';

            btn6.setAttribute('tabindex', 2);

            div1.attachShadow({ mode: 'open' });
            div1.shadowRoot.appendChild(btn5);
            div1.shadowRoot.appendChild(btn6);

            // shadow root for tabIndex div2

            const btn7 = document.createElement('button');
            const btn8 = document.createElement('button');

            btn7.innerHTML = 'shadow - no tabIndex';
            btn8.innerHTML = 'shadow - tabIndex === 2';

            btn8.setAttribute('tabindex', 2);

            div2.attachShadow({ mode: 'open' });
            div2.shadowRoot.appendChild(btn7);
            div2.shadowRoot.appendChild(btn8);

            document.body.appendChild(btn1);
            document.body.appendChild(btn2);
            document.body.appendChild(div1);
            document.body.appendChild(div2);
            document.body.appendChild(btn3);
            document.body.appendChild(btn4);

            function pressTabAndAssert (el1, el2) {
                const pressAutomation = new PressAutomation(parseKeySequence('tab').combinations, {});

                return pressAutomation
                    .run()
                    .then(function () {
                        equal(document.activeElement, el1);

                        if (el2)
                            equal(el1.shadowRoot.activeElement, el2);
                    });
            }

            pressTabAndAssert(btn2)
                .then(function () {
                    return pressTabAndAssert(btn3);
                })
                .then(function () {
                    return pressTabAndAssert(div2);
                })
                .then(function () {
                    return pressTabAndAssert(div2, btn8);
                })
                .then(function () {
                    return pressTabAndAssert(div2, btn7);
                })
                .then(function () {
                    return pressTabAndAssert(btn1);
                })
                .then(function () {
                    return pressTabAndAssert(div1, btn6);
                })
                .then(function () {
                    return pressTabAndAssert(div1, btn5);
                })
                .then(function () {
                    return pressTabAndAssert(btn4);
                })
                .then(start);
        });
    }
});
