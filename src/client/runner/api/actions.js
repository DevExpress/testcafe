import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import testCafeUI from '../deps/testcafe-ui';
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
import async from '../deps/async';


var isJQueryObj = hammerhead.utils.isJQueryObj;

var Sizzle          = testCafeCore.Sizzle;
var SETTINGS        = testCafeCore.SETTINGS;
var ERROR_TYPE      = testCafeCore.ERROR_TYPE;
var contentEditable = testCafeCore.contentEditable;
var domUtils        = testCafeCore.domUtils;
var positionUtils   = testCafeCore.positionUtils;
var styleUtils      = testCafeCore.styleUtils;
var arrayUtils      = testCafeCore.arrayUtils;
var keyCharUtils    = testCafeCore.keyCharUtils;
var selectElement   = testCafeUI.selectElement;


var ELEMENT_AVAILABILITY_WAITING_TIMEOUT = 10000;


const ELEMENT_AVAILABILITY_WAITING_DELAY = 200;
const WAIT_FOR_DEFAULT_TIMEOUT           = 10000;
const CHECK_CONDITION_INTERVAL           = 50;


//Global
var stepIterator = null;

function ensureArray (target) {
    return arrayUtils.isArray(target) ? target : [target];
}

function isStringOrStringArray (target, forbidEmptyArray) {
    if (typeof target === 'string')
        return true;

    if (arrayUtils.isArray(target) && (!forbidEmptyArray || target.length)) {
        for (var i = 0; i < target.length; i++) {
            if (typeof target[i] !== 'string')
                return false;
        }

        return true;
    }

    return false;
}

function failWithError (type, additionalParams) {
    var err = {
        type:          type,
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

            if (res && !(isJQueryObj(res) && !res.length) && array.length) {
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
            failWithError(ERROR_TYPE.emptyFirstArgument, { action: actionName });
        }
    }, ELEMENT_AVAILABILITY_WAITING_TIMEOUT);
}

function ensureElementVisibility (element, actionName, callback) {
    var success = false;
    var tagName = element.tagName.toLowerCase();

    if (tagName === 'option' || tagName === 'optgroup') {
        var parentSelect = domUtils.getSelectParent(element);

        if (!parentSelect) {
            callback();
            return;
        }

        var isOptionListExpanded = selectElement.isOptionListExpanded(parentSelect);
        var selectSizeValue      = styleUtils.getSelectElementSize(parentSelect);

        if (!isOptionListExpanded && selectSizeValue <= 1) {
            failWithError(ERROR_TYPE.invisibleActionElement, {
                element: domUtils.getElementDescription(element),
                action:  actionName
            });
        }
        else
            callback();

        return;
    }

    if (positionUtils.isElementVisible(element)) {
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

            failWithError(ERROR_TYPE.invisibleActionElement, {
                element: domUtils.getElementDescription(element),
                action:  actionName
            });
        }
    }, ELEMENT_AVAILABILITY_WAITING_TIMEOUT);
}

function actionArgumentsIterator (actionName) {
    var runAction = null;

    var iterate = function (item, iterationCallback) {
        if (arrayUtils.isArray(item))
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
                failWithError(ERROR_TYPE.emptyFirstArgument, { action: actionName });
            else
                runAction(elementsArray, iterationCallback);
        }
    };

    var extractArgs = function (items, callback) {
        if (!items.length) {
            failWithError(ERROR_TYPE.emptyFirstArgument, { action: actionName });
        }
        else {
            async.forEachSeries(
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
    else if (typeof item === 'string')
        return Sizzle(item);
    else if (isJQueryObj(item)) {
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
                    failWithError(err.type, {
                        element: err.element,
                        action:  'click'
                    });
                }

                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                if (iframe)
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].click.playback(element, options ||
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
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].rclick.playback(element, options ||
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
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].dblclick.playback(element, options ||
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
        failWithError(ERROR_TYPE.incorrectDraggingSecondArgument);
        return;
    }
    if (isJQueryObj(to)) {
        if (to.length < 1) {
            failWithError(ERROR_TYPE.incorrectDraggingSecondArgument);
            return;
        }
        else
            to = to[0];
    }
    else if (!domUtils.isDomElement(to) && (isNaN(parseInt(to.dragOffsetX)) || isNaN(parseInt(to.dragOffsetY)))) {
        failWithError(ERROR_TYPE.incorrectDraggingSecondArgument);
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
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].drag.playback(element, to, options ||
                                                                                                   {}, callback);
                else
                    dragPlaybackAutomation(element, to, options || {}, callback);
            });
        });
}

export function select () {
    var actionStarted = false,
        elements      = ensureArray(arguments[0]),
        args          = arrayUtils.toArray(arguments).slice(1),
        secondArg     = null,
        options       = {},
        error         = false,
        commonParent  = null;

    if (!arguments[0])
        failWithError(ERROR_TYPE.incorrectSelectActionArguments);

    if (args.length === 1) {
        //NOTE: second action argument is jquery object
        if (isJQueryObj(args[0])) {
            if (args[0].length < 1) {
                failWithError(ERROR_TYPE.incorrectSelectActionArguments);
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
            options.startNode = isJQueryObj(elements[0]) ? elements[0][0] : elements[0];
            options.endNode   = secondArg;

            if (!domUtils.isContentEditableElement(options.startNode) || !domUtils.isContentEditableElement(options.endNode))
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
    else
        error = arrayUtils.some(args, value => isNaN(parseInt(value)) || args.length > 1 && value < 0);

    if (error) {
        failWithError(ERROR_TYPE.incorrectSelectActionArguments);
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
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].select.playback(element, options, callback);
                else
                    selectPlaybackAutomation(element, options, callback);
            });
        });
}

export function type (what, text, options) {
    if (!text) {
        failWithError(ERROR_TYPE.emptyTypeActionArgument);
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
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].type.playback(element, text, options ||
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
                    iframe.contentWindow[automation.AUTOMATION_RUNNERS].hover.playback(element, callback);
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
                failWithError(ERROR_TYPE.incorrectPressActionArgument);

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
        failWithError(ERROR_TYPE.incorrectWaitActionMillisecondsArgument);
        return;
    }

    stepIterator.asyncAction(function (iteratorCallback) {
        function onConditionReached () {
            window.clearTimeout(timeout);
            stopConditionCheck();
            iteratorCallback();
        }

        var timeout = window.setTimeout(onConditionReached, ms || 0);

        if (condition)
            startConditionCheck(condition, onConditionReached);
    });
}

export function waitFor (event, timeout) {
    var waitForElements = isStringOrStringArray(event, true),
        timeoutExceeded = false;

    if (typeof event !== 'function' && !waitForElements) {
        failWithError(ERROR_TYPE.incorrectWaitForActionEventArgument);
        return;
    }

    if (typeof timeout === 'undefined')
        timeout = WAIT_FOR_DEFAULT_TIMEOUT;

    if (typeof timeout !== 'number' || timeout < 0) {
        failWithError(ERROR_TYPE.incorrectWaitForActionTimeoutArgument);
        return;
    }

    onTargetWaitingStarted(true);

    stepIterator.asyncAction(function (iteratorCallback) {
        var timeoutID = window.setTimeout(function () {
            if (waitForElements)
                stopConditionCheck();

            timeoutExceeded = true;
            failWithError(ERROR_TYPE.waitForActionTimeoutExceeded);
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

        var condition = null;

        if (waitForElements) {
            if (typeof event === 'string') {
                condition = function () {
                    return !!Sizzle(event).length;
                };
            }
            else {
                condition = function () {
                    var elementsExist = true;

                    for (var i = 0; i < event.length; i++) {
                        if (!Sizzle(event[i]).length) {
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
}

export function navigateTo (url) {
    var NAVIGATION_DELAY = 1000;

    stepIterator.asyncAction(function (iteratorCallback) {
        hammerhead.navigateTo(url);

        //NOTE: give browser some time to navigate
        window.setTimeout(iteratorCallback, NAVIGATION_DELAY);
    });
}

export function upload (what, path) {
    var actionStarted = false,
        elements      = ensureArray(what);

    if (!isStringOrStringArray(path) && path)
        failWithError(ERROR_TYPE.uploadInvalidFilePathArgument);

    stepIterator.asyncActionSeries(
        elements,
        actionArgumentsIterator('upload').run,
        function (element, callback) {
            if (!domUtils.isFileInput(element))
                failWithError(ERROR_TYPE.uploadElementIsNotFileInput);

            else {
                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                hammerhead.doUpload(element, path)
                    .then((errs) => {
                        if (errs.length) {
                            var errPaths = arrayUtils.map(errs, err => err.filePath);

                            failWithError(ERROR_TYPE.uploadCanNotFindFileToUpload, { filePaths: errPaths });
                        }

                        else
                            callback();
                    });
            }
        }
    );
}

export function screenshot (filePath) {
    stepIterator.asyncAction(function (iteratorCallback) {
        stepIterator.takeScreenshot(function () {
            iteratorCallback();
        }, filePath);
    });
}

//NOTE: published for tests purposes only
export function setElementAvailabilityWaitingTimeout (ms) {
    ELEMENT_AVAILABILITY_WAITING_TIMEOUT = ms;
}

//NOTE: add sourceIndex wrapper
sourceIndexTracker.wrapTrackableMethods(exports, [
    'click',
    'rclick',
    'dblclick',
    'drag',
    'type',
    'wait',
    'waitFor',
    'hover',
    'press',
    'select',
    'navigateTo',
    'upload',
    'screenshot'
]);
