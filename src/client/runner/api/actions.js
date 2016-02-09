import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import testCafeUI from '../deps/testcafe-ui';
import { AUTOMATIONS } from '../automation/automation';
import DragOptions from '../automation/options/drag.js';
import ClickOptions from '../automation/options/click.js';
import MouseOptions from '../automation/options/mouse.js';
import SelectOptions from '../automation/options/select.js';
import { getOffsetOptions } from '../utils/mouse'
import clickPlaybackAutomation from '../automation/playback/click';
import dblClickPlaybackAutomation from '../automation/playback/dblclick';
import DragAutomation from '../automation/playback/drag';
import HoverAutomation from '../automation/playback/hover';
import PressAutomation from '../automation/playback/press';
import RClickAutomation from '../automation/playback/rclick';
import SelectAutomation from '../automation/playback/select';
import typePlaybackAutomation from '../automation/playback/type';
import parseKeyString from '../automation/playback/press/parse-key-string';
import * as sourceIndexTracker from '../source-index';
import async from '../deps/async';


var isJQueryObj = hammerhead.utils.isJQueryObj;

var sandboxedJQuery = testCafeCore.sandboxedJQuery;
var SETTINGS        = testCafeCore.SETTINGS;
var ERROR_TYPE      = testCafeCore.ERROR_TYPE;
var contentEditable = testCafeCore.contentEditable;
var domUtils        = testCafeCore.domUtils;
var positionUtils   = testCafeCore.positionUtils;
var styleUtils      = testCafeCore.styleUtils;
var arrayUtils      = testCafeCore.arrayUtils;
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

function getSelectPositions (element, options) {
    var isTextEditable    = domUtils.isTextEditableElement(element);
    var isContentEditable = domUtils.isContentEditableElement(element);

    var offset         = void 0 !== options.offset ? options.offset : null;
    var startPos       = void 0 !== options.startPos ? options.startPos : null;
    var endPos         = void 0 !== options.endPos ? options.endPos : null;
    var startLineIndex = void 0 !== options.startLine ? options.startLine : null;
    var endLineIndex   = void 0 !== options.endLine ? options.endLine : null;

    var isEmptyPropertyObject = offset === null && startPos === null;
    var value                 = element.value;
    var linesArray            = value && value.length ? value.split('\n') : [];
    var startPosition         = null;
    var endPosition           = null;


    if (isTextEditable && !value.length ||
        isContentEditable && !contentEditable.getContentEditableValue(element).length) {

        return {
            startPos: 0,
            endPos:   0
        };
    }

    if (isEmptyPropertyObject) {
        return {
            startPos: isTextEditable ? 0 : contentEditable.getFirstVisiblePosition(element),
            endPos:   isTextEditable ? value.length : contentEditable.getLastVisiblePosition(element)
        };
    }

    if (offset !== null) {
        if (isTextEditable) {
            if (offset >= 0) {
                startPosition = 0;
                endPosition   = Math.min(offset, value.length);
            }
            else {
                startPosition = value.length;
                endPosition   = Math.max(0, value.length + offset);
            }
        }
        else if (offset >= 0) {
            startPosition = contentEditable.getFirstVisiblePosition(element);
            endPosition   = Math.min(offset, contentEditable.getLastVisiblePosition(element));
        }
        else {
            startPosition = contentEditable.getLastVisiblePosition(element);
            endPosition   = Math.max(0, contentEditable.getLastVisiblePosition(element) + offset);
        }
    }

    if (startLineIndex !== null) {
        if (startLineIndex >= linesArray.length)
            startPosition = value.length;
        else {
            var startLinePosition = domUtils.getTextareaPositionByLineAndOffset(element, startLineIndex, 0);

            startPosition = startLinePosition + Math.min(startPos, linesArray[startLineIndex].length);
        }

        if (endLineIndex >= linesArray.length)
            endPosition = value.length;
        else {
            var endLinePosition = domUtils.getTextareaPositionByLineAndOffset(element, endLineIndex, 0);
            var endLineLength   = linesArray[endLineIndex].length;

            if (endPos === null)
                endPosition = endLinePosition + endLineLength;
            else
                endPosition = endLinePosition + Math.min(endPos, endLineLength);
        }
    }
    else if (startPos !== null) {
        var lastPos = isTextEditable ? value.length : contentEditable.getLastVisiblePosition(element);

        startPosition = Math.min(startPos, lastPos);
        endPosition   = Math.min(endPos, lastPos);
    }

    return {
        startPos: startPosition,
        endPos:   endPosition
    };
}

function getOptionsForContentEditableElement (element, startNode, endNode) {
    var startOffset   = contentEditable.getFirstVisiblePosition(startNode);
    var endOffset     = contentEditable.getLastVisiblePosition(endNode);
    var startPos      = { node: startNode, offset: startOffset };
    var endPos        = { node: endNode, offset: endOffset };
    var startPosition = contentEditable.calculatePositionByNodeAndOffset(element, startPos);
    var endPosition   = contentEditable.calculatePositionByNodeAndOffset(element, endPos);
    var backward      = startPosition > endPosition;

    if (backward) {
        startOffset = contentEditable.getLastVisiblePosition(startNode);
        endOffset   = contentEditable.getFirstVisiblePosition(endNode);
    }

    // NOTE: We should recalculate nodes and offsets for selection because we
    // may have to select children of expectedStartNode and expectedEndNode
    return {
        startPos: contentEditable.calculateNodeAndOffsetByPosition(startNode, startOffset),
        endPos:   contentEditable.calculateNodeAndOffsetByPosition(endNode, endOffset)
    };
}

function getSelectAutomationOptions (element, args) {
    var argsLength = args.length;
    var options    = {};

    if (argsLength === 1)
        options = { offset: args[0] };
    else if (argsLength === 2 || argsLength > 2 && !domUtils.isTextarea(element)) {
        if (!isNaN(parseInt(args[0], 10))) {
            options = {
                startPos: args[0],
                endPos:   args[1]
            };
        }
        else {
            options = {
                startNode: args[0],
                endNode:   args[1]
            };
        }
    }
    else if (args.length > 2) {
        options = {
            startLine: args[0],
            startPos:  args[1],
            endLine:   args[2],
            endPos:    args[3]
        };
    }

    if (!options.startNode)
        options = getSelectPositions(element, options);
    else
        options = getOptionsForContentEditableElement(element, options.startNode, options.endNode);

    var selectOptions = new SelectOptions();

    selectOptions.startPos = options.startPos;
    selectOptions.endPos   = options.endPos;

    return selectOptions;
}

//function exports only for tests
export function parseActionArgument (item, actionName) {
    var elements = [];

    if (domUtils.isDomElement(item))
        return [item];
    else if (actionName && actionName === 'select' && domUtils.isTextNode(item))
        return [item];
    else if (typeof item === 'string')
        return arrayUtils.toArray(sandboxedJQuery.jQuery(item));
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
                    iframe.contentWindow[AUTOMATIONS].click.playback(element, options || {}, callback, onerror);
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

                options = options || {};

                var clickOptions = new ClickOptions();
                var { offsetX, offsetY } = getOffsetOptions(element, options.offsetX, options.offsetY);

                clickOptions.offsetX  = offsetX;
                clickOptions.offsetY  = offsetY;
                clickOptions.caretPos = options.caretPos;

                clickOptions.modifiers.ctrl  = options.ctrl;
                clickOptions.modifiers.alt   = options.alt;
                clickOptions.modifiers.shift = options.shift;
                clickOptions.modifiers.meta  = options.meta;

                var rClickAutomation = iframe ?
                                       new iframe.contentWindow[AUTOMATIONS].RClickAutomation(element, clickOptions) :
                                       new RClickAutomation(element, clickOptions);

                rClickAutomation
                    .run()
                    .then(() => {
                        callback();
                    });
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
                    iframe.contentWindow[AUTOMATIONS].dblclick.playback(element, options || {}, callback);
                else
                    dblClickPlaybackAutomation(element, options || {}, callback);
            });
        });
}

export function drag (what) {
    var actionStarted      = false;
    var args               = arguments;
    var elements           = ensureArray(what);
    var secondArgIsCoord   = !(isNaN(parseInt(args[1])));
    var options            = secondArgIsCoord ? args[3] : args[2];
    var destinationElement = null;
    var dragOffsetX        = null;
    var dragOffsetY        = null;

    if (args.length > 2 && secondArgIsCoord) {
        dragOffsetX = args[1];
        dragOffsetY = args[2];
    }
    else {
        destinationElement = args[1];

        if (!destinationElement) {
            failWithError(ERROR_TYPE.incorrectDraggingSecondArgument);
            return;
        }
    }

    if (isJQueryObj(destinationElement)) {
        if (destinationElement.length < 1) {
            failWithError(ERROR_TYPE.incorrectDraggingSecondArgument);
            return;
        }
        else
            destinationElement = destinationElement[0];
    }
    else if (!domUtils.isDomElement(destinationElement) &&
             (isNaN(parseInt(dragOffsetX)) || isNaN(parseInt(dragOffsetY)))) {
        failWithError(ERROR_TYPE.incorrectDraggingSecondArgument);
        return;
    }

    stepIterator.asyncActionSeries(
        elements,
        actionArgumentsIterator('drag').run,
        function (element, callback, iframe) {
            ensureElementVisibility(element, 'drag', function () {
                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                options = options || {};

                var dragOptions = new DragOptions();
                var { offsetX, offsetY } = getOffsetOptions(element, options.offsetX, options.offsetY);

                dragOptions.offsetX            = offsetX;
                dragOptions.offsetY            = offsetY;
                dragOptions.destinationElement = destinationElement;
                dragOptions.dragOffsetX        = dragOffsetX;
                dragOptions.dragOffsetY        = dragOffsetY;

                dragOptions.modifiers.ctrl  = options.ctrl;
                dragOptions.modifiers.alt   = options.alt;
                dragOptions.modifiers.shift = options.shift;
                dragOptions.modifiers.meta  = options.meta;

                var dragAutomation = iframe ?
                                     new iframe.contentWindow[AUTOMATIONS].DragAutomation(element, dragOptions) :
                                     new DragAutomation(element, dragOptions);

                dragAutomation
                    .run()
                    .then(() => {
                        callback();
                    });
            });
        });
}

export function select () {
    var actionStarted       = false;
    var elements            = arguments[0] ? ensureArray(arguments[0]) : null;
    var args                = arrayUtils.toArray(arguments).slice(1);
    var firstArg            = args ? args[0] : null;
    var startNode           = null;
    var endNode             = null;
    var error               = false;
    var commonParentElement = null;

    if (!elements) {
        failWithError(ERROR_TYPE.incorrectSelectActionArguments);
        return;
    }

    if (firstArg && isJQueryObj(firstArg)) {
        if (firstArg.length < 1) {
            failWithError(ERROR_TYPE.incorrectSelectActionArguments);
            return;
        }
        else
            firstArg = firstArg[0];
    }

    // NOTE: the second action argument is a dom element or a text node
    if (args.length === 1 && (domUtils.isDomElement(firstArg) || domUtils.isTextNode(firstArg))) {
        if (styleUtils.isNotVisibleNode(firstArg)) {
            failWithError(ERROR_TYPE.incorrectSelectActionArguments);
            return;
        }

        startNode = isJQueryObj(elements[0]) ? elements[0][0] : elements[0];
        endNode   = firstArg;

        if (!domUtils.isContentEditableElement(startNode) || !domUtils.isContentEditableElement(endNode))
            error = true;
        else {
            // NOTE: We should find a common element for the nodes to perform the select action
            var commonParent = contentEditable.getNearestCommonAncestor(startNode, endNode);

            if (!commonParent)
                error = true;
            else {
                commonParentElement = domUtils.isTextNode(commonParent) ? commonParent.parentElement : commonParent;

                if (!commonParentElement)
                    error = true;
            }
        }
    }
    else
        error = arrayUtils.some(args, value => isNaN(parseInt(value)) || args.length > 1 && value < 0);

    if (error) {
        failWithError(ERROR_TYPE.incorrectSelectActionArguments);
        return;
    }

    var selectArgs = startNode && endNode ? [startNode, endNode] : args;

    stepIterator.asyncActionSeries(
        commonParentElement ? [commonParentElement] : elements,
        actionArgumentsIterator('select').run,
        function (element, callback, iframe) {
            ensureElementVisibility(element, 'select', function () {
                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                var selectOptions = getSelectAutomationOptions(element, selectArgs);

                var selectAutomation = iframe ?
                                       new iframe.contentWindow[AUTOMATIONS].SelectAutomation(element, selectOptions) :
                                       new SelectAutomation(element, selectOptions);

                selectAutomation
                    .run()
                    .then(callback);
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
                    iframe.contentWindow[AUTOMATIONS].type.playback(element, text, options || {}, callback);
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

                options = options || {};

                var hoverOptions = new MouseOptions();
                var { offsetX, offsetY } = getOffsetOptions(element, options.offsetX, options.offsetY);

                hoverOptions.offsetX = offsetX;
                hoverOptions.offsetY = offsetY;

                hoverOptions.modifiers.ctrl  = options.ctrl;
                hoverOptions.modifiers.alt   = options.alt;
                hoverOptions.modifiers.shift = options.shift;
                hoverOptions.modifiers.meta  = options.meta;

                var hoverAutomation = iframe ?
                                      new iframe.contentWindow[AUTOMATIONS].HoverAutomation(element, hoverOptions) :
                                      new HoverAutomation(element, hoverOptions);

                hoverAutomation
                    .run()
                    .then(() => {
                        callback();
                    });
            });
        });
}

export function press () {
    stepIterator.asyncActionSeries(
        arguments,
        pressActionArgumentsIterator().run,
        function (keyString, callback) {
            var parsedKeyString = parseKeyString(keyString);

            if (parsedKeyString.error)
                failWithError(ERROR_TYPE.incorrectPressActionArgument);
            else {
                var pressAutomation = new PressAutomation(parsedKeyString.combinations);

                pressAutomation
                    .run()
                    .then(callback);
            }
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
                    return !!sandboxedJQuery.jQuery(event).length;
                };
            }
            else {
                condition = function () {
                    var elementsExist = true;

                    for (var i = 0; i < event.length; i++) {
                        if (!sandboxedJQuery.jQuery(event[i]).length) {
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
                            var errPaths = arrayUtils.map(errs, err => err.path);

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
