const hammerhead       = window.getTestCafeModule('hammerhead');
const browserUtils     = hammerhead.utils.browser;
const nativeMethods    = hammerhead.nativeMethods;
const focusBlurSandbox = hammerhead.eventSandbox.focusBlur;

const testCafeCore       = window.getTestCafeModule('testCafeCore');
const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');

const ClickOptions = testCafeAutomation.ClickOptions;
const TypeOptions  = testCafeAutomation.TypeOptions;

const ClickAutomation = testCafeAutomation.Click;
const TypeAutomation  = testCafeAutomation.Type;
const PressAutomation = testCafeAutomation.Press;

const parseKeySequence = testCafeCore.parseKeySequence;
const getOffsetOptions = testCafeAutomation.getOffsetOptions;
const cursor           = testCafeAutomation.cursor;

testCafeCore.preventRealEvents();

const TEST_ELEMENT_CLASS = 'testElement';

const testStartDelay = 25;

let input1                           = null;
let input2                           = null;
let input2BlurHandlersExecutedAmount = null;

const testTimeoutIds = [];

const enableLogging = false;

const setDoubleTimeout = function (callback, timeout) {
    if (!timeout)
        timeout = 0;

    window.setTimeout(function () {
        window.setTimeout(callback, timeout);
    }, 50);
};

const logMessage = function (text) {
    if (enableLogging)
        ok(true, new Date().getSeconds() + ':' + new Date().getMilliseconds().toString() + ' ' + text);
};

const getBlurHandler = function () {
    return function (e) {
        e           = e || window.event;
        const element = e.target || e.srcElement;

        if (element && element.id === 'input2')
            input2BlurHandlersExecutedAmount++;

        logMessage(' onblur called for ' + element.id);
    };
};

const blurListener = getBlurHandler();

const clearExecutedHandlersCounter = function () {
    input2BlurHandlersExecutedAmount = 0;
};

const removeTestElements = function () {
    $('.' + TEST_ELEMENT_CLASS).remove();
};

const startNext = function () {
    while (testTimeoutIds.length)
        clearTimeout(testTimeoutIds.pop());

    focusBlurSandbox.focus($('body')[0], function () {
        removeTestElements();

        start();
    });
};

const runAsyncTest = function (actions, timeout) {
    let testCanceled = null;

    window.setTimeout(function () {
        actions(function () {
            return testCanceled;
        });
    }, testStartDelay);

    testTimeoutIds.push(
        setTimeout(function () {
            testCanceled = true;
            ok(false, 'Timeout is exceeded');

            startNext();
        }, timeout)
    );
};

const dumpProperties = function (element) {
    const props        = [];

    let currentProps = [];

    while (element) {
        currentProps = Object.getOwnPropertyNames(element);

        for (let i = 0; i < currentProps.length; i++) {
            if (props.indexOf(currentProps[i]) < 0)
                props.push(currentProps[i]);
        }

        if (Object.getPrototypeOf)
            element = Object.getPrototypeOf(element);
        else
        /*eslint-disable no-proto*/
            element = element.__proto__;
        /*eslint-enable no-proto*/
    }

    return props;
};

const getArrayDiff = function (a, b) {
    const diff = {
        deleted: [],
        added:   [],
    };

    a = !a ? [] : a;
    b = !b ? [] : b;

    for (let i = 0; i < a.length; i++) {
        if (b.indexOf(a[i]) < 0)
            diff.deleted.push(a[i]);
    }

    for (let i = 0; i < b.length; i++) {
        if (a.indexOf(b[i]) < 0)
            diff.added.push(b[i]);
    }

    return diff;
};

const runClickAutomation = function (el, options) {
    const offsets = getOffsetOptions(el, options.offsetX, options.offsetY);

    const clickOptions = new ClickOptions({
        offsetX:  offsets.offsetX,
        offsetY:  offsets.offsetY,
        caretPos: options.caretPos,

        modifiers: {
            ctrl:  options.ctrl,
            alt:   options.ctrl,
            shift: options.shift,
            meta:  options.meta,
        },
    });

    const clickAutomation = new ClickAutomation(el, clickOptions, window, cursor);

    return clickAutomation.run();
};

const runTypeAutomation = function (element, text) {
    const offsets = getOffsetOptions(element);

    const typeOptions = new TypeOptions({
        offsetX: offsets.offsetX,
        offsetY: offsets.offsetY,
    });

    const typeAutomation = new TypeAutomation(element, text, typeOptions);

    return typeAutomation.run();
};

//tests
QUnit.testStart(function () {
    input1 = $('<input type="text" id="input1"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body').get(0);
    input2 = $('<input type="text" id="input2"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body').get(0);
    clearExecutedHandlersCounter();
});


module('Regression tests');

asyncTest('B236526 - Change event raising if blur() is called by a client script', function () {
    runAsyncTest(
        function () {
            let changed = false;

            input2.onchange = function () {
                changed = true;
            };

            focusBlurSandbox.focus(input2, function () {
                nativeMethods.inputValueSetter.call(input2, nativeMethods.inputValueGetter.call(input2) + 'test');
                input2.blur();

                setDoubleTimeout(function () {
                    ok(changed);
                    startNext();
                });
            });
        },
        2000
    );
});

asyncTest('B236912 - change event raising if an element is focused before type action by a client script', function () {
    runAsyncTest(
        function () {
            let changed = false;

            input2.onchange = function () {
                changed = true;
            };

            input2.focus();

            runTypeAutomation(input2, 'test')
                .then(function () {
                    focusBlurSandbox.focus(input1, function () {
                        ok(changed);
                        startNext();
                    });
                });
        },
        2000
    );
});

asyncTest('B237366 - change event raising after sequential type actions', function () {
    runAsyncTest(
        function () {
            let input1changed = false;
            let input2changed = false;

            input1.onchange = function () {
                input1changed = true;
            };

            input2.onchange = function () {
                input2changed = true;
            };

            runTypeAutomation(input1, 'test')
                .then(function () {
                    return runTypeAutomation(input2, 'test');
                })
                .then(function () {
                    focusBlurSandbox.blur(input2, function () {
                        ok(input1changed);
                        ok(input2changed);
                        startNext();
                    });
                });
        },
        5000
    );
});

asyncTest('B238617 - Label with "for" attribute focusing', function () {
    runAsyncTest(
        function () {
            const $label       = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', input2.id).appendTo('body');

            let labelFocused = false;
            let inputFocused = false;

            $label[0].onfocus = function () {
                labelFocused = true;
            };

            input2.onfocus = function () {
                inputFocused = true;
            };

            focusBlurSandbox.focus($label[0], function () {
                ok(!labelFocused, 'label focus handler checked after FocusBlur.focus()');
                ok(inputFocused, 'input focus handler checked after FocusBlur.focus()');
                ok(document.activeElement === input2, 'document.activeElement checked after FocusBlur.focus()');

                labelFocused = false;
                inputFocused = false;
                input2.blur();
                $label[0].focus();

                setDoubleTimeout(function () {
                    ok(!labelFocused, 'label focus handler checked after element.focus()');
                    ok(inputFocused, 'input focus handler checked after FocusBlur.focus()');
                    ok(document.activeElement === input2, 'document.activeElement checked after element.focus()');

                    startNext();
                });
            });
        }, 2000);
});

asyncTest('B238617 - Label with "for" attribute focusing - non-valid "for"', function () {
    runAsyncTest(
        function () {
            const $label       = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', 'non-valid').appendTo('body');

            let labelFocused = false;

            $label[0].onfocus = function () {
                labelFocused = true;
            };

            focusBlurSandbox.focus($label[0], function () {
                ok(!labelFocused, 'label focus handler checked after FocusBlur.focus()');
                labelFocused = false;

                $label[0].blur();

                $label[0].focus();

                setDoubleTimeout(function () {
                    ok(!labelFocused, 'label focus handler checked after element.focus()');
                    startNext();
                });
            });
        }, 2000);
});

asyncTest('B238617 - Label with "for" attribute focusing - check no internal flag', function () {
    runAsyncTest(
        function () {
            let $label             = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', input2.id).appendTo('body');
            let labelProperties    = dumpProperties($label[0]);
            let newLabelProperties = [];

            focusBlurSandbox.focus($label[0], function () {
                $label.remove();
                input2.blur();

                $label             = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', input2.id).appendTo('body');
                labelProperties    = dumpProperties($label[0]);
                newLabelProperties = [];

                $label[0].focus();

                setDoubleTimeout(function () {
                    startNext();
                });

                newLabelProperties = dumpProperties($label[0]);
                deepEqual(getArrayDiff(labelProperties, newLabelProperties), getArrayDiff([], []), 'check properties');
            });

            newLabelProperties = dumpProperties($label[0]);
            deepEqual(getArrayDiff(labelProperties, newLabelProperties), getArrayDiff([], []), 'check properties');
        }, 2000);
});

asyncTest('B238617 - Label with "for" attribute focusing - non-valid "for", check no internal flag', function () {
    runAsyncTest(
        function () {
            let $label             = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', 'non-valid').appendTo('body');
            let labelProperties    = dumpProperties($label[0]);
            let newLabelProperties = [];

            focusBlurSandbox.focus($label[0], function () {
                $label.remove();

                $label             = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', 'non-valid').appendTo('body');
                labelProperties    = dumpProperties($label[0]);
                newLabelProperties = [];

                $label[0].focus();

                setDoubleTimeout(function () {
                    startNext();
                });

                newLabelProperties = dumpProperties($label[0]);
                deepEqual(getArrayDiff(labelProperties, newLabelProperties), getArrayDiff([], []), 'check properties');
            });

            newLabelProperties = dumpProperties($label[0]);
            deepEqual(getArrayDiff(labelProperties, newLabelProperties), getArrayDiff([], []), 'check properties');
        }, 2000);
});

asyncTest('B238599, B239799 - Div with parent with tabindex focusing', function () {
    runAsyncTest(
        function () {
            const $parentDiv = $('<div></div>').addClass(TEST_ELEMENT_CLASS).attr('tabIndex', '0').appendTo('body');
            const $input     = $('<input />').addClass(TEST_ELEMENT_CLASS).attr('tabIndex', '').attr('disabled', 'disabled').appendTo($parentDiv);

            let focused = false;

            $parentDiv[0].onfocus = function () {
                focused = true;
            };

            $input[0].focus();

            window.setTimeout(function () {
                ok(!focused);
                ok(document.activeElement !== $parentDiv[0]);

                focusBlurSandbox.focus($input[0], function () {
                    ok(focused, 'focus handler checked');
                    ok(document.activeElement === $parentDiv[0], 'document.activeElement checked');
                    startNext();
                }, false, true);
            }, 0);
        }, 2000);
});

asyncTest('B239136 - stack overflow exception when TestCafe dialog opened', function () {
    //Focus and blur without handlers when document was binded with the useCapture attribute
    runAsyncTest(
        function () {
            const $div   = $('<div></div>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
            const $input = $('<input />').addClass(TEST_ELEMENT_CLASS).appendTo($div);

            let focusCount = 0;
            let blurCount  = 0;

            const focusHandler = function () {
                focusCount++;
            };

            const blurHandler = function () {
                blurCount++;
            };

            document.addEventListener('focus', focusHandler, true);
            document.addEventListener('blur', blurHandler, true);
            $div[0].addEventListener('focus', focusHandler, true);
            $div[0].addEventListener('blur', blurHandler, true);

            focusBlurSandbox.focus($input[0], function () {
                focusBlurSandbox.blur($input[0], function () {
                    equal(focusCount, 0);
                    equal(blurCount, 0);

                    document.removeEventListener('focus', focusHandler, true);
                    document.removeEventListener('blur', blurHandler, true);
                    $div[0].removeEventListener('focus', focusHandler, true);
                    $div[0].removeEventListener('blur', blurHandler, true);

                    startNext();
                }, true);
            }, true);
        }, 2000);
});

asyncTest('B239273 - An Input\'s focusout event is not raised after click on a button in Firefox during test running', function () {
    runAsyncTest(function () {
        const $input        = $('<input>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $button       = $('<button type="button"></button>').addClass(TEST_ELEMENT_CLASS).appendTo('body');

        let focusOutCount = 0;

        $input.focusout(function () {
            focusOutCount++;
        });

        focusBlurSandbox.focus($input[0], function () {
            runClickAutomation($button[0], {})
                .then(function () {
                    equal(focusOutCount, 1);
                    startNext();
                });
        });

    }, 2000);
});

asyncTest('B251819 - Clicks on checkbox text don\'t change checkbox state during playback', function () {
    runAsyncTest(function () {
        const $label    = $('<label></label>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        const $checkbox = $('<input type="checkbox">').addClass(TEST_ELEMENT_CLASS).appendTo($label);
        const $span     = $('<span>test</span>').addClass(TEST_ELEMENT_CLASS).appendTo($label);

        runClickAutomation($span[0], {})
            .then(function () {
                ok($checkbox[0].checked);
                startNext();
            });
    }, 2000);
});

if (!browserUtils.isWebKit) {
    //NOTE: remove it after the B255523 fix
    asyncTest('B252392 - Blur event is not raised when an input becomes invisible during test running', function () {
        runAsyncTest(function () {
            $(input2).blur(blurListener);

            focusBlurSandbox.focus(input2, function () {
                $(input2).css('display', 'none');

                runClickAutomation(input1, {})
                    .then(function () {
                        equal(input2BlurHandlersExecutedAmount, 1, 'blur handler executing checked');
                        startNext();
                    });
            });
        }, 2000);
    });
}

asyncTest('B253577 - Focus handlers should be executed synchronously after mousedown', function () {
    runAsyncTest(function () {
        let mousedownHandled = false;
        let focusHandled     = false;
        let timeoutHandled   = false;

        $(input2).mousedown(function () {
            mousedownHandled = true;

            window.setTimeout(function () {
                timeoutHandled = true;
            }, 0);
        });

        $(input2).focus(function () {
            ok(mousedownHandled, 'check that mousedown handler was executed before focus');
            ok(!timeoutHandled, 'check that timeout was not handled before focus');
            focusHandled = true;
        });

        runClickAutomation(input2, {})
            .then(function () {
                ok(focusHandled, 'check that focus was handled');
                ok(timeoutHandled, 'check that timeout was handled');
                startNext();
            });
    }, 2000);
});

asyncTest('Change event not raised after press action if element was focused by client script', function () {
    runAsyncTest(function () {
        const pressAutomation = new PressAutomation(parseKeySequence('ctrl+a delete').combinations, {});

        let changed = false;

        input2.value = 'test';

        $(input2).change(function () {
            changed = true;
        });

        input2.focus();

        window.setTimeout(function () {
            pressAutomation
                .run()
                .then(function () {
                    return runClickAutomation(input1, {});
                })
                .then(function () {
                    ok(changed, 'change event was raised');
                    startNext();
                });
        }, 200);
    }, 3000);
});

asyncTest('change event must not be raised if element value was changed by blur handler (T110822)', function () {
    runAsyncTest(function () {
        let changed = false;

        input1.onblur   = function () {
            input1.value += 'test';
        };
        input1.onchange = function () {
            changed = true;
        };

        focusBlurSandbox.focus(input1, function () {
            focusBlurSandbox.blur(input1, function () {
                ok(!changed, 'change was not raised');

                startNext();
            });
        });
    }, 3000);
});

asyncTest('T229732 - Focus and blur events bubble but should not during test running', function () {
    runAsyncTest(function () {
        expect(4);

        const $div   = $('<div tabIndex="0"></div>').appendTo('body');
        const $input = $('<input type="text"/>').appendTo($div);
        const div    = $div[0];
        const input  = $input[0];

        let divFocusRaised   = false;
        let divBlurRaised    = false;
        let inputFocusRaised = false;
        let inputBlurRaised  = false;

        div.addEventListener('focus', function () {
            divFocusRaised = true;
        });

        div.addEventListener('blur', function () {
            divBlurRaised = true;
        });

        input.addEventListener('focus', function () {
            inputFocusRaised = true;
        });

        input.addEventListener('blur', function () {
            inputBlurRaised = true;
        });

        focusBlurSandbox.focus(input, function () {
            ok(!divFocusRaised);
            ok(inputFocusRaised);

            focusBlurSandbox.focus(input1, function () {
                ok(!divBlurRaised);
                ok(inputBlurRaised);

                startNext();
            });
        });
    }, 1000);
});

asyncTest('Hidden input should not be focused after label click', function () {
    runAsyncTest(function () {
        const div   = document.createElement('div');
        const label = document.createElement('label');
        const input = document.createElement('input');

        div.className       = TEST_ELEMENT_CLASS;
        label.className     = TEST_ELEMENT_CLASS;
        input.className     = TEST_ELEMENT_CLASS;
        input.id            = 'inputId';
        label.innerHTML     = 'label';
        div.style.display   = 'inline-block';
        input.style.display = 'none';

        label.setAttribute('for', 'inputId');

        document.body.appendChild(div);
        div.appendChild(label);
        div.appendChild(input);

        let inputFocused = false;

        input.addEventListener('focus', function () {
            inputFocused = true;
        });

        runClickAutomation(div, {})
            .then(function () {
                notOk(inputFocused);

                startNext();
            });
    }, 2000);
});
