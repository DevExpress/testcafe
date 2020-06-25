const hammerhead       = window.getTestCafeModule('hammerhead');
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;
const shadowUI         = hammerhead.shadowUI;

const testCafeCore     = window.getTestCafeModule('testCafeCore');
const parseKeySequence = testCafeCore.parseKeySequence;

testCafeCore.preventRealEvents();

const testCafeAutomation         = window.getTestCafeModule('testCafeAutomation');
const ClickOptions               = testCafeAutomation.ClickOptions;
const PressAutomation            = testCafeAutomation.Press;
const DblClickAutomation         = testCafeAutomation.DblClick;
const ClickAutomation            = testCafeAutomation.Click;
const SelectChildClickAutomation = testCafeAutomation.SelectChildClick;
const getOffsetOptions           = testCafeAutomation.getOffsetOptions;

const testCafeUI    = window.getTestCafeModule('testCafeUI');
const selectElement = testCafeUI.selectElement;

$(document).ready(function () {
    //consts
    const TEST_ELEMENT_CLASS = 'testElement';
    const OPTION_CLASS       = 'tcOption';
    const OPTION_GROUP_CLASS = 'tcOptionGroup';
    const OPTION_LIST_CLASS  = 'tcOptionList';

    //utils
    const isMobileBrowser = featureDetection.isTouchDevice;

    let handlersLog = [];

    const createOption = function (parent, text) {
        return $('<option></option>').text(text)
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo(parent);
    };

    const createOptionGroup = function (select, label) {
        return $('<optgroup></optgroup>').attr('label', label)
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo(select)[0];
    };

    const createSelect = function (size) {
        const select = $('<select><select/>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body')[0];

        createOption(select, 'one');
        createOption(select, 'two');
        createOption(select, 'three');
        createOption(select, 'four');
        createOption(select, 'five');

        if (size)
            $(select).attr('size', size);

        return select;
    };

    const createSelectWithGroups = function () {
        const select = $('<select><select/>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body')[0];

        const firstGroup = createOptionGroup(select, 'First');

        createOption(firstGroup, 'one');
        createOption(firstGroup, 'two');
        createOption(firstGroup, 'three');

        const secondGroup = createOptionGroup(select, 'Second');

        createOption(secondGroup, 'four');
        createOption(secondGroup, 'five');
        createOption(secondGroup, 'six');

        const thirdGroup = createOptionGroup(select, 'Third');

        createOption(thirdGroup, 'sevent');
        createOption(thirdGroup, 'eight');
        createOption(thirdGroup, 'nine');
        return select;
    };

    const createSelectWithGroupsForCheckPress = function () {
        const select = $('<select><select/>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo('body')[0];

        const firstGroup = createOptionGroup(select, 'Group 1');

        createOption(firstGroup, 'one');

        const secondGroup = createOptionGroup(select, 'Group 2');

        createOption(secondGroup, 'two');

        const thirdGroup = createOptionGroup(select, 'Group 3');

        createOption(thirdGroup, 'thee');
        $(thirdGroup).attr('disabled', 'disabled');

        createOption(select, 'four');

        return select;
    };

    const runPressAutomation = function (keys, callback) {
        const pressAutomation = new PressAutomation(parseKeySequence(keys).combinations, {});

        pressAutomation
            .run()
            .then(callback);
    };

    const runDblClickAutomation = function (el, options, callback) {
        const clickOptions = new ClickOptions();
        const offsets      = getOffsetOptions(el, options.offsetX, options.offsetY);

        clickOptions.offsetX  = offsets.offsetX;
        clickOptions.offsetY  = offsets.offsetY;
        clickOptions.caretPos = options.caretPos;

        clickOptions.modifiers = {
            ctrl:  options.ctrl,
            alt:   options.ctrl,
            shift: options.shift,
            meta:  options.meta
        };

        const dblClickAutomation = new DblClickAutomation(el, clickOptions);

        dblClickAutomation
            .run()
            .then(callback);
    };

    const preventDefault = function (e) {
        const ev = e || window.event;

        if (ev.preventDefault)
            ev.preventDefault();
        else
            ev.returnValue = false;
    };

    const eventHandler = function (e) {
        if (e.target === this)
            handlersLog.push(e.target.tagName.toLowerCase() + ' ' + e.type);
    };

    const bindSelectAndOptionHandlers = function ($select, $option) {
        $select.bind('mousedown', eventHandler);
        $select.bind('mouseup', eventHandler);
        $select.bind('click', eventHandler);
        $select.bind('change', eventHandler);
        $select.bind('input', eventHandler);

        if ($option) {
            $option.bind('mousedown', eventHandler);
            $option.bind('mouseup', eventHandler);
            $option.bind('click', eventHandler);
        }
    };

    $('body').css('height', 1500);

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

    const pressDownUpKeysActions = function (select) {
        window.async.series({
            firstPressDownAction: function (callback) {
                equal(select.selectedIndex, 0);

                runPressAutomation('down', function () {
                    equal(select.selectedIndex, 1);
                    callback();
                });
            },

            secondPressDownAction: function (callback) {
                equal(select.selectedIndex, 1);

                runPressAutomation('down', function () {
                    equal(select.selectedIndex, 2);
                    callback();
                });
            },

            thirdPressDownAction: function (callback) {
                equal(select.selectedIndex, 2);

                runPressAutomation('down', function () {
                    equal(select.selectedIndex, 3);
                    callback();
                });
            },

            fourthPressDownAction: function (callback) {
                equal(select.selectedIndex, 3);

                runPressAutomation('down', function () {
                    equal(select.selectedIndex, 4);
                    callback();
                });
            },

            firstPressUpAction: function (callback) {
                equal(select.selectedIndex, 4);

                runPressAutomation('up', function () {
                    equal(select.selectedIndex, 3);
                    callback();
                });
            },

            secondPressUpAction: function (callback) {
                equal(select.selectedIndex, 3);

                runPressAutomation('up', function () {
                    equal(select.selectedIndex, 2);
                    callback();
                });
            },

            thirdPressUpAction: function (callback) {
                equal(select.selectedIndex, 2);

                runPressAutomation('up', function () {
                    equal(select.selectedIndex, 1);
                    callback();
                });
            },

            fourthPressUpAction: function () {
                equal(select.selectedIndex, 1);

                runPressAutomation('up', function () {
                    equal(select.selectedIndex, 0);
                    startNext();
                });
            }
        });
    };

    const pressRightLeftKeysActions = function (select) {
        window.async.series({
            firstPressRightAction: function (callback) {
                equal(select.selectedIndex, 0);

                runPressAutomation('right', function () {
                    equal(select.selectedIndex, browserUtils.isFirefox ? 1 : 0);
                    callback();
                });
            },

            secondPressRightAction: function (callback) {
                equal(select.selectedIndex, browserUtils.isFirefox ? 1 : 0);

                runPressAutomation('right', function () {
                    equal(select.selectedIndex, browserUtils.isFirefox ? 2 : 0);
                    callback();
                });
            },

            thirdPressRightAction: function (callback) {
                equal(select.selectedIndex, browserUtils.isFirefox ? 2 : 0);

                runPressAutomation('right', function () {
                    equal(select.selectedIndex, browserUtils.isFirefox ? 3 : 0);
                    callback();
                });
            },

            fourthPressRightAction: function (callback) {
                equal(select.selectedIndex, browserUtils.isFirefox ? 3 : 0);

                runPressAutomation('right', function () {
                    equal(select.selectedIndex, browserUtils.isFirefox ? 4 : 0);
                    callback();
                });
            },

            firstPressLeftAction: function (callback) {
                equal(select.selectedIndex, browserUtils.isFirefox ? 4 : 0);

                runPressAutomation('left', function () {
                    equal(select.selectedIndex, browserUtils.isFirefox ? 3 : 0);
                    callback();
                });
            },

            secondPressLeftAction: function (callback) {
                equal(select.selectedIndex, browserUtils.isFirefox ? 3 : 0);

                runPressAutomation('left', function () {
                    equal(select.selectedIndex, browserUtils.isFirefox ? 2 : 0);
                    callback();
                });
            },

            thirdPressLeftAction: function (callback) {
                equal(select.selectedIndex, browserUtils.isFirefox ? 2 : 0);

                runPressAutomation('left', function () {
                    equal(select.selectedIndex, browserUtils.isFirefox ? 1 : 0);
                    callback();
                });
            },

            fourthPressLeftAction: function () {
                equal(select.selectedIndex, browserUtils.isFirefox ? 1 : 0);

                runPressAutomation('left', function () {
                    equal(select.selectedIndex, 0);
                    startNext();
                });
            }
        });
    };

    const pressDownUpKeysActionsForSelectWithOptgroups = function (select, testCallback) {
        window.async.series({
            pressDownFirstTime: function (callback) {
                equal(select.selectedIndex, 0);

                runPressAutomation('down', function () {
                    equal(select.selectedIndex, 1);
                    callback();
                });
            },

            pressDownSecondTime: function (callback) {
                runPressAutomation('down', function () {
                    equal(select.selectedIndex, 3);
                    callback();
                });
            },

            pressUpFirstTime: function (callback) {
                runPressAutomation('up', function () {
                    equal(select.selectedIndex, 1);
                    callback();
                });
            },

            pressUpSecondTime: function () {
                runPressAutomation('up', function () {
                    equal(select.selectedIndex, 0);
                    testCallback();
                });
            }
        });
    };

    const pressRightLeftKeysActionsForSelectWithOptgroups = function ($select, testCallback, notChangeInChrome) {
        window.async.series({
            pressDownFirstTime: function (callback) {
                equal($select.selectedIndex, 0);

                runPressAutomation('right', function () {
                    equal($select.selectedIndex, browserUtils.isIE || notChangeInChrome ? 0 : 1);
                    callback();
                });
            },

            pressDownSecondTime: function (callback) {
                runPressAutomation('right', function () {
                    equal($select.selectedIndex, browserUtils.isIE || notChangeInChrome ? 0 : 3);
                    callback();
                });
            },

            pressUpFirstTime: function (callback) {
                runPressAutomation('left', function () {
                    equal($select.selectedIndex, browserUtils.isIE || notChangeInChrome ? 0 : 1);
                    callback();
                });
            },

            pressUpSecondTime: function () {
                runPressAutomation('up', function () {
                    equal($select.selectedIndex, browserUtils.isIE || notChangeInChrome ? 0 : 0);
                    testCallback();
                });
            }
        });
    };

    const runClickAutomation = function (el, options, callback) {
        const clickOptions = new ClickOptions();
        const offsets      = getOffsetOptions(el, options.offsetX, options.offsetY);

        clickOptions.offsetX  = offsets.offsetX;
        clickOptions.offsetY  = offsets.offsetY;
        clickOptions.caretPos = options.caretPos;

        clickOptions.modifiers = {
            ctrl:  options.ctrl,
            alt:   options.ctrl,
            shift: options.shift,
            meta:  options.meta
        };

        const clickAutomation = /opt/i.test(el.tagName) ?
            new SelectChildClickAutomation(el, clickOptions) :
            new ClickAutomation(el, clickOptions);

        clickAutomation
            .run()
            .then(function () {
                callback();
            });
    };

    QUnit.testDone(function () {
        if (!browserUtils.isIE)
            removeTestElements();

        handlersLog = [];
    });

    //tests
    module('common tests');
    asyncTest('option list doesn\'t open if mousedown event prevented', function () {
        const select = createSelect();

        select['onmousedown'] = preventDefault;

        equal(shadowUI.select('.' + OPTION_LIST_CLASS).length, 0);

        runClickAutomation(select, {}, function () {
            equal(shadowUI.select('.' + OPTION_LIST_CLASS).length, 0);
            startNext();
        });
    });

    module('mouse actions with select element');
    asyncTest('click on select and on option', function () {
        const select = createSelect();
        const option = $(select).children()[2];

        runClickAutomation(select, {}, function () {
            equal(select.selectedIndex, 0);

            runClickAutomation(option, {}, function () {
                equal(select.selectedIndex, 2);
                window.setTimeout(function () {
                    startNext();
                }, 0);
            });
        });
    });

    module('press actions with select element');
    asyncTest('press down/up/right/left when option list closed', function () {
        const select = createSelect();

        $(select).focus();

        window.async.series({
            pressDownAction: function (callback) {
                equal(select.selectedIndex, 0);

                runPressAutomation('down', function () {
                    equal(select.selectedIndex, 1);
                    callback();
                });
            },

            pressUpAction: function (callback) {
                runPressAutomation('up', function () {
                    equal(select.selectedIndex, 0);
                    callback();
                });
            },

            pressRightAction: function (callback) {
                runPressAutomation('right', function () {
                    equal(select.selectedIndex, browserUtils.isIE ? 0 : 1);
                    callback();
                });
            },

            pressLeftAction: function () {
                runPressAutomation('left', function () {
                    equal(select.selectedIndex, 0);
                    startNext();
                });
            }
        });
    });

    asyncTest('press down/up/right/left when option list opened', function () {
        const select = createSelect();

        window.async.series({
            openSelectList: function (callback) {
                equal(select.selectedIndex, 0);

                runClickAutomation(select, {}, function () {
                    //NOTE: we should wait for binding handlers to the document
                    equal(select.selectedIndex, 0);
                    window.setTimeout(callback, 0);
                });
            },

            pressDownAction: function (callback) {
                runPressAutomation('down', function () {
                    equal(select.selectedIndex, 1);
                    callback();
                });
            },

            pressUpAction: function (callback) {
                runPressAutomation('up', function () {
                    equal(select.selectedIndex, 0);
                    callback();
                });
            },

            pressRightAction: function (callback) {
                runPressAutomation('right', function () {
                    equal(select.selectedIndex, browserUtils.isFirefox ? 1 : 0);
                    callback();
                });
            },

            pressLeftAction: function (callback) {
                runPressAutomation('left', function () {
                    equal(select.selectedIndex, 0);
                    callback();
                });
            },

            closeSelectList: function () {
                runClickAutomation(select, {}, function () {
                    window.setTimeout(startNext, 0);
                });
            }
        });
    });

    asyncTest('click select and press enter', function () {
        const select = createSelect();

        window.async.series({
            'Click on select': function (callback) {
                equal(select.selectedIndex, 0);

                runClickAutomation(select, {}, function () {
                    window.setTimeout(callback, 0);
                });
            },

            'Press enter': function (callback) {
                equal(select, document.activeElement);
                equal($(shadowUI.select('.' + OPTION_LIST_CLASS)).is(':visible'), true);
                equal(select.selectedIndex, 0);

                runPressAutomation('enter', callback);
            },

            'Check assertions': function () {
                equal(select, document.activeElement);
                equal($(shadowUI.select('.' + OPTION_LIST_CLASS)).is(':visible'), false);
                equal(select.selectedIndex, 0);
                startNext();
            }
        });
    });

    asyncTest('click select and press tab', function () {
        const select = createSelect();

        window.async.series({
            'Click on select': function (callback) {
                equal(select.selectedIndex, 0);

                runClickAutomation(select, {}, function () {
                    window.setTimeout(callback, 0);
                });
            },

            'Press tab': function (callback) {
                runPressAutomation('tab', callback);
            },

            'Check assertions': function () {
                notEqual(select, document.activeElement);
                equal($(shadowUI.select('.' + OPTION_LIST_CLASS)).is(':visible'), false);
                equal(select.selectedIndex, 0);
                startNext();
            }
        });
    });

    asyncTest('click select and press esc', function () {
        const select = createSelect();

        window.async.series({
            'Click on select': function (callback) {
                equal(select.selectedIndex, 0);

                runClickAutomation(select, {}, function () {
                    window.setTimeout(callback, 0);
                });
            },

            'Press esc': function (callback) {
                runPressAutomation('esc', callback);
            },

            'Check assertions': function () {
                equal(select, document.activeElement);
                equal($(shadowUI.select('.' + OPTION_LIST_CLASS)).is(':visible'), false);
                equal(select.selectedIndex, 0);
                startNext();
            }
        });
    });

    // NOTE: Android and iOS ignore the size and multiple attributes, all select elements behave like select with size=1
    if (isMobileBrowser) {
        module('mouse actions with multiline select element');
        asyncTest('click on the "select" element with the "size" attribute greater than one, then click on an option', function () {
            const select = createSelect(2);

            runClickAutomation(select, {}, function () {
                ok(selectElement.isOptionListExpanded(select));
                startNext();
            });
        });

        asyncTest('click on the "select" element with the "multiple" attribute, then click on an option', function () {
            const select = createSelect();

            $(select).attr('multiple', 'multiple');

            runClickAutomation(select, {}, function () {
                ok(selectElement.isOptionListExpanded(select));
                startNext();
            });
        });
    }
    else {
        module('mouse actions with select element with attribute size more than one');
        asyncTest('click on option', function () {
            const select = createSelect(2);

            select.selectedIndex = 0;
            equal(select.selectedIndex, 0);

            runClickAutomation($(select).children()[1], {}, function () {
                equal(select.selectedIndex, 1);
                startNext();
            });
        });

        asyncTest('click on option with scroll', function () {
            const select = createSelect(2);

            select.selectedIndex = 0;
            equal(select.selectedIndex, 0);

            runClickAutomation($(select).children(':last')[0], {}, function () {
                equal(select.selectedIndex, 4);
                startNext();
            });
        });

        asyncTest('click on disabled option', function () {
            const select  = createSelect(2);
            const $option = $(select).children(':first');

            $option.attr('disabled', 'disabled');

            select.selectedIndex = 0;
            equal(select.selectedIndex, 0);

            runClickAutomation($option[0], {}, function () {
                equal(select.selectedIndex, 0);
                startNext();
            });
        });

        asyncTest('click on an option (the select size is more than the option count)', function () {
            const select = createSelect(10);

            select.selectedIndex = 0;
            equal(select.selectedIndex, 0);

            runClickAutomation($(select).children()[3], {}, function () {
                equal(select.selectedIndex, 3);
                startNext();
            });
        });

        module('press actions with select element with attribute size more than one');
        asyncTest('press down/up in select', function () {
            const select = createSelect();

            $(select).attr('size', '2');
            //NOTE: IE11 sets selectedIndex = -1 after setting attribute size != 1
            select.selectedIndex = 0;
            $(select).focus();

            pressDownUpKeysActions(select);
        });

        asyncTest('press right/left in select', function () {
            const select = createSelect();

            $(select).attr('size', '2');
            //NOTE: IE11 sets selectedIndex = -1 after setting attribute size != 1
            select.selectedIndex = 0;
            $(select).focus();

            pressRightLeftKeysActions(select);
        });

        asyncTest('press down/up in select with "size" more than the option count', function () {
            const select = createSelect();

            $(select).attr('size', '10');
            //NOTE: IE11 sets selectedIndex = -1 after setting attribute size != 1
            select.selectedIndex = 0;
            $(select).focus();

            pressDownUpKeysActions(select);
        });

        asyncTest('press right/left in select with "size" more than the option count', function () {
            const select = createSelect();

            $(select).attr('size', '10');
            //NOTE: IE11 sets selectedIndex = -1 after setting attribute size != 1
            select.selectedIndex = 0;
            $(select).focus();

            pressRightLeftKeysActions(select);
        });


        module('mouse actions with the "select" element with the "multiple" attribute');
        asyncTest('click on option with scroll', function () {
            const select = createSelect();

            select.selectedIndex = 0;
            equal(select.selectedIndex, 0);
            $(select).attr('multiple', 'multiple');

            runClickAutomation($(select).children(':last')[0], {}, function () {
                equal(select.selectedIndex, 4);
                startNext();
            });
        });

        asyncTest('click on option with scroll (attribute size more than one)', function () {
            const select = createSelect(2);

            select.selectedIndex = 0;
            equal(select.selectedIndex, 0);
            $(select).attr('multiple', 'multiple');

            runClickAutomation($(select).children(':last')[0], {}, function () {
                equal(select.selectedIndex, 4);
                startNext();
            });
        });

        asyncTest('click on option with scroll (attribute size less than one)', function () {
            const select = createSelect(-1);

            select.selectedIndex = 0;
            equal(select.selectedIndex, 0);
            $(select).attr('multiple', 'multiple');

            runClickAutomation($(select).children(':last')[0], {}, function () {
                equal(select.selectedIndex, 4);
                startNext();
            });
        });
    }

    module('mouse actions with select with option groups');
    asyncTest('click select and option', function () {
        const select        = createSelectWithGroups();
        const option        = $(select).find('option')[3];

        let changeHandled = false;

        //T280587 - Selecting an option does not trigger the on('change', ...) event
        select.onchange = function () {
            changeHandled = true;
        };

        runClickAutomation(select, {}, function () {
            equal(select.selectedIndex, 0);
            equal(shadowUI.select('.' + OPTION_CLASS).length, 9);
            equal(shadowUI.select('.' + OPTION_GROUP_CLASS).length, 3);

            runClickAutomation(option, {}, function () {
                window.setTimeout(function () {
                    equal(select.selectedIndex, 3);
                    ok(changeHandled, 'change event raised');
                    startNext();
                }, 0);
            });
        });
    });

    asyncTest('click select and option (optgroup with empty label)', function () {
        const select    = createSelectWithGroups();
        const $optgroup = $(select).find('optgroup').eq(0).attr('label', '');
        const option    = $optgroup.find('option')[1];

        runClickAutomation(select, {}, function () {
            equal(select.selectedIndex, 0);
            equal(shadowUI.select('.' + OPTION_CLASS).length, 9);
            equal(shadowUI.select('.' + OPTION_GROUP_CLASS).length, 3);

            runClickAutomation(option, {}, function () {
                equal(select.selectedIndex, 1);
                window.setTimeout(function () {
                    startNext();
                }, 0);
            });
        });
    });

    asyncTest('click select and option (in disabled group)', function () {
        const select    = createSelectWithGroups();
        const $optgroup = $(select).find('optgroup').eq(1).attr('disabled', '');
        const option    = $optgroup.find('option')[0];

        runClickAutomation(select, {}, function () {
            equal(select.selectedIndex, 0);
            equal(shadowUI.select('.' + OPTION_CLASS).length, 9);
            equal(shadowUI.select('.' + OPTION_GROUP_CLASS).length, 3);

            runClickAutomation(option, {}, function () {
                equal(select.selectedIndex, 0);

                runClickAutomation($(select).find('option')[1], {}, function () {
                    equal(select.selectedIndex, 1);
                    window.setTimeout(function () {
                        startNext();
                    }, 0);
                });
            });
        });
    });

    asyncTest('click select and optgroup', function () {
        const select = createSelectWithGroups();
        const group  = $(select).find('optgroup')[2];

        runClickAutomation(select, {}, function () {
            equal(select.selectedIndex, 0);
            equal(shadowUI.select('.' + OPTION_CLASS).length, 9);
            equal(shadowUI.select('.' + OPTION_GROUP_CLASS).length, 3);

            runClickAutomation(group, {}, function () {
                equal(select.selectedIndex, 0);

                //NOTE: to close options list
                runClickAutomation($(select).find('option')[1], {}, function () {
                    equal(select.selectedIndex, 1);
                    window.setTimeout(function () {
                        startNext();
                    }, 0);
                });
            });
        });
    });

    asyncTest('click select and option in subgroup', function () {
        const select       = createSelectWithGroups();
        const $optgroup    = $(select).find('optgroup').eq(1);
        const $newOptgroup = $('<optgroup label="subgroup"></optgroup>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($optgroup[0]);

        const $newOption = $('<option></option>').text('sub option')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($newOptgroup[0]);

        runClickAutomation(select, {}, function () {
            equal(select.selectedIndex, 0);
            equal(shadowUI.select('.' + OPTION_CLASS).length, 10);
            equal(shadowUI.select('.' + OPTION_GROUP_CLASS).length, 4);

            runClickAutomation($newOption[0], {}, function () {
                equal(select.selectedIndex, 6);
                window.setTimeout(function () {
                    startNext();
                }, 0);
            });
        });
    });

    asyncTest('click select and subgroup', function () {
        const select       = createSelectWithGroups();
        const $optgroup    = $(select).find('optgroup').eq(1);
        const $newOptgroup = $('<optgroup label="subgroup"></optgroup>')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($optgroup[0]);

        $('<option></option>').text('sub option')
            .addClass(TEST_ELEMENT_CLASS)
            .appendTo($newOptgroup[0]);

        runClickAutomation(select, {}, function () {
            equal(select.selectedIndex, 0);
            equal(shadowUI.select('.' + OPTION_CLASS).length, 10);
            equal(shadowUI.select('.' + OPTION_GROUP_CLASS).length, 4);

            runClickAutomation($newOptgroup[0], {}, function () {
                equal(select.selectedIndex, 0);

                //NOTE: to close options list
                runClickAutomation($(select).find('option')[1], {}, function () {
                    equal(select.selectedIndex, 1);
                    window.setTimeout(function () {
                        startNext();
                    }, 0);
                });
            });
        });
    });

    asyncTest('click select and option out of group', function () {
        const select     = createSelectWithGroups();
        const $optgroup  = $(select).find('optgroup').eq(1);
        const $newOption = $('<option></option>').text('outer option')
            .addClass(TEST_ELEMENT_CLASS)
            .insertAfter($optgroup);

        runClickAutomation(select, {}, function () {
            equal(select.selectedIndex, 0);
            equal(shadowUI.select('.' + OPTION_CLASS).length, 10);
            equal(shadowUI.select('.' + OPTION_GROUP_CLASS).length, 3);

            runClickAutomation($newOption[0], {}, function () {
                equal(select.selectedIndex, 6);
                window.setTimeout(function () {
                    startNext();
                }, 0);
            });
        });
    });


    module('press actions with select with option groups');
    asyncTest('press down/up when option list closed', function () {
        const select = createSelectWithGroupsForCheckPress();

        select.selectedIndex = 0;
        $(select).focus();

        pressDownUpKeysActionsForSelectWithOptgroups(select, startNext);
    });

    asyncTest('press right/left when option list closed', function () {
        const select = createSelectWithGroupsForCheckPress();

        select.selectedIndex = 0;
        $(select).focus();

        pressRightLeftKeysActionsForSelectWithOptgroups(select, startNext);
    });

    asyncTest('press down/up when option list opened', function () {
        const select = createSelectWithGroupsForCheckPress();

        select.selectedIndex = 0;
        $(select).focus();

        window.async.series({
            openSelectList: function (callback) {
                equal(select.selectedIndex, 0);

                runClickAutomation(select, {}, function () {
                    //NOTE: we should wait for binding handlers to the document
                    equal(select.selectedIndex, 0);
                    window.setTimeout(callback, 0);
                });
            },

            pressDownUpKeysActionsForSelectWithOptgroups: function (callback) {
                pressDownUpKeysActionsForSelectWithOptgroups(select, callback);
            },

            closeSelectList: function () {
                runClickAutomation(select, {}, function () {
                    window.setTimeout(startNext, 0);
                });
            }
        });
    });

    asyncTest('press right/left when option list opened', function () {
        const select = createSelectWithGroupsForCheckPress();

        window.async.series({
            openSelectList: function (callback) {
                equal(select.selectedIndex, 0);

                runClickAutomation(select, {}, function () {
                    //NOTE: we should wait for binding handlers to the document
                    equal(select.selectedIndex, 0);
                    window.setTimeout(callback, 0);
                });
            },

            pressRightLeftKeysActionsForSelectWithOptgroups: function (callback) {
                pressRightLeftKeysActionsForSelectWithOptgroups(select, callback, browserUtils.isWebKit);
            },

            closeSelectList: function () {
                runClickAutomation(select, {}, function () {
                    window.setTimeout(startNext, 0);
                });
            }
        });
    });

    // Android and iOS ignore the size and multiple attributes, all select elements behave like select with size=1
    if (!isMobileBrowser) {
        module('mouse actions with select with the "groups" option and size more than one');
        asyncTest('click optgroup', function () {
            const select  = createSelectWithGroups();
            const $select = $(select);
            const group   = $select.find('optgroup')[0];

            $select.attr('size', '4');
            select.selectedIndex = 0;

            window.setTimeout(function () {
                //NOTE: when setting the selected option, IE and Mozilla scroll the select
                $select.scrollTop(0);

                runClickAutomation(group, {}, function () {
                    equal(select.selectedIndex, 0);
                    window.setTimeout(function () {
                        startNext();
                    }, 0);
                });
            }, 100);
        });

        asyncTest('click option', function () {
            const select  = createSelectWithGroups();
            const $select = $(select);
            const option  = $select.find('option')[1];

            $select.css({
                position: 'absolute',
                top:      '200px',
                left:     '300px'
            });
            $select.attr('size', '5');
            select.selectedIndex = 0;

            window.setTimeout(function () {
                //NOTE: when setting the selected option, IE and Mozilla scroll the select
                $select.scrollTop(0);

                runClickAutomation(option, {}, function () {
                    equal($select.scrollTop(), 0);
                    equal(select.selectedIndex, 1);
                    window.setTimeout(function () {
                        startNext();
                    }, 0);
                });
            }, 100);
        });

        asyncTest('click option with scroll down', function () {
            const select              = createSelectWithGroups();
            const $select             = $(select);
            const option              = $select.find('option')[8];
            const selectElementScroll = 0;

            $select.css({
                position: 'absolute',
                top:      '200px',
                left:     '300px'
            });
            $select.attr('size', '5');
            select.selectedIndex = 0;
            //NOTE: when setting the selected option, IE and Mozilla scroll the select
            $select.scrollTop(selectElementScroll);

            window.setTimeout(function () {
                equal($select.scrollTop(), selectElementScroll);

                runClickAutomation(option, {}, function () {
                    ok($select.scrollTop() > selectElementScroll);
                    equal(select.selectedIndex, 8);
                    window.setTimeout(function () {
                        startNext();
                    }, 0);
                });
            }, 100);
        });

        asyncTest('click option with scroll up', function () {
            const select              = createSelectWithGroups();
            const $select             = $(select);
            const option              = $select.find('option')[4];
            const selectElementScroll = 119;

            $select.css({
                position: 'absolute',
                top:      '200px',
                left:     '300px'
            });
            $select.attr('size', '5');
            select.selectedIndex = 8;
            $select.scrollTop(selectElementScroll);

            window.setTimeout(function () {
                ok($select.scrollTop() > 0);

                runClickAutomation(option, {}, function () {
                    ok(selectElementScroll > $select.scrollTop());
                    equal(select.selectedIndex, 4);
                    window.setTimeout(function () {
                        startNext();
                    }, 0);
                });
            }, 100);
        });

        asyncTest('click option in subgroup', function () {
            const select       = createSelectWithGroups();
            const $select      = $(select);
            const $optgroup    = $select.find('optgroup').eq(1);
            const $newOptgroup = $('<optgroup label="subgroup"></optgroup>')
                .addClass(TEST_ELEMENT_CLASS)
                .appendTo($optgroup[0]);

            const $newOption = $('<option></option>').text('sub option')
                .addClass(TEST_ELEMENT_CLASS)
                .appendTo($newOptgroup[0]);

            $select.css({
                position: 'absolute',
                top:      '200px',
                left:     '300px'
            });
            $select.attr('size', '5');
            select.selectedIndex = 0;

            window.setTimeout(function () {
                //NOTE: when setting the selected option, IE and Mozilla scroll the select
                $select.scrollTop(0);

                runClickAutomation($newOption[0], {}, function () {
                    ok($select.scrollTop() > 0);
                    equal(select.selectedIndex, 6);
                    window.setTimeout(function () {
                        startNext();
                    }, 0);
                });
            }, 100);
        });

        asyncTest('click subgroup', function () {
            const select       = createSelectWithGroups();
            const $select      = $(select);
            const $optgroup    = $select.find('optgroup').eq(1);
            const $newOptgroup = $('<optgroup label="subgroup"></optgroup>')
                .addClass(TEST_ELEMENT_CLASS)
                .appendTo($optgroup[0]);

            $('<option></option>').text('sub option')
                .addClass(TEST_ELEMENT_CLASS)
                .appendTo($newOptgroup[0]);

            $select.css({
                position: 'absolute',
                top:      '200px',
                left:     '300px'
            });
            $select.attr('size', '5');
            select.selectedIndex = 0;

            window.setTimeout(function () {
                //NOTE: when setting the selected option, IE and Mozilla scroll the select
                $select.scrollTop(0);

                runClickAutomation($newOptgroup[0], {}, function () {
                    ok($select.scrollTop() > 0);
                    equal(select.selectedIndex, 0);
                    window.setTimeout(function () {
                        startNext();
                    }, 0);
                });
            }, 100);
        });

        asyncTest('click option out of group', function () {
            const select     = createSelectWithGroups();
            const $select    = $(select);
            const $optgroup  = $select.find('optgroup').eq(2);
            const $newOption = $('<option></option>').text('outer option')
                .addClass(TEST_ELEMENT_CLASS)
                .insertAfter($optgroup);

            $select.attr('size', '5');
            select.selectedIndex = 0;

            window.setTimeout(function () {
                //NOTE: when setting the selected option, IE and Mozilla scroll the select
                $select.scrollTop(0);

                runClickAutomation($newOption[0], {}, function () {
                    ok($select.scrollTop() > 0);
                    equal(select.selectedIndex, 9);
                    window.setTimeout(function () {
                        startNext();
                    }, 0);
                });
            }, 100);
        });


        module('press actions with select with the "groups" option and size more than one');
        asyncTest('press down/up', function () {
            const select = createSelectWithGroupsForCheckPress();

            $(select).attr('size', '5');
            select.selectedIndex = 0;
            $(select).focus();

            pressDownUpKeysActionsForSelectWithOptgroups(select, startNext);
        });

        asyncTest('press right/left', function () {
            const select = createSelectWithGroupsForCheckPress();

            $(select).attr('size', '5');
            select.selectedIndex = 0;
            $(select).focus();

            pressRightLeftKeysActionsForSelectWithOptgroups(select, startNext, browserUtils.isWebKit);
        });
    }

    module('regression');
    asyncTest('B237794 - Select options list doesn\'t close after dblclick in Chrome and Opera (dblclick)', function () {
        const select = createSelect();

        equal(shadowUI.select('.' + OPTION_LIST_CLASS).length, 0);

        runDblClickAutomation(select, {}, function () {
            equal(select, document.activeElement);
            notEqual($(shadowUI.select('.' + OPTION_LIST_CLASS)).is(':visible'), true);
            equal(shadowUI.select('.' + OPTION_LIST_CLASS).length, 0);
            equal(select.selectedIndex, 0);

            startNext();
        });
    });

    asyncTest('B237794 - Select options list doesn\'t close after dblclick in Chrome and Opera (two successive clicks)', function () {
        const select = createSelect();

        equal(shadowUI.select('.' + OPTION_LIST_CLASS).length, 0);

        window.async.series({
            'First click': function (callback) {
                runClickAutomation(select, {}, callback);
            },

            'Check assertions and set timeout': function (callback) {
                equal(select, document.activeElement);
                equal($(shadowUI.select('.' + OPTION_LIST_CLASS)).is(':visible'), true);
                equal(shadowUI.select('.' + OPTION_LIST_CLASS).length, 1);
                equal(select.selectedIndex, 0);

                window.setTimeout(callback, 500);
            },

            'Second click': function (callback) {
                runClickAutomation(select, {}, callback);
            },

            'Check assertions': function () {
                equal(select, document.activeElement);
                notEqual($(shadowUI.select('.' + OPTION_LIST_CLASS)).is(':visible'), true);
                equal(shadowUI.select('.' + OPTION_LIST_CLASS).length, 0);
                equal(select.selectedIndex, 0);
                startNext();
            }
        });
    });

    asyncTest('B238984 - After click on select element and then click on another first opened options list doesn\'t closed', function () {
        const firstSelect         = createSelect();
        const secondSelect        = createSelect();
        const $secondSelectOption = $(secondSelect).find('option').last();

        equal(shadowUI.select('.' + OPTION_LIST_CLASS).length, 0);

        window.async.series({
            'Click on the first select': function (callback) {
                runClickAutomation(firstSelect, {}, callback);
            },

            'Check assertions after the first click': function (callback) {
                equal(firstSelect, document.activeElement);
                equal($(shadowUI.select('.' + OPTION_LIST_CLASS)).is(':visible'), true);
                equal(shadowUI.select('.' + OPTION_LIST_CLASS).length, 1);
                equal(firstSelect.selectedIndex, 0);
                window.setTimeout(callback, 500);
            },

            'Click on the second select': function (callback) {
                runClickAutomation(secondSelect, {}, callback);
            },

            'Check assertions after the second click': function (callback) {
                equal(secondSelect, document.activeElement);
                equal($(shadowUI.select('.' + OPTION_LIST_CLASS)).is(':visible'), true);
                equal(shadowUI.select('.' + OPTION_LIST_CLASS).length, 1);
                equal(firstSelect.selectedIndex, 0);
                window.setTimeout(callback, 500);
            },

            'Click on the second select option': function (callback) {
                runClickAutomation($secondSelectOption[0], {}, callback);
            },

            'Check assertions': function () {
                equal(secondSelect, document.activeElement);
                equal($(shadowUI.select('.' + OPTION_LIST_CLASS)).is(':visible'), false);
                equal(shadowUI.select('.' + OPTION_LIST_CLASS).length, 0);
                equal(firstSelect.selectedIndex, 0);
                equal(secondSelect.selectedIndex, $(secondSelect).find('option').length - 1);
                window.setTimeout(function () {
                    startNext();
                }, 0);
            }
        });
    });

    asyncTest('B253370 - Event handlers are called in the wrong order (click on select and option)', function () {
        const select  = createSelect();
        const $option = $(select).children().eq(2);

        //bind handlers
        bindSelectAndOptionHandlers($(select), $option);
        equal(select.selectedIndex, 0);

        runClickAutomation(select, {}, function () {
            equal(select.selectedIndex, 0);

            runClickAutomation($option[0], {}, function () {
                equal(select.selectedIndex, 2);
                if (browserUtils.isFirefox)
                    equal(handlersLog.join(), 'select mousedown,select mouseup,select click,option mousedown,option mouseup,select input,select change,option click');
                else if (browserUtils.isIE)
                    equal(handlersLog.join(), 'select mousedown,select mouseup,select click,select mousedown,select mouseup,select change,option click');
                else if (isMobileBrowser)
                    equal(handlersLog.join(), 'select mousedown,select mouseup,select click,select input,select change');
                else
                    equal(handlersLog.join(), 'select mousedown,select mouseup,select click,select input,select change,select mouseup,select click');
                startNext();
            });
        });
    });

    asyncTest('B253370 - Event handlers are called in the wrong order (click on select and the same option)', function () {
        const select  = createSelect();
        const $option = $(select).children().eq(2);

        //bind handlers
        bindSelectAndOptionHandlers($(select), $option);

        runClickAutomation(select, {}, function () {
            equal(select.selectedIndex, 0);

            runClickAutomation($option[0], {}, function () {
                equal(select.selectedIndex, 2);
                runClickAutomation(select, {}, function () {
                    equal(select.selectedIndex, 2);
                    runClickAutomation($option[0], {}, function () {
                        equal(select.selectedIndex, 2);

                        if (browserUtils.isFirefox)
                            equal(handlersLog.join(), 'select mousedown,select mouseup,select click,option mousedown,option mouseup,select input,select change,option click,select mousedown,select mouseup,select click,option mousedown,option mouseup,option click');
                        else if (browserUtils.isIE)
                            equal(handlersLog.join(), 'select mousedown,select mouseup,select click,select mousedown,select mouseup,select change,option click,select mousedown,select mouseup,select click,select mousedown,select mouseup,option click');
                        else if (isMobileBrowser)
                            equal(handlersLog.join(), 'select mousedown,select mouseup,select click,select input,select change,select mousedown,select mouseup,select click');
                        else
                            equal(handlersLog.join(), 'select mousedown,select mouseup,select click,select input,select change,select mouseup,select click,select mousedown,select mouseup,select click,select mouseup,select click');
                        startNext();
                    });
                });
            });
        });
    });

    asyncTest('B253370 - Event handlers are called in the wrong order (click on select and select)', function () {
        const select  = createSelect();
        const $option = $(select).children().eq(2);

        //bind handlers
        bindSelectAndOptionHandlers($(select), $option);
        equal(select.selectedIndex, 0);

        runClickAutomation(select, {}, function () {
            equal(select.selectedIndex, 0);

            runClickAutomation(select, {}, function () {
                equal(select.selectedIndex, 0);
                equal(handlersLog.join(), 'select mousedown,select mouseup,select click,select mousedown,select mouseup,select click');
                startNext();
            });
        });
    });

    asyncTest('B253370 - Event handlers are called in the wrong order (click on option in select with size more than one)', function () {
        const select  = createSelect(4);
        const $option = $(select).children().eq(2);

        //bind handlers
        bindSelectAndOptionHandlers($(select), $option);

        select.selectedIndex = 0;
        equal(select.selectedIndex, 0);

        window.async.series({
            'Click on select in Android and iOS': function (callback) {
                if (isMobileBrowser)
                    runClickAutomation(select, {}, callback);
                else
                    callback();

            },

            'Click on option': function () {
                runClickAutomation($option[0], {}, function () {
                    equal(select.selectedIndex, 2);
                    if (browserUtils.isIE)
                        equal(handlersLog.join(), 'select mousedown,select mouseup,select change,select click');
                    else if (isMobileBrowser)
                        equal(handlersLog.join(), 'select mousedown,select mouseup,select click,select input,select change');
                    else
                        equal(handlersLog.join(), 'option mousedown,option mouseup,select input,select change,option click');
                    startNext();
                });
            }
        });
    });

    asyncTest('B253370 - Event handlers are called in the wrong order (click on the same option in select with size more than one)', function () {
        const select  = createSelect(4);
        const $option = $(select).children().eq(2);

        //bind handlers
        bindSelectAndOptionHandlers($(select), $option);

        window.async.series({
            'Click on select in Android/iOS first time': function (callback) {
                if (isMobileBrowser)
                    runClickAutomation(select, {}, callback);
                else
                    callback();

            },

            'Click on option first time': function (callback) {
                runClickAutomation($option[0], {}, function () {
                    equal(select.selectedIndex, 2);
                    callback();
                });
            },

            'Click on select in Android/iOS second time': function (callback) {
                if (isMobileBrowser)
                    runClickAutomation(select, {}, callback);
                else
                    callback();
            },

            'Click on option second time': function () {
                runClickAutomation($option[0], {}, function () {
                    equal(select.selectedIndex, 2);
                    if (browserUtils.isIE)
                        equal(handlersLog.join(), 'select mousedown,select mouseup,select change,select click,select mousedown,select mouseup,select click');
                    else if (isMobileBrowser)
                        equal(handlersLog.join(), 'select mousedown,select mouseup,select click,select input,select change,select mousedown,select mouseup,select click');
                    else
                        equal(handlersLog.join(), 'option mousedown,option mouseup,select input,select change,option click,option mousedown,option mouseup,option click');
                    startNext();
                });
            }
        });
    });

    asyncTest('B253370 - Event handlers are called in the wrong order (click on select with size more than one)', function () {
        const select = createSelect(30);

        //bind handlers
        bindSelectAndOptionHandlers($(select));

        select.selectedIndex = 0;

        runClickAutomation(select, {}, function () {
            equal(handlersLog.join(), 'select mousedown,select mouseup,select click');
            startNext();
        });
    });

    asyncTest('GH234 - Value of a <select> element must be updated before emitting "change" event in IE and Edge', function () {
        const select = createSelect();

        select.addEventListener('change', function () {
            equal(select.value, 'three');
            startNext();
        });

        runClickAutomation(select, {}, function () {
            runClickAutomation(select.options[2], {}, function () {
            });
        });
    });
});
