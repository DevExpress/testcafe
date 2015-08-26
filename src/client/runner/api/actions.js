import * as hammerheadAPI from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import * as automation from '../automation/automation';
import clickPlaybackAutomation from '../automation/playback/click';
import dblClickPlaybackAutomation from '../automation/playback/dblclick';
import dragPlaybackAutomation from '../automation/playback/drag';
import hoverPlaybackAutomation from '../automation/playback/hover';
import pressPlaybackAutomation from '../automation/playback/press';
import rClickPlaybackAutomation from '../automation/playback/rclick';
import selectPlaybackAutomation from '../automation/playback/select';
import typePlaybackAutomation from '../automation/playback/type';
import * as sourceIndexTracker from '../source-index';

var jsProcessor = hammerheadAPI.JSProcessor;
var hhUpload    = hammerheadAPI.upload;

var $               = testCafeCore.$;
var SETTINGS        = testCafeCore.SETTINGS;
var CONST           = testCafeCore.CONST;
var ERRORS          = testCafeCore.ERRORS;
var contentEditable = testCafeCore.contentEditable;
var domUtils        = testCafeCore.domUtils;
var positionUtils   = testCafeCore.positionUtils;
var styleUtils      = testCafeCore.styleUtils;
var serviceUtils    = testCafeCore.serviceUtils;
var keyCharUtils    = testCafeCore.keyCharUtils;


var ELEMENT_AVAILABILITY_WAITING_TIMEOUT = 10000;


const ELEMENT_AVAILABILITY_WAITING_DELAY = 200;
const WAIT_FOR_DEFAULT_TIMEOUT           = 10000;
const CHECK_CONDITION_INTERVAL           = 50;


//Global
var stepIterator = null;

function ensureArray (target) {
    return target instanceof Array ? target : [target];
}

function isStringOrStringArray (target, forbidEmptyArray) {
    if (typeof target === 'string')
        return true;

    if (target instanceof Array && (!forbidEmptyArray || target.length)) {
        for (var i = 0; i < target.length; i++) {
            if (typeof target[i] !== 'string')
                return false;
        }

        return true;
    }

    return false;
}

function failWithError (code, additionalParams) {
    var err = {
        code:          code,
        stepName:      SETTINGS.get().CURRENT_TEST_STEP_NAME,
        __sourceIndex: sourceIndexTracker.currentIndex
    };

    if (additionalParams) {
        for (var key in additionalParams) {
            if (additionalParams.hasOwnProperty(key)) {
                err[key] = additionalParams[key];
            }
        }
    }

    stepIterator.onError(err);
}

function ensureElementsExist (item, actionName, callback) {
    var success = false;

    var ensureExists = function () {
        var array = null;

        if (typeof item === 'function') {
            var res = item();

            array = ensureArray(res);

            if (res && !(serviceUtils.isJQueryObj(res) && !res.length) && array.length) {
                callback(array);
                return true;
            }
        }
        else if (typeof item === 'string') {
            array = parseActionArgument(item, actionName);

            if (array && array.length) {
                callback(array);
                return true;
            }
        }

        return false;
    };

    if (ensureExists())
        return;

    var interval = window.setInterval(function () {
        if (ensureExists()) {
            success = true;
            window.clearInterval(interval);
        }
    }, ELEMENT_AVAILABILITY_WAITING_DELAY);

    window.setTimeout(function () {
        if (!success) {
            window.clearInterval(interval);
            failWithError(ERRORS.API_EMPTY_FIRST_ARGUMENT, { action: actionName });
        }
    }, ELEMENT_AVAILABILITY_WAITING_TIMEOUT);
}

function ensureElementVisibility (element, actionName, callback) {
    var success = false;

    if (positionUtils.isElementVisible(element) || element.tagName.toLowerCase() === 'option' ||
        element.tagName.toLowerCase() === 'optgroup') {
        callback();
        return;
    }

    var interval = window.setInterval(function () {
        if (positionUtils.isElementVisible(element)) {
            success = true;
            window.clearInterval(interval);
            callback();
        }
    }, ELEMENT_AVAILABILITY_WAITING_DELAY);

    window.setTimeout(function () {
        if (!success) {
            window.clearInterval(interval);

            failWithError(ERRORS.API_INVISIBLE_ACTION_ELEMENT, {
                element: domUtils.getElementDescription(element),
                action:  actionName
            });
        }
    }, ELEMENT_AVAILABILITY_WAITING_TIMEOUT);
}

function actionArgumentsIterator (actionName) {
    var runAction = null;

    var iterate = function (item, iterationCallback) {
        if ($.isArray(item))
            extractArgs(item, iterationCallback);
        else if (typeof item === 'function') {
            ensureElementsExist(item, actionName, function (elementsArray) {
                extractArgs(elementsArray, iterationCallback);
            });
        }
        else if (typeof item === 'string') {
            ensureElementsExist(item, actionName, function (elementsArray) {
                runAction(elementsArray, iterationCallback);
            });
        }
        else {
            var elementsArray = parseActionArgument(item, actionName);
            if (!elementsArray || elementsArray.length < 1)
                failWithError(ERRORS.API_EMPTY_FIRST_ARGUMENT, { action: actionName });
            else
                runAction(elementsArray, iterationCallback);
        }
    };

    var extractArgs = function (items, callback) {
        if (!items.length) {
            failWithError(ERRORS.API_EMPTY_FIRST_ARGUMENT, { action: actionName });
        }
        else {
            window.async.forEachSeries(
                items,
                function (item, seriaCallback) {
                    iterate(item, seriaCallback);
                },
                function () {
                    callback();
                }
            );
        }
    };

    return {
        run: function (items, actionRunner, callback) {
            onTargetWaitingStarted();
            runAction = actionRunner;
            extractArgs(items, callback);
        }
    };
}

function pressActionArgumentsIterator () {
    return {
        run: function (items, actionRunner, callback) {
            actionRunner(items, callback);
        }
    };
}

function onTargetWaitingStarted (isWaitAction) {
    stepIterator.onActionTargetWaitingStarted({
        maxTimeout:   ELEMENT_AVAILABILITY_WAITING_TIMEOUT,
        isWaitAction: isWaitAction
    });
}

function onTargetWaitingFinished () {
    stepIterator.onActionRun();
}

//function exports only for tests
export function parseActionArgument (item, actionName) {
    var elements = [];

    if (domUtils.isDomElement(item))
        return [item];
    else if (actionName && actionName === 'select' && domUtils.isTextNode(item))
        return [item];
    else if (typeof item === 'string') {
        $(item).each(function () {
            elements.push(this);
        });

        return elements;
    }
    else if (serviceUtils.isJQueryObj(item)) {
        item.each(function () {
            elements.push(this);
        });

        return elements;
    }
    else
        return null;
}

export function init (iterator) {
    stepIterator = iterator;
}

export function click (what, options) {
    var actionStarted = false,
        elements      = ensureArray(what);

    stepIterator.asyncActionSeries(
        elements,
        actionArgumentsIterator('click').run,
        function (element, callback, iframe) {
            ensureElementVisibility(element, 'click', function () {
                function onerror (err) {
                    failWithError(err.code, {
                        element: err.element,
                        action:  'click'
                    });
                }

                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                if (iframe)
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].click.playback.run(element, options ||
                                                                                                    {}, callback, onerror);
                else
                    clickPlaybackAutomation(element, options || {}, callback, onerror);
            });
        });
}

export function rclick (what, options) {
    var actionStarted = false,
        elements      = ensureArray(what);

    stepIterator.asyncActionSeries(
        elements,
        actionArgumentsIterator('rclick').run,
        function (element, callback, iframe) {
            ensureElementVisibility(element, 'rclick', function () {
                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                if (iframe)
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].rclick.playback.run(element, options ||
                                                                                                     {}, callback);
                else
                    rClickPlaybackAutomation(element, options || {}, callback);
            });
        });
}

export function dblclick (what, options) {
    var actionStarted = false,
        elements      = ensureArray(what);

    stepIterator.asyncActionSeries(
        elements,
        actionArgumentsIterator('dblclick').run,
        function (element, callback, iframe) {
            ensureElementVisibility(element, 'dblclick', function () {
                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                if (iframe)
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].dblclick.playback.run(element, options ||
                                                                                                       {}, callback);
                else
                    dblClickPlaybackAutomation(element, options || {}, callback);
            });
        });
}

export function drag (what) {
    var actionStarted = false,
        args          = arguments,
        elements      = ensureArray(what);

    var secondArgIsCoord = !(isNaN(parseInt(args[1])));

    var to = args.length > 2 && secondArgIsCoord ? { dragOffsetX: args[1], dragOffsetY: args[2] } : args[1];

    if (!to) {
        failWithError(ERRORS.API_INCORRECT_DRAGGING_SECOND_ARGUMENT);
        return;
    }
    if (serviceUtils.isJQueryObj(to)) {
        if (to.length < 1) {
            failWithError(ERRORS.API_INCORRECT_DRAGGING_SECOND_ARGUMENT);
            return;
        }
        else
            to = to[0];
    }
    else if (!domUtils.isDomElement(to) && (isNaN(parseInt(to.dragOffsetX)) || isNaN(parseInt(to.dragOffsetY)))) {
        failWithError(ERRORS.API_INCORRECT_DRAGGING_SECOND_ARGUMENT);
        return;
    }

    var options = secondArgIsCoord ? args[3] : args[2];

    stepIterator.asyncActionSeries(
        elements,
        actionArgumentsIterator('drag').run,
        function (element, callback, iframe) {
            ensureElementVisibility(element, 'drag', function () {
                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                if (iframe)
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].drag.playback.run(element, to, options ||
                                                                                                       {}, callback);
                else
                    dragPlaybackAutomation(element, to, options || {}, callback);
            });
        });
}

export function select () {
    var actionStarted = false,
        elements      = ensureArray(arguments[0]),
        args          = $.makeArray(arguments).slice(1),
        secondArg     = null,
        options       = {},
        error         = false,
        commonParent  = null;

    if (!arguments[0])
        failWithError(ERRORS.API_INCORRECT_SELECT_ACTION_ARGUMENTS);

    if (args.length === 1) {
        //NOTE: second action argument is jquery object
        if (serviceUtils.isJQueryObj(args[0])) {
            if (args[0].length < 1) {
                failWithError(ERRORS.API_INCORRECT_SELECT_ACTION_ARGUMENTS);
                return;
            }
            else
                secondArg = args[0][0];
        }
        else
            secondArg = args[0];
    }

    //NOTE: second action argument is dom element or node
    if (args.length === 1 && (domUtils.isDomElement(secondArg) || domUtils.isTextNode(secondArg))) {
        if (styleUtils.isNotVisibleNode(secondArg))
            error = true;
        else {
            options.startNode = serviceUtils.isJQueryObj(elements[0]) ? elements[0][0] : elements[0];
            options.endNode   = secondArg;

            if (!domUtils.isContentEditableElement(options.startNode) ||
                !domUtils.isContentEditableElement(options.endNode))
                error = true;
            else {
                //NOTE: We should find element for perform select action
                commonParent = contentEditable.getNearestCommonAncestor(options.startNode, options.endNode);
                if (!commonParent)
                    error = true;
                else if (domUtils.isTextNode(commonParent)) {
                    if (!commonParent.parentElement)
                        error = true;
                    else
                        elements = [commonParent.parentElement];
                }
                else
                    elements = [commonParent];
            }
        }
    }
    else {
        $.each(args, function (index, value) {
            if (isNaN(parseInt(value)) || (args.length > 1 && value < 0)) {
                error = true;
                return false;
            }
        });
    }

    if (error) {
        failWithError(ERRORS.API_INCORRECT_SELECT_ACTION_ARGUMENTS);
        return;
    }

    stepIterator.asyncActionSeries(
        elements,
        actionArgumentsIterator('select').run,
        function (element, callback, iframe) {
            if (args.length === 1 && !options.startNode)
                options = { offset: args[0] };
            else if (args.length === 2 || (args.length > 2 && element.tagName.toLowerCase() !== 'textarea'))
                options = {
                    startPos: args[0],
                    endPos:   args[1]
                };
            else if (args.length > 2)
                options = {
                    startLine: args[0],
                    startPos:  args[1],
                    endLine:   args[2],
                    endPos:    args[3]
                };

            ensureElementVisibility(element, 'select', function () {
                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                if (iframe)
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].select.playback.run(element, options, callback);
                else
                    selectPlaybackAutomation(element, options, callback);
            });
        });
}

export function type (what, text, options) {
    if (!text) {
        failWithError(ERRORS.API_EMPTY_TYPE_ACTION_ARGUMENT);
        return;
    }

    var actionStarted = false,
        elements      = ensureArray(what);

    stepIterator.asyncActionSeries(
        elements,
        actionArgumentsIterator('type').run,
        function (element, callback, iframe) {
            ensureElementVisibility(element, 'type', function () {
                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                if (iframe)
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].type.playback.run(element, text, options ||
                                                                                                         {}, callback);
                else
                    typePlaybackAutomation(element, text, options || {}, callback);
            });
        });
}

export function hover (what, options) {
    var actionStarted = false,
        elements      = ensureArray(what);

    stepIterator.asyncActionSeries(
        elements,
        actionArgumentsIterator('hover').run,
        function (element, callback, iframe) {
            ensureElementVisibility(element, 'hover', function () {
                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                if (iframe)
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].hover.playback.run(element, callback);
                else
                    hoverPlaybackAutomation(element, options || {}, callback);
            });
        });
}

export function press () {
    stepIterator.asyncActionSeries(
        arguments,
        pressActionArgumentsIterator().run,
        function (keys, callback) {
            if (keyCharUtils.parseKeysString(keys).error)
                failWithError(ERRORS.API_INCORRECT_PRESS_ACTION_ARGUMENT);

            else
                pressPlaybackAutomation(keys, callback);
        });
}

//wait
var conditionIntervalId = null;

function startConditionCheck (condition, onConditionReached) {
    conditionIntervalId = window.setInterval(function () {
        if (stepIterator.callWithSharedDataContext(condition))
            onConditionReached();
    }, CHECK_CONDITION_INTERVAL);
}

function stopConditionCheck () {
    if (conditionIntervalId !== null) {
        window.clearInterval(conditionIntervalId);
        conditionIntervalId = null;
    }
}

export function wait (ms, condition) {
    condition = typeof(condition) === 'function' ? condition : null;

    if (typeof ms !== 'number' || ms < 0) {
        failWithError(ERRORS.API_INCORRECT_WAIT_ACTION_MILLISECONDS_ARGUMENT);
        return;
    }

    stepIterator.asyncAction(function (iteratorCallback) {
        stepIterator.expectInactivity(ms, function () {
            function onConditionReached () {
                window.clearTimeout(timeout);
                stopConditionCheck();
                iteratorCallback();
            }

            var timeout = window.setTimeout(onConditionReached, ms || 0);

            if (condition)
                startConditionCheck(condition, onConditionReached);
        });
    });
}

export function waitFor (event, timeout) {
    var waitForElements = isStringOrStringArray(event, true),
        timeoutExceeded = false;

    if (typeof event !== 'function' && !waitForElements) {
        failWithError(ERRORS.API_INCORRECT_WAIT_FOR_ACTION_EVENT_ARGUMENT);
        return;
    }

    if (typeof timeout === 'undefined')
        timeout = WAIT_FOR_DEFAULT_TIMEOUT;

    if (typeof timeout !== 'number' || timeout < 0) {
        failWithError(ERRORS.API_INCORRECT_WAIT_FOR_ACTION_TIMEOUT_ARGUMENT);
        return;
    }

    onTargetWaitingStarted(true);

    stepIterator.asyncAction(function (iteratorCallback) {
        var timeoutID = window.setTimeout(function () {
            if (waitForElements)
                stopConditionCheck();

            timeoutExceeded = true;
            failWithError(ERRORS.API_WAIT_FOR_ACTION_TIMEOUT_EXCEEDED);
        }, timeout);

        function onConditionReached () {
            if (timeoutExceeded)
                return;

            if (waitForElements)
                stopConditionCheck();

            window.clearTimeout(timeoutID);
            onTargetWaitingFinished();
            iteratorCallback();
        }


        stepIterator.expectInactivity(timeout, function () {
            var condition = null;

            if (waitForElements) {
                if (typeof event === 'string') {
                    condition = function () {
                        return !!$(event).length;
                    };
                }
                else {
                    condition = function () {
                        var elementsExist = true;

                        for (var i = 0; i < event.length; i++) {
                            if (!$(event[i]).length) {
                                elementsExist = false;
                                break;
                            }
                        }

                        return elementsExist;
                    };
                }

                startConditionCheck(condition, onConditionReached);
            }
            else {
                stepIterator.callWithSharedDataContext(function () {
                    event.call(this, function () {
                        onConditionReached();
                    });
                });
            }
        });
    });
}

export function navigateTo (url) {
    var NAVIGATION_DELAY = 1000;

    stepIterator.asyncAction(function (iteratorCallback) {
        window[jsProcessor.SET_PROPERTY_METH_NAME](window, 'location', url);

        //NOTE: give browser some time to navigate
        window.setTimeout(iteratorCallback, NAVIGATION_DELAY);
    });
}

export function upload (what, path) {
    var actionStarted = false,
        elements      = ensureArray(what);

    if (!isStringOrStringArray(path) && path)
        failWithError(ERRORS.API_UPLOAD_INVALID_FILE_PATH_ARGUMENT);

    stepIterator.asyncActionSeries(
        elements,
        actionArgumentsIterator('upload').run,
        function (element, callback) {
            if (!domUtils.isFileInput(element))
                failWithError(ERRORS.API_UPLOAD_ELEMENT_IS_NOT_FILE_INPUT);

            else {
                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                hhUpload(element, path, function (errs) {
                    if (errs.length) {
                        var errPaths = errs.map(function (err) {
                            return err.filePath;
                        });

                        failWithError(ERRORS.API_UPLOAD_CAN_NOT_FIND_FILE_TO_UPLOAD, { filePaths: errPaths });
                    }

                    else
                        callback();
                });
            }
        }
    );
}

export function screenshot () {
    stepIterator.asyncAction(function (iteratorCallback) {
        stepIterator.takeScreenshot(function () {
            iteratorCallback();
        }, false);
    });
}

//NOTE: published for tests purposes only
export function setElementAvailabilityWaitingTimeout (ms) {
    ELEMENT_AVAILABILITY_WAITING_TIMEOUT = ms;
}

//NOTE: add sourceIndex wrapper
sourceIndexTracker.wrapTrackableMethods(exports, CONST.ACTION_FUNC_NAMES);
