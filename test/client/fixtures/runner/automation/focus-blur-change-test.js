var hammerhead     = window.getTestCafeModule('hammerhead');
var browser        = hammerhead.Util.Browser;
var focusBlur      = hammerhead.EventSandbox.FocusBlur;
var eventSimulator = hammerhead.EventSandbox.EventSimulator;

var testCafeCore = window.getTestCafeModule('testCafeCore');
var SETTINGS     = testCafeCore.get('./settings').get();

var testCafeRunner          = window.getTestCafeModule('testCafeRunner');
var automation              = testCafeRunner.get('./automation/automation');
var clickPlaybackAutomation = testCafeRunner.get('./automation/playback/click');
var typePlaybackAutomation  = testCafeRunner.get('./automation/playback/type');
var pressPlaybackAutomation = testCafeRunner.get('./automation/playback/press');

var testCafeUI = window.getTestCafeModule('testCafeUI');
var cursor     = testCafeUI.get('./cursor');

//ActionBarrier           = TestCafeClient.get('ActionBarrier'),

//ActionBarrier.init();
QUnit.begin(function () {
    automation.init();
    cursor.init();
});

var input1,
    input2,
    input1FocusHandlersExecutedAmount,
    input2FocusHandlersExecutedAmount,
    input1BlurHandlersExecutedAmount,
    input2BlurHandlersExecutedAmount,
    input1ChangeHandlersExecutedAmount,
    input2ChangeHandlersExecutedAmount,
    TEST_ELEMENT_CLASS           = 'testElement',
    testStartDelay               = 25,
    testEndDelay                 = 25,

    testTimeoutIds               = [],

    enableLogging                = false,
    prevRecordingValue           = SETTINGS.RECORDING,
    setDoubleTimeout             = function (callback, timeout) {
        if (!timeout)
            timeout = 0;
        window.setTimeout(function () {
            window.setTimeout(callback, timeout);
        }, 50);
    },
    logMessage                   = function (text) {
        if (enableLogging)
            ok(true, (new Date()).getSeconds() + ':' + (new Date()).getMilliseconds().toString() + ' ' + text)
    },
    startNext                    = function () {
        while (testTimeoutIds.length)
            clearTimeout(testTimeoutIds.pop());
        focusBlur.focus($('body')[0], function () {
            removeTestElements();
            if (browser.isIE)
                setDoubleTimeout(start, testEndDelay);
            else start();
        });
    },

    getFocusHandler              = function () {
        return function (e) {
            var e       = e || window.event,
                element = e.target || e.srcElement;
            if (element) {
                if (element.id === 'input1')
                    input1FocusHandlersExecutedAmount++;
                else if (element.id === 'input2')
                    input2FocusHandlersExecutedAmount++;
            }
            logMessage(' onfocus called for ' + element.id);
        };
    },

    getBlurHandler               = function () {
        return function (e) {
            var e       = e || window.event,
                element = e.target || e.srcElement;
            if (element) {
                if (element.id === 'input1')
                    input1BlurHandlersExecutedAmount++;
                else if (element.id === 'input2')
                    input2BlurHandlersExecutedAmount++;
            }
            logMessage(' onblur called for ' + element.id);
        }
    },

    getChangeHandler             = function () {
        return function (e) {
            var e       = e || window.event,
                element = e.target || e.srcElement;

            if (element) {
                if (element.id === 'input1')
                    input1ChangeHandlersExecutedAmount++;
                else if (element.id === 'input2')
                    input2ChangeHandlersExecutedAmount++;
            }
            logMessage(' onchange called for ' + element.id);
        }
    },

    onFocus                      = getFocusHandler(),
    focusListener                = getFocusHandler(),
    focusAttached                = getFocusHandler(),
    onBlur                       = getBlurHandler(),
    blurListener                 = getBlurHandler(),
    blurAttached                 = getBlurHandler(),
    onChange                     = getChangeHandler(),
    changeListener               = getChangeHandler(),
    changeAttached               = getChangeHandler(),

    clearExecutedHandlersCounter = function () {
        input1FocusHandlersExecutedAmount = input2FocusHandlersExecutedAmount = input1BlurHandlersExecutedAmount =
            input2BlurHandlersExecutedAmount = input1ChangeHandlersExecutedAmount = input2ChangeHandlersExecutedAmount = 0;
    },
    testFocusing                 = function (numberOfHandlers, testCanceled, testCallback) {
        var input1FocusedCount = 0,
            input1BlurredCount = 0,
            input2FocusedCount = 0,
            input2BlurredCount = 0;

        var focus = function (element, callback) {
            if (testCanceled()) return;
            if (element === input1) {
                input2BlurredCount += numberOfHandlers;
                input1FocusedCount += numberOfHandlers;
            }
            else if (element === input2) {
                input1BlurredCount += numberOfHandlers;
                input2FocusedCount += numberOfHandlers;
            }
            logMessage(' before focusing ' + element.id)
            focusBlur.focus(element, function () {
                logMessage(' focus function callback called for ' + element.id);
                callback();
            });
        };

        var assertFocusing = function (element, callback) {
            if (testCanceled()) return;
            strictEqual(document.activeElement, element, 'document.ActiveElement checked');
            strictEqual(input1FocusHandlersExecutedAmount, input1FocusedCount, 'input1FocusHandlersExecutedAmount checked');
            strictEqual(input2FocusHandlersExecutedAmount, input2FocusedCount, 'input2FocusHandlersExecutedAmount checked');
            strictEqual(input1BlurHandlersExecutedAmount, input1BlurredCount, 'input1BlurHandlersExecutedAmount checked');
            strictEqual(input2BlurHandlersExecutedAmount, input2BlurredCount, 'input2BlurHandlersExecutedAmount checked');
            callback();
        };

        window.async.series({
                firstInput1Focus: function (callback) {
                    focus(input1, callback);
                },

                assertFirstInput1Focus: function (callback) {
                    clearExecutedHandlersCounter();
                    input1FocusedCount = input1BlurredCount = input2FocusedCount = input2BlurredCount = 0;
                    assertFocusing(input1, callback);
                },

                firstInput2Focus: function (callback) {
                    focus(input2, callback);
                },

                assertFirstInput2Focus: function (callback) {
                    assertFocusing(input2, callback);
                },

                secondInput1Focus: function (callback) {
                    focus(input1, callback);
                },

                assertSecondInput1Focus: function (callback) {
                    assertFocusing(input1, callback);
                },

                secondInput2Focus: function (callback) {
                    focus(input2, callback);
                },

                assertSecondInput2Focus: function (callback) {
                    assertFocusing(input2, callback);
                },

                thirdInput1Focus: function (callback) {
                    focus(input1, callback);
                },

                assertThirdInput1Focus: function (callback) {
                    assertFocusing(input1, callback);
                },

                thirdInput2Focus: function (callback) {
                    focus(input2, callback);
                },

                assertThirdInput2Focus: function (callback) {
                    assertFocusing(input2, callback);
                },

                actionCallback: function () {
                    if (testCanceled()) return;
                    testCallback();
                }
            }
        );
    },
    testChanging                 = function (numberOfHandlers, testCanceled, testCallback) {
        var input1ChangedCount = 0,
            input2ChangedCount = 0;

        var focusAndType = function (element, callback) {
            if (testCanceled())
                return;

            focusBlur.focus(element, function () {
                assertChanging();
                if (element === input1)
                    input1ChangedCount += numberOfHandlers;
                else {
                    if (element === input2)
                        input2ChangedCount += numberOfHandlers;
                }
                element.value = element.value + 'a';
                callback();
            });
        };

        var assertChanging = function () {
            strictEqual(input1ChangeHandlersExecutedAmount, input1ChangedCount, 'input1ChangeHandlersExecutedAmount checked');
            strictEqual(input2ChangeHandlersExecutedAmount, input2ChangedCount, 'input2ChangeHandlersExecutedAmount checked');
        };

        window.async.series({
                firstInput1Focus: function (callback) {
                    clearExecutedHandlersCounter();
                    focusAndType(input1, callback);
                },

                firstInput2Focus: function (callback) {
                    focusAndType(input2, callback);
                },

                secondInput1Focus: function (callback) {
                    focusAndType(input1, callback);
                },

                secondInput2Focus: function (callback) {
                    focusAndType(input2, callback);
                },

                thirdInput1Focus: function (callback) {
                    focusAndType(input1, callback);
                },

                thirdInput2Focus: function (callback) {
                    focusAndType(input2, callback);
                },

                actionCallback: function () {
                    if (testCanceled()) return;
                    testCallback();
                }
            }
        );
    },
    runAsyncTest                 = function (actions, timeout) {
        var testCanceled;
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
    },

    removeTestElements           = function () {
        $('.' + TEST_ELEMENT_CLASS).remove();
    },

    dumpProperties               = function (element) {
        var props        = [],
            currentProps = [],
            i            = 0;

        while (element) {
            currentProps = Object.getOwnPropertyNames(element);

            for (i = 0; i < currentProps.length; i++) {
                if (props.indexOf(currentProps[i]) < 0)
                    props.push(currentProps[i]);
            }

            if (Object.getPrototypeOf)
                element = Object.getPrototypeOf(element);
            else
                element = element.__proto__;
        }

        return props;
    },
    getArrayDiff                 = function (a, b) {
        var i    = 0,
            diff = {
                deleted: [],
                added:   []
            };

        a = !a ? [] : a;
        b = !b ? [] : b;

        for (i = 0; i < a.length; i++) {
            if (b.indexOf(a[i]) < 0) {
                diff.deleted.push(a[i]);
            }
        }

        for (i = 0; i < b.length; i++) {
            if (a.indexOf(b[i]) < 0) {
                diff.added.push(b[i]);
            }
        }

        return diff;
    };

//tests
QUnit.testStart(function () {
    prevRecordingValue = SETTINGS.RECORDING;
    input1             = $('<input type="text" id="input1"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body').get(0);
    input2             = $('<input type="text" id="input2"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body').get(0);
    clearExecutedHandlersCounter();
});

QUnit.testDone(function () {
    SETTINGS.RECORDING = prevRecordingValue;
});

module('Regression tests');

asyncTest('B236526 - Change event raising if blur() is called by a client script', function () {
    runAsyncTest(
        function () {
            var changed     = false;
            input2.onchange = function () {
                changed = true;
            };
            focusBlur.focus(input2, function () {
                input2.value += "test";
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
            var changed     = false;
            input2.onchange = function () {
                changed = true;
            };
            input2.focus();
            typePlaybackAutomation(input2, 'test', {}, function () {
                focusBlur.focus(input1, function () {
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
            var input1changed = false,
                input2changed = false;
            input1.onchange   = function () {
                input1changed = true;
            };
            input2.onchange   = function () {
                input2changed = true;
            };
            typePlaybackAutomation(input1, 'test', {}, function () {
                typePlaybackAutomation(input2, 'test', {}, function () {
                    focusBlur.blur(input2, function () {
                        ok(input1changed);
                        ok(input2changed);
                        startNext();
                    });
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
            focusBlur.focus(input, function () {
                expect(2);
                startNext();
            });
        },
        1000
    );
});

if (browser.isIE)
    asyncTest('B237603 - two synchronously called focus() methods should raise an event once', function () {
        runAsyncTest(
            function () {
                focusBlur.focus(input2, function () {
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

asyncTest('B237723 - Error on http://phonejs.devexpress.com/Demos/?url=KitchenSink&sm=3 on recording', function () {
    runAsyncTest(
        function () {
            var iframeSrc = window.QUnitGlobals.getResourceUrl('../../../data/focus-blur-change/iframe.html');
            var $iframe   = $('<iframe></iframe>')
                .addClass(TEST_ELEMENT_CLASS)
                .attr('src', iframeSrc)
                .appendTo('body');

            var errorRaised = false;

            $iframe.load(function () {
                try {
                    $iframe[0].contentWindow.focusInput();
                }
                catch (err) {
                    errorRaised = true;
                }

                ok(!errorRaised, 'error is not raised');
                startNext();
            });
        }, 2000);
});

asyncTest('B238617 - Label with "for" attribute focusing', function () {
    runAsyncTest(
        function () {
            var $label       = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', input2.id).appendTo('body'),
                labelFocused = false,
                inputFocused = false;

            $label[0].onfocus = function () {
                labelFocused = true;
            };
            input2.onfocus    = function () {
                inputFocused = true;
            };

            focusBlur.focus($label[0], function () {
                ok(!labelFocused, 'label focus handler checked after FocusBlur.focus()');
                ok(inputFocused, 'input focus handler checked after FocusBlur.focus()');
                if (!browser.isIE)
                    ok(document.activeElement === input2, 'document.activeElement checked after FocusBlur.focus()');
                labelFocused = false;
                inputFocused = false;
                input2.blur();
                $label[0].focus();
                setDoubleTimeout(function () {
                    ok(!labelFocused, 'label focus handler checked after element.focus()');
                    ok(inputFocused, 'input focus handler checked after FocusBlur.focus()');
                    if (!browser.isIE)
                        ok(document.activeElement === input2, 'document.activeElement checked after element.focus()');
                    startNext();
                });
            });
        }, 2000);
});

asyncTest('B238617 - Label with "for" attribute focusing - non-valid "for"', function () {
    runAsyncTest(
        function () {
            var $label       = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', 'non-valid').appendTo('body'),
                labelFocused = false;

            $label[0].onfocus = function () {
                labelFocused = true;
            };

            focusBlur.focus($label[0], function () {
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
            var $label             = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', input2.id).appendTo('body'),
                labelProperties    = dumpProperties($label[0]),
                newLabelProperties = [];

            focusBlur.focus($label[0], function () {
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
            newLabelProperties     = dumpProperties($label[0]);
            deepEqual(getArrayDiff(labelProperties, newLabelProperties), getArrayDiff([], []), 'check properties');

        }, 2000);
});

asyncTest('B238617 - Label with "for" attribute focusing - non-valid "for", check no internal flag', function () {
    runAsyncTest(
        function () {
            var $label             = $('<label>label</label>').addClass(TEST_ELEMENT_CLASS).attr('for', 'non-valid').appendTo('body'),
                labelProperties    = dumpProperties($label[0]),
                newLabelProperties = [];

            focusBlur.focus($label[0], function () {
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
            newLabelProperties     = dumpProperties($label[0]);
            deepEqual(getArrayDiff(labelProperties, newLabelProperties), getArrayDiff([], []), 'check properties');

        }, 2000);
});

asyncTest('B238599, B239799 - Div with parent with tabindex focusing', function () {
    runAsyncTest(
        function () {
            var $parentDiv        = $('<div></div>').addClass(TEST_ELEMENT_CLASS).attr('tabIndex', '0').appendTo('body'),
                $input            = $('<input />').addClass(TEST_ELEMENT_CLASS).attr('tabIndex', '').attr('disabled', 'disabled').appendTo($parentDiv),
                focused           = false;
            $parentDiv[0].onfocus = function () {
                focused = true;
            };

            $input[0].focus();

            window.setTimeout(function () {
                ok(!focused);
                ok(document.activeElement !== $parentDiv[0]);

                focusBlur.focus($input[0], function () {
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
            var $div   = $('<div></div>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
                $input = $('<input />').addClass(TEST_ELEMENT_CLASS).appendTo($div);

            var focusCount = 0,
                blurCount  = 0;

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

            focusBlur.focus($input[0], function () {
                focusBlur.blur($input[0], function () {
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
        var $input        = $('<input>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $button       = $('<button type="button"></button>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            focusOutCount = 0;

        $input.focusout(function () {
            focusOutCount++;
        });

        focusBlur.focus($input[0], function () {
            clickPlaybackAutomation($button[0], {}, function () {
                equal(focusOutCount, 1);
                startNext();
            });
        });

    }, 2000);
});

asyncTest('B251819 - Clicks on checkbox text don\'t change checkbox state during playback', function () {
    runAsyncTest(function () {
        var $label    = $('<label></label>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
            $checkbox = $('<input type="checkbox">').addClass(TEST_ELEMENT_CLASS).appendTo($label),
            $span     = $('<span>test</span>').addClass(TEST_ELEMENT_CLASS).appendTo($label);

        clickPlaybackAutomation($span[0], {}, function () {
            ok($checkbox[0].checked);
            startNext();
        });

    }, 2000);
});

if (!browser.isWebKit) {
    //NOTE: remove it after the B255523 fix
    asyncTest('B252392 - Blur event is not raised when an input becomes invisible during test running', function () {
        runAsyncTest(function () {
            $(input2).blur(blurListener);

            focusBlur.focus(input2, function () {
                $(input2).css('display', 'none');
                clickPlaybackAutomation(input1, {}, function () {
                    equal(input2BlurHandlersExecutedAmount, 1, 'blur handler executing checked');
                    startNext();
                });
            });
        }, 2000);
    });
}

asyncTest('B253577 - Focus handlers should be executed synchronously after mousedown', function () {
    runAsyncTest(function () {
        var mousedownHandled = false,
            focusHandled     = false,
            timeoutHandled   = false;

        $(input2).mousedown(function () {
            mousedownHandled = true;
            window.setTimeout(function () {
                timeoutHandled = true;
            }, 0)
        });

        $(input2).focus(function () {
            ok(mousedownHandled, 'check that mousedown handler was executed before focus');
            ok(!timeoutHandled, 'check that timeout was not handled before focus');
            focusHandled = true;
        });

        clickPlaybackAutomation(input2, {}, function () {
            ok(focusHandled, 'check that focus was handled');
            ok(timeoutHandled, 'check that timeout was handled');
            startNext();
        });
    }, 2000);
});

asyncTest('B253735 - Blur event is raised twice in IE if element has zero width and height', function () {
    runAsyncTest(function () {
        $(input2).blur(blurListener);

        focusBlur.focus(input2, function () {
            $(input2).width(0);
            $(input2).height(0);
            $(input2).css('border', '0px');
            $(input2).css('margin', '0px');
            $(input2).css('padding', '0px');
            setDoubleTimeout(function () {
                focusBlur.focus(input1, function () {
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

if (browser.isIE && browser.version < 12)
    asyncTest('focus method must not have effect if it is called from focus event handler on its second phase (AT_TARGET) in IE', function () {
        runAsyncTest(function () {
            var $parentDiv  = $('<div tabindex="0"></div>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
                $childTable = $('<table><tbody><tr><td></td></tr></tbody></table>').addClass(TEST_ELEMENT_CLASS).appendTo($parentDiv),
                startTime,
                timeout     = 2000,
                focusCount  = 0,
                bindFocus   = function (element) {
                    element.addEventListener('focus', function (e) {
                        focusCount++;
                        //this code prevent page hanging
                        if (Date.now() - startTime < timeout) {
                            if (document.activeElement !== this) {
                                var savedActiveElement   = document.activeElement;
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
            focusBlur.focus($childTable.find('td')[0], function () {
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

if (browser.isIE)
    asyncTest('focus and blur methods must raise events asynchronously and change active element synchronously in IE', function () {
        runAsyncTest(function () {
            var $input             = $('<input type="text"/>').addClass(TEST_ELEMENT_CLASS).appendTo('body'),
                focusHandled       = false,
                blurHandled        = false,
                savedActiveElement = document.activeElement;

            $input.focus(function () {
                focusHandled = true;
            });
            $input.blur(function () {
                blurHandled = true;
            });
            $input[0].focus();
            ok(savedActiveElement !==
               document.activeElement, 'check that active element was changed synchronously after focus');
            savedActiveElement     = document.activeElement;

            if (browser.version < 12)
                ok(!focusHandled, 'check that focus event was not raised synchronously after focus() method calling');

            window.setTimeout(function () {
                ok(focusHandled, 'check that focus event was raised');
                $input[0].blur();
                ok(savedActiveElement !==
                   document.activeElement, 'check that active element was changed synchronously after blur');

                if (browser.version < 12)
                    ok(!blurHandled, 'check that blur event was not raised synchronously after blur() method calling');

                window.setTimeout(function () {
                    ok(blur, 'check that blur event was raised');
                    startNext();
                }, 0);
            }, 200);
        }, 3000);
    });

asyncTest('Change event not raised after press action if element was focused by client script', function () {
    runAsyncTest(function () {
        var changed  = false;
        input2.value = 'test';
        $(input2).change(function () {
            changed = true;
        });
        input2.focus();
        window.setTimeout(function () {
            pressPlaybackAutomation('ctrl+a delete', function () {
                clickPlaybackAutomation(input1, {}, function () {
                    ok(changed, 'change event was raised');
                    startNext();
                });
            });
        }, 200);
    }, 3000);
});

if (browser.isIE)
    asyncTest('B254768 - Blur event should be raised after focus event, if element becomes invisible synchronously after focus() method executing', function () {
        runAsyncTest(function () {
            var focused          = false,
                blurred          = false,
                lastEvent        = undefined;

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

asyncTest('B254775 - Click action on already focused element must not raise focus event even if element was blurred on mousedown in IE', function () {
    runAsyncTest(function () {
        var focused = false,
            blurred = false;

        focusBlur.focus(input2, function () {
            input2.addEventListener('focus', function (e) {
                focused = true;
            });
            input2.addEventListener('blur', function (e) {
                blurred = true;
            });
            input2.addEventListener('mousedown', function (e) {
                e.target.blur();
            });
            clickPlaybackAutomation(input2, {}, function () {
                ok(blurred, 'blur event was raised');
                if (browser.isIE) {
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
if (browser.isIE) {
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
                if (browser.version < 12)
                    equal(state.join(''), '1234567');
                else
                    equal(state.join(''), '1354267');
                startNext();
            }, 200);
        }, 3000);
    });

    asyncTest('incorrect handlers queue bug (setInterval)', function () {
        runAsyncTest(function () {
            var intervalFunctionCalled = false,
                focusRaised            = false;

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

                if (browser.version < 12)
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
            input1.value = input1.value + 'test';
        };
        input1.onchange = function () {
            changed = true;
        };

        focusBlur.focus(input1, function () {
            focusBlur.blur(input1, function () {
                ok(!changed, 'change was not raised');

                startNext();
            });
        });
    }, 3000);
});

asyncTest('T229732 - Focus and blur events bubble but should not during test running', function () {
    runAsyncTest(function () {
        expect(4);

        var $div             = $('<div tabIndex="0"></div>').appendTo('body'),
            $input           = $('<input type="text"/>').appendTo($div),
            div              = $div[0],
            input            = $input[0],

            divFocusRaised   = false,
            divBlurRaised    = false,
            inputFocusRaised = false,
            inputBlurRaised  = false;

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

        focusBlur.focus(input, function () {
            ok(!divFocusRaised);
            ok(inputFocusRaised);

            focusBlur.focus(input1, function () {
                ok(!divBlurRaised);
                ok(inputBlurRaised);

                startNext();
            });
        });
    }, 1000);
});

asyncTest('T231934 - Native focus method raises event handlers twice in IE in recorder - RECORDING', function () {
    SETTINGS.RECORDING = true;
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
