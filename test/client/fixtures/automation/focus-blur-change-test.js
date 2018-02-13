var hammerhead       = window.getTestCafeModule('hammerhead');
var browserUtils     = hammerhead.utils.browser;
var nativeMethods    = hammerhead.nativeMethods;
var focusBlurSandbox = hammerhead.eventSandbox.focusBlur;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;

var testCafeCore       = window.getTestCafeModule('testCafeCore');
var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');

var ClickOptions = testCafeAutomation.get('../../test-run/commands/options').ClickOptions;
var TypeOptions  = testCafeAutomation.get('../../test-run/commands/options').TypeOptions;

var ClickAutomation = testCafeAutomation.Click;
var TypeAutomation  = testCafeAutomation.Type;
var PressAutomation = testCafeAutomation.Press;

var parseKeySequence = testCafeCore.get('./utils/parse-key-sequence');
var getOffsetOptions = testCafeAutomation.getOffsetOptions;

testCafeCore.preventRealEvents();

var input1                           = null;
var input2                           = null;
var input2BlurHandlersExecutedAmount = null;
var TEST_ELEMENT_CLASS               = 'testElement';
var testStartDelay                   = 25;
var testEndDelay                     = 25;

var testTimeoutIds = [];

var enableLogging = false;

var setDoubleTimeout = function (callback, timeout) {
    if (!timeout)
        timeout = 0;

    window.setTimeout(function () {
        window.setTimeout(callback, timeout);
    }, 50);
};

var logMessage = function (text) {
    if (enableLogging)
        ok(true, (new Date()).getSeconds() + ':' + (new Date()).getMilliseconds().toString() + ' ' + text);
};

var getBlurHandler = function () {
    return function (e) {
        e           = e || window.event;
        var element = e.target || e.srcElement;

        if (element && element.id === 'input2')
            input2BlurHandlersExecutedAmount++;

        logMessage(' onblur called for ' + element.id);
    };
};

var blurListener = getBlurHandler();

var clearExecutedHandlersCounter = function () {
    input2BlurHandlersExecutedAmount = 0;
};

var removeTestElements = function () {
    $('.' + TEST_ELEMENT_CLASS).remove();
};

var startNext = function () {
    while (testTimeoutIds.length)
        clearTimeout(testTimeoutIds.pop());

    focusBlurSandbox.focus($('body')[0], function () {
        removeTestElements();

        if (browserUtils.isIE)
            setDoubleTimeout(start, testEndDelay);
        else
            start();
    });
};

var runAsyncTest = function (actions, timeout) {
    var testCanceled = null;

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

var dumpProperties = function (element) {
    var props        = [];
    var currentProps = [];
    var i            = 0;

    while (element) {
        currentProps = Object.getOwnPropertyNames(element);

        for (i = 0; i < currentProps.length; i++) {
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

var getArrayDiff = function (a, b) {
    var i    = 0;
    var diff = {
        deleted: [],
        added:   []
    };

    a = !a ? [] : a;
    b = !b ? [] : b;

    for (i = 0; i < a.length; i++) {
        if (b.indexOf(a[i]) < 0)
            diff.deleted.push(a[i]);
    }

    for (i = 0; i < b.length; i++) {
        if (a.indexOf(b[i]) < 0)
            diff.added.push(b[i]);
    }

    return diff;
};

var runClickAutomation = function (el, options) {
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

    var clickAutomation = new ClickAutomation(el, clickOptions);

    return clickAutomation.run();
};

var runTypeAutomation = function (element, text) {
    var offsets     = getOffsetOptions(element);
    var typeOptions = new TypeOptions({
        offsetX: offsets.offsetX,
        offsetY: offsets.offsetY
    });

    var typeAutomation = new TypeAutomation(element, text, typeOptions);

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
            var changed = false;

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
            var changed = false;

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
            var input1changed = false;
            var input2changed = false;

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

asyncTest('B237489 - act.press("left") does not work in IE', function () {
    runAsyncTest(
        function () {
            var input = $('<input type="text"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body')[0];

            input.addEventListener('focus', function () {
                ok(document.activeElement === input);
            });

            ok(document.activeElement !== input);

            focusBlurSandbox.focus(input, function () {
                expect(2);
                startNext();
            });
        },
        1000
    );
});

if (browserUtils.isIE) {
    asyncTest('B237603 - two synchronously called focus() methods should raise an event once', function () {
        runAsyncTest(
            function () {
                focusBlurSandbox.focus(input2, function () {
                    var focusCount = 0;

                    input1.onfocus = function () {
                        focusCount++;
                    };

                    input1.focus();
                    input1.focus();

                    ok(document.activeElement === input1);

                    setDoubleTimeout(function () {
                        ok(focusCount === 1);
                        startNext();
                    });
                });
            },
            1000
        );
    });
}

asyncTest('B238617 - Label with "for" attribute focusing', function () {
    runAsyncTest(
        function () {
            var $label       = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', input2.id).appendTo('body');
            var labelFocused = false;
            var inputFocused = false;

            $label[0].onfocus = function () {
                labelFocused = true;
            };

            input2.onfocus = function () {
                inputFocused = true;
            };

            focusBlurSandbox.focus($label[0], function () {
                ok(!labelFocused, 'label focus handler checked after FocusBlur.focus()');
                ok(inputFocused, 'input focus handler checked after FocusBlur.focus()');

                if (!browserUtils.isIE)
                    ok(document.activeElement === input2, 'document.activeElement checked after FocusBlur.focus()');

                labelFocused = false;
                inputFocused = false;
                input2.blur();
                $label[0].focus();

                setDoubleTimeout(function () {
                    ok(!labelFocused, 'label focus handler checked after element.focus()');
                    ok(inputFocused, 'input focus handler checked after FocusBlur.focus()');

                    if (!browserUtils.isIE)
                        ok(document.activeElement === input2, 'document.activeElement checked after element.focus()');

                    startNext();
                });
            });
        }, 2000);
});

asyncTest('B238617 - Label with "for" attribute focusing - non-valid "for"', function () {
    runAsyncTest(
        function () {
            var $label       = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', 'non-valid').appendTo('body');
            var labelFocused = false;

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
            var $label             = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', input2.id).appendTo('body');
            var labelProperties    = dumpProperties($label[0]);
            var newLabelProperties = [];

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
            var $label             = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', 'non-valid').appendTo('body');
            var labelProperties    = dumpProperties($label[0]);
            var newLabelProperties = [];

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
            var $parentDiv = $('<div></div>').addClass(TEST_ELEMENT_CLASS).attr('tabIndex', '0').appendTo('body');
            var $input     = $('<input />').addClass(TEST_ELEMENT_CLASS).attr('tabIndex', '').attr('disabled', 'disabled').appendTo($parentDiv);
            var focused    = false;

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
            var $div   = $('<div></div>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
            var $input = $('<input />').addClass(TEST_ELEMENT_CLASS).appendTo($div);

            var focusCount = 0;
            var blurCount  = 0;

            var focusHandler = function () {
                focusCount++;
            };

            var blurHandler = function () {
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
        var $input        = $('<input>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $button       = $('<button type="button"></button>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var focusOutCount = 0;

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
        var $label    = $('<label></label>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
        var $checkbox = $('<input type="checkbox">').addClass(TEST_ELEMENT_CLASS).appendTo($label);
        var $span     = $('<span>test</span>').addClass(TEST_ELEMENT_CLASS).appendTo($label);

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
        var mousedownHandled = false;
        var focusHandled     = false;
        var timeoutHandled   = false;

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

asyncTest('B253735 - Blur event is raised twice in IE if element has zero width and height', function () {
    runAsyncTest(function () {
        $(input2).blur(blurListener);

        focusBlurSandbox.focus(input2, function () {
            $(input2).width(0);
            $(input2).height(0);
            $(input2).css('border', '0px');
            $(input2).css('margin', '0px');
            $(input2).css('padding', '0px');

            setDoubleTimeout(function () {
                focusBlurSandbox.focus(input1, function () {
                    setDoubleTimeout(function () {
                        ok(!$(input2).is(':visible'), 'check that element becomes invisible because of zero rectangle');
                        equal(input2BlurHandlersExecutedAmount, 1, 'blur handler executing checked');
                        startNext();
                    });
                });
            });
        });
    }, 2000);
});

if (browserUtils.isIE && browserUtils.version < 12) {
    asyncTest('focus method must not have effect if it is called from focus event handler on its second phase (AT_TARGET) in IE', function () {
        runAsyncTest(function () {
            var $parentDiv  = $('<div tabindex="0"></div>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
            var $childTable = $('<table><tbody><tr><td></td></tr></tbody></table>').addClass(TEST_ELEMENT_CLASS).appendTo($parentDiv);
            var startTime   = null;
            var timeout     = 2000;
            var focusCount  = 0;

            var bindFocus = function (element) {
                element.addEventListener('focus', function (e) {
                    focusCount++;

                    //this code prevent page hanging
                    if (Date.now() - startTime < timeout) {
                        if (document.activeElement !== this) {
                            var savedActiveElement = document.activeElement;

                            element.focus();
                            var activeElementChanged = savedActiveElement !== document.activeElement;

                            if (e.eventPhase === 2)
                                ok(!activeElementChanged, 'check that active element was not changed after calling focus() on second event phase');
                            else
                                ok(activeElementChanged, 'check that active element was changed after calling focus()');
                        }
                    }
                    else
                        ok(false, 'timeout is exceeded');
                }, true);
            };


            startTime = Date.now();
            bindFocus($childTable[0]);
            bindFocus($parentDiv[0]);

            focusBlurSandbox.focus($childTable.find('td')[0], function () {
                window.setTimeout(function () {
                    //6 focus handlers must be called. 1 and 2 - on event capturing phase for parent and child.
                    //3 - when parent calls focus for himself. 4,5 - when child calls focus for himself (handled by both parent and child)
                    //6 - when parent calls focus for himself in the second time.
                    equal(focusCount, 6, 'checked number of focus handlers executed');
                    startNext();
                }, 500);
            });

        }, 4000);
    });
}

if (browserUtils.isIE) {
    asyncTest('focus and blur methods must raise events asynchronously and change active element synchronously in IE', function () {
        runAsyncTest(function () {
            var $input             = $('<input type="text"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body');
            var focusHandled       = false;
            var blurHandled        = false;
            var savedActiveElement = document.activeElement;

            $input.focus(function () {
                focusHandled = true;
            });

            $input.blur(function () {
                blurHandled = true;
            });

            $input[0].focus();

            ok(savedActiveElement !==
               document.activeElement, 'check that active element was changed synchronously after focus');

            savedActiveElement = document.activeElement;

            if (browserUtils.version < 12)
                ok(!focusHandled, 'check that focus event was not raised synchronously after focus() method calling');

            window.setTimeout(function () {
                ok(focusHandled, 'check that focus event was raised');
                $input[0].blur();

                ok(savedActiveElement !==
                   document.activeElement, 'check that active element was changed synchronously after blur');

                if (browserUtils.version < 12)
                    ok(!blurHandled, 'check that blur event was not raised synchronously after blur() method calling');

                window.setTimeout(function () {
                    ok(blur, 'check that blur event was raised');
                    startNext();
                }, 0);
            }, 200);
        }, 3000);
    });
}

asyncTest('Change event not raised after press action if element was focused by client script', function () {
    runAsyncTest(function () {
        var changed         = false;
        var pressAutomation = new PressAutomation(parseKeySequence('ctrl+a delete').combinations, {});

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

if (browserUtils.isIE) {
    asyncTest('B254768 - Blur event should be raised after focus event, if element becomes invisible synchronously after focus() method executing', function () {
        runAsyncTest(function () {
            var focused   = false;
            var blurred   = false;
            var lastEvent = void 0;

            input2.addEventListener('focus', function (e) {
                focused   = true;
                lastEvent = e.type;
            });
            input2.addEventListener('blur', function (e) {
                blurred   = true;
                lastEvent = e.type;
            });

            input2.focus();
            input2.style.display = 'none';

            window.setTimeout(function () {
                ok(focused, 'focus raised');
                ok(blurred, 'blur raised');
                equal(lastEvent, 'blur', 'last raised event is blur');
                startNext();
            }, 200);

        }, 3000);
    });
}

asyncTest('B254775 - Click action on already focused element must not raise focus event even if element was blurred on mousedown in IE', function () {
    runAsyncTest(function () {
        var focused = false;
        var blurred = false;

        focusBlurSandbox.focus(input2, function () {
            input2.addEventListener('focus', function () {
                focused = true;
            });
            input2.addEventListener('blur', function () {
                blurred = true;
            });
            input2.addEventListener('mousedown', function (e) {
                e.target.blur();
            });

            runClickAutomation(input2, {})
                .then(function () {
                    ok(blurred, 'blur event was raised');

                    if (browserUtils.isIE) {
                        ok(!focused, 'focus event was not raised');
                        ok(document.activeElement !== input2, 'element is not focused');
                    }
                    else {
                        ok(focused, 'focus event was raised');
                        ok(document.activeElement === input2, 'element is focused');
                    }
                    startNext();
                });
        });
    }, 3000);
});

//NOTE: it's actual for IE only
if (browserUtils.isIE) {
    asyncTest('incorrect handlers queue bug (setTimeout)', function () {
        runAsyncTest(function () {
            var state = [];

            input1.addEventListener('focus', function () {
                state.push('3');

                window.setTimeout(function () {
                    state.push('7');
                }, 0);

                input2.focus();
                state.push('4');
            });

            input2.addEventListener('focus', function () {
                state.push('5');
            });

            state.push('1');

            window.setTimeout(function () {
                state.push('6');
            }, 0);

            input1.focus();

            state.push('2');

            window.setTimeout(function () {
                if (browserUtils.version < 12)
                    equal(state.join(''), '1234567');
                else
                    equal(state.join(''), '1354267');

                startNext();
            }, 200);
        }, 3000);
    });

    asyncTest('incorrect handlers queue bug (setInterval)', function () {
        runAsyncTest(function () {
            var intervalFunctionCalled = false;
            var focusRaised            = false;

            window.setInterval(function () {
                intervalFunctionCalled = true;
            }, 0);

            window.setTimeout(function () {
                ok(intervalFunctionCalled, 'check that interval function was called');
                intervalFunctionCalled = false;

                input2.addEventListener('focus', function () {
                    ok(!intervalFunctionCalled, 'check that interval function was not called before focus handler');
                    focusRaised = true;
                });

                input2.focus();

                if (browserUtils.version < 12)
                    ok(!focusRaised, 'check that focus handler was not executed synchronously after focus() method calling');

                window.setTimeout(function () {
                    ok(focusRaised, 'check that focus handler was executed');
                    ok(intervalFunctionCalled, 'check that interval function was called');

                    startNext();
                }, 100);
            }, 100);
        }, 3000);
    });
}

asyncTest('change event must not be raised if element value was changed by blur handler (T110822)', function () {
    runAsyncTest(function () {
        var changed = false;

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

        var $div   = $('<div tabIndex="0"></div>').appendTo('body');
        var $input = $('<input type="text"/>').appendTo($div);
        var div    = $div[0];
        var input  = $input[0];

        var divFocusRaised   = false;
        var divBlurRaised    = false;
        var inputFocusRaised = false;
        var inputBlurRaised  = false;

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


asyncTest('T231934 - Native focus method raises event handlers twice in IE in recorder - TEST RUNNING', function () {
    runAsyncTest(
        function () {
            var focusCount = 0;

            input2.addEventListener('focus', function () {
                focusCount++;
            });

            eventSimulator.focus(input2);
            input1.focus();

            input2.focus();

            setDoubleTimeout(function () {
                equal(focusCount, 2);

                startNext();
            }, 1000);
        },
        2000
    );
});
