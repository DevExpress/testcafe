const hammerhead       = window.getTestCafeModule('hammerhead');
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;

const testCafeCore = window.getTestCafeModule('testCafeCore');

const testCafeAutomation                = window.getTestCafeModule('testCafeAutomation');
const SelectTextAutomation              = testCafeAutomation.SelectText;
const getSelectionCoordinatesByPosition = testCafeAutomation.getSelectionCoordinatesByPosition;

testCafeCore.preventRealEvents();

const domUtils      = testCafeCore.domUtils;
const style         = testCafeCore.styleUtils;
const textSelection = testCafeCore.textSelection;


$(document).ready(function () {
    //constants
    const TEXTAREA_SELECTOR = '#textarea';
    const INPUT_SELECTOR    = '#input';

    const INPUT_INITIAL_VALUE = '123456789';

    const TEXTAREA_BIG_TEXT = '123456789abcdlasdkjasdjkajkdjkasjkdjkajskd\n12345678901234567890\n123456\n' +
                            'efghifkklfkalsklfkalskdlkaldklakdlkalskdaslkdl\njklmopsdajdkjaksjdkkjdk\n' +
                            '123456\nefghifkklfkalsklfkalskdlkaldklakdlkalskdaslkdl\njklmopsdajdkjaksjdkkjdk\n123456\n' +
                            'efghifkklfkalsklfkalskdlkaldklakdlkalskdaslkdl\njklmopsdajdkjaksjdkkjdk\n123456\n' +
                            'efghifkklfkalsklfkalskdlkaldklakdlkalskdaslkdl\njklmopsdajdkjaksjdkkjdk\n123456\n' +
                            'efghifkklfkalsklfkalskdlkaldklakdlkalskdaslkdl\njklmopsdajdkjaksjdkkjdk\n123456\n' +
                            'efghifkklfkalsklfkalskdlkaldklakdlkalskdaslkdl\njklmopsdajdkjaksjdkkjdk\n' +
                            'dasdasdasdasdajksdjkajskdjk\najkdjkasjkdjksjkdjksjdkjs\nqwerty\ntest\n' +
                            'cafesadkaldklakldlakdklakldkalskd;';

    const startSelectEvent       = featureDetection.isTouchDevice ? 'ontouchstart' : 'onmousedown';
    const endSelectEvent         = featureDetection.isTouchDevice ? 'ontouchend' : 'onmouseup';
    const checkScrollAfterSelect = !(browserUtils.isFirefox || browserUtils.isIE);

    let mousedownOnInput    = false;
    let mouseupOnInput      = false;
    let mousedownOnTextarea = false;
    let mouseupOnTextarea   = false;

    //utils
    function setValueToTextarea (value) {
        const textarea = $(TEXTAREA_SELECTOR)[0];

        textarea.value       = value;
        textarea.textContent = value;

        $(textarea).text(value);

        restorePageState();
    }

    function setValueToInput (value) {
        const input = $(INPUT_SELECTOR)[0];

        input.value = value;

        restorePageState();
    }

    function setSelection ($el, start, end, inverse) {
        start = start || 0;

        //NOTE: set to start position
        const el            = $el[0];
        const startPosition = inverse ? end : start;

        if (el.setSelectionRange)
            el.setSelectionRange(startPosition, startPosition);
        else {
            el.selectionStart = startPosition;
            el.selectionEnd   = startPosition;
        }

        //NOTE: select
        if (el.setSelectionRange)
            el.setSelectionRange(start, end, inverse ? 'backward' : 'forward');
        else {
            el.selectionStart = start;
            el.selectionEnd   = end;
        }
    }

    function checkSelection (el, start, end, inverse) {
        equal(domUtils.getActiveElement(), el, 'selected element is active');
        equal(textSelection.getSelectionStart(el), start, 'start selection correct');
        equal(textSelection.getSelectionEnd(el), end, 'end selection correct');

        if (!window.DIRECTION_ALWAYS_IS_FORWARD)
            equal(textSelection.hasInverseSelection(el), inverse || false, 'selection direction correct');
    }

    function restorePageState () {
        const $input    = $(INPUT_SELECTOR);
        const $textarea = $(TEXTAREA_SELECTOR);

        $textarea.css({
            width:  '250px',
            height: '150px'
        });

        setSelection($input, 0, 0);
        setSelection($textarea, 0, 0);

        $input[0].scrollLeft   = 0;
        $textarea[0].scrollTop = 0;

        document.body.focus();
    }

    function bindHandlers () {
        const input    = $(INPUT_SELECTOR)[0];
        const textarea = $(TEXTAREA_SELECTOR)[0];

        input[startSelectEvent] = function () {
            mousedownOnInput = true;
        };

        input[endSelectEvent] = function () {
            mouseupOnInput = true;
        };

        textarea[startSelectEvent] = function () {
            mousedownOnTextarea = true;
        };

        textarea[endSelectEvent] = function () {
            mouseupOnTextarea = true;
        };
    }

    function unbindHandlers () {
        const input    = $(INPUT_SELECTOR)[0];
        const textarea = $(TEXTAREA_SELECTOR)[0];

        mousedownOnInput    = false;
        mouseupOnInput      = false;
        mousedownOnTextarea = false;
        mouseupOnTextarea   = false;

        input[startSelectEvent] = function () {
        };

        input[endSelectEvent] = function () {
        };

        textarea[startSelectEvent] = function () {
        };

        textarea[endSelectEvent] = function () {
        };
    }

    $('body').css('height', '1500px');

    //NOTE: problem with window.top bodyMargin in IE9 if test 'runAll'
    //because we can't determine that element is in qunit test iframe
    if (browserUtils.isIE9)
        $(window.top.document).find('body').css('marginTop', '0px');

    //tests
    QUnit.testStart(function () {
        restorePageState();
        bindHandlers();
    });

    QUnit.testDone(function () {
        setValueToInput(INPUT_INITIAL_VALUE);
        setValueToTextarea('');

        unbindHandlers();
    });

    module('check the boundary cases');

    asyncTest('select empty input', function () {
        const $input = $(INPUT_SELECTOR);

        setValueToInput('');

        const select = new SelectTextAutomation($input[0], 0, 0, {});

        select
            .run()
            .then(function () {
                ok(mousedownOnInput, 'select started from input');
                ok(mouseupOnInput, 'select ended on input');

                checkSelection($input[0], 0, 0);
                start();
            });
    });

    asyncTest('select empty textarea', function () {
        const $textarea = $(TEXTAREA_SELECTOR);

        setValueToTextarea('');

        const select = new SelectTextAutomation($textarea[0], 0, 0, {});

        select
            .run()
            .then(function () {
                ok(mousedownOnTextarea, 'select started from textarea');
                ok(mouseupOnTextarea, 'select ended on textarea');

                checkSelection($textarea[0], 0, 0);
                start();
            });
    });

    asyncTest('select in input with some spaces in succession', function () {
        const $input = $(INPUT_SELECTOR);

        setValueToInput('1   2     3    4    5      6');

        const select = new SelectTextAutomation($input[0], 3, 25, {});

        select
            .run()
            .then(function () {
                ok(mousedownOnInput, 'select started from input');
                ok(mouseupOnInput, 'select ended on input');

                checkSelection($input[0], 3, 25);
                start();
            });
    });

    asyncTest('select in textarea with some empty strings', function () {
        const $textarea = $(TEXTAREA_SELECTOR);

        let valueLength = null;

        setValueToTextarea('123456789abcd\n\n\nefghi\njklmop\n\nqwerty test cafe');
        valueLength = $textarea[0].value.length;

        const select = new SelectTextAutomation($textarea[0], 3, valueLength - 3, {});

        select
            .run()
            .then(function () {
                ok(mousedownOnTextarea, 'select started from textarea');
                ok(mouseupOnTextarea, 'select ended on textarea');

                checkSelection($textarea[0], 3, valueLength - 3);
                start();
            });
    });

    module('scroll in input');

    asyncTest('forward select and scroll', function () {
        const input = $(INPUT_SELECTOR)[0];

        let mousedown = false;
        let mouseup   = false;

        setValueToInput('1234567891012131415161718911200111554454455454545412121212121212');

        input[startSelectEvent] = function () {
            equal(style.getElementScroll(input).left, 0);
            mousedown = true;
        };

        input[endSelectEvent] = function () {
            if (checkScrollAfterSelect)
                ok(style.getElementScroll(input).left > 0);

            mouseup = true;
        };

        const select = new SelectTextAutomation(input, 3, 33, {});

        select
            .run()
            .then(function () {
                ok(mousedown, 'select started from input');
                ok(mouseup, 'select ended on input');

                checkSelection(input, 3, 33);

                if (checkScrollAfterSelect)
                    ok(style.getElementScroll(input).left > 0);

                expect((checkScrollAfterSelect ? 9 : 7) - Number(window.DIRECTION_ALWAYS_IS_FORWARD));
                start();
            });
    });

    asyncTest('backward select and scroll', function () {
        const input = $(INPUT_SELECTOR)[0];

        let oldScroll = null;
        let mousedown = false;
        let mouseup   = false;

        setValueToInput('1234567891012131415161718911200111554454455454545412121212121212');

        input[startSelectEvent] = function () {
            oldScroll = style.getElementScroll(input).left;

            if (checkScrollAfterSelect)
                ok(style.getElementScroll(input).left > 0);

            mousedown = true;
        };

        input[endSelectEvent] = function () {
            if (checkScrollAfterSelect)
                ok(style.getElementScroll(input).left < oldScroll);

            mouseup = true;
        };

        const select = new SelectTextAutomation(input, 33, 0, {});

        select
            .run()
            .then(function () {
                ok(mousedown, 'select started from input');
                ok(mouseup, 'select ended on input');

                checkSelection(input, 0, 33, true);

                if (checkScrollAfterSelect)
                    ok(style.getElementScroll(input).left < oldScroll);

                expect((checkScrollAfterSelect ? 9 : 6) - Number(window.DIRECTION_ALWAYS_IS_FORWARD));
                start();
            });
    });

    module('scroll in textarea');

    asyncTest('forward select and right direction (endPos more than startPos)', function () {
        const textarea = $(TEXTAREA_SELECTOR)[0];

        let mousedown = false;
        let mouseup   = false;

        setValueToTextarea(TEXTAREA_BIG_TEXT);

        $(textarea).css({
            width:  '400px',
            height: '100px'
        });

        textarea[startSelectEvent] = function () {
            equal(style.getElementScroll(textarea).top, 0);

            mousedown = true;
        };

        textarea[endSelectEvent] = function () {
            if (checkScrollAfterSelect)
                ok(style.getElementScroll(textarea).top > 0);

            mouseup = true;
        };

        const select = new SelectTextAutomation(textarea, 2, 628, {});

        select
            .run()
            .then(function () {
                ok(mousedown, 'select started from textarea');
                ok(mouseup, 'select ended on textarea');

                checkSelection(textarea, 2, 628);

                if (checkScrollAfterSelect)
                    ok(style.getElementScroll(textarea).top > 0);

                expect((checkScrollAfterSelect ? 9 : 7) - Number(window.DIRECTION_ALWAYS_IS_FORWARD));
                start();
            });
    });

    asyncTest('forward select and left direction (endPos less than startPos)', function () {
        const textarea = $(TEXTAREA_SELECTOR)[0];

        let mousedown = false;
        let mouseup   = false;

        setValueToTextarea(TEXTAREA_BIG_TEXT);

        $(textarea).css({
            width:  '400px',
            height: '100px'
        });

        textarea[startSelectEvent] = function () {
            equal(style.getElementScroll(textarea).top, 0);

            mousedown = true;
        };

        textarea[endSelectEvent] = function () {
            if (checkScrollAfterSelect)
                ok(style.getElementScroll(textarea).top > 0);

            mouseup = true;
        };

        const select = new SelectTextAutomation(textarea, 34, 591, {});

        select
            .run()
            .then(function () {
                ok(mousedown, 'select started from textarea');
                ok(mouseup, 'select ended on textarea');

                checkSelection(textarea, 34, 591, false);

                if (checkScrollAfterSelect)
                    ok(style.getElementScroll(textarea).top > 0);

                expect((checkScrollAfterSelect ? 9 : 7) - Number(window.DIRECTION_ALWAYS_IS_FORWARD));
                start();
            });
    });

    asyncTest('backward select and right direction (endPos less than startPos)', function () {
        const textarea = $(TEXTAREA_SELECTOR)[0];

        let oldScroll = null;
        let mousedown = false;
        let mouseup   = false;

        setValueToTextarea(TEXTAREA_BIG_TEXT);

        $(textarea).css({
            width:  '400px',
            height: '100px'
        });

        textarea[startSelectEvent] = function () {
            oldScroll = style.getElementScroll(textarea).top;

            if (checkScrollAfterSelect)
                ok(oldScroll > 0);

            mousedown = true;
        };

        textarea[endSelectEvent] = function () {
            if (checkScrollAfterSelect)
                ok(style.getElementScroll(textarea).top < oldScroll);

            mouseup = true;
        };

        const select = new SelectTextAutomation(textarea, 591, 34, {});

        select
            .run()
            .then(function () {
                ok(mousedown, 'select started from textarea');
                ok(mouseup, 'select ended on textarea');

                checkSelection(textarea, 34, 591, true);

                if (checkScrollAfterSelect)
                    ok(style.getElementScroll(textarea).top < oldScroll);

                expect((checkScrollAfterSelect ? 9 : 6) - Number(window.DIRECTION_ALWAYS_IS_FORWARD));
                start();
            });
    });

    asyncTest('backward select and left direction (endPos more than startPos)', function () {
        const textarea = $(TEXTAREA_SELECTOR)[0];

        let oldScroll = null;
        let mousedown = false;
        let mouseup   = false;

        setValueToTextarea(TEXTAREA_BIG_TEXT);

        $(textarea).css({
            width:  '400px',
            height: '100px'
        });

        document.body[startSelectEvent] = function () {
            oldScroll = style.getElementScroll(textarea).top;

            if (checkScrollAfterSelect)
                ok(oldScroll > 0);

            mousedown = true;
        };

        document.body[endSelectEvent] = function () {
            if (checkScrollAfterSelect)
                ok(style.getElementScroll(textarea).top < oldScroll);

            mouseup = true;
        };

        const select = new SelectTextAutomation(textarea, 628, 2, {});

        select
            .run()
            .then(function () {
                ok(mousedown, 'select started from textarea');
                ok(mouseup, 'select ended on textarea');

                checkSelection(textarea, 2, 628, true);

                if (checkScrollAfterSelect)
                    ok(style.getElementScroll(textarea).top < oldScroll);

                expect((checkScrollAfterSelect ? 9 : 6) - Number(window.DIRECTION_ALWAYS_IS_FORWARD));
                start();
            });
    });


    module('regression');

    test('GH2169 - SelectText action sometimes raise error in Safari', function () {
        const input = $(INPUT_SELECTOR)[0];

        let err   = null;

        //emulate Safari behavior
        document.createRange = function () {
            return null;
        };

        try {
            getSelectionCoordinatesByPosition(input, 3);
        }
        catch (e) {
            err = e;
        }

        notOk(err);
    });
});
