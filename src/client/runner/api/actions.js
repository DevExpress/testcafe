import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import testCafeUI from '../deps/testcafe-ui';
import { AUTOMATIONS } from '../automation/automation';
import {
    DragOptions,
    MouseOptions,
    ClickOptions,
    TypeOptions
} from '../../../test-run/commands/options';
import ClickAutomation from '../automation/playback/click';
import DblClickAutomation from '../automation/playback/dblclick';
import DragToOffsetAutomation from '../automation/playback/drag/to-offset';
import DragToElementAutomation from '../automation/playback/drag/to-element';
import HoverAutomation from '../automation/playback/hover';
import PressAutomation from '../automation/playback/press';
import RClickAutomation from '../automation/playback/rclick';
import SelectTextAutomation from '../automation/playback/select/select-text';
import SelectEditableContentAutomation from '../automation/playback/select/select-editable-content';
import TypeAutomation from '../automation/playback/type';
import { getOffsetOptions } from '../utils/mouse';
import getSelectPositionArguments from '../automation/playback/select/get-select-position-arguments';
import parseKeySequence from '../automation/playback/press/parse-key-sequence';
import * as sourceIndexTracker from '../source-index';
import async from '../deps/async';


var isJQueryObj   = hammerhead.utils.isJQueryObj;
var nativeMethods = hammerhead.nativeMethods;

var sandboxedJQuery = testCafeCore.sandboxedJQuery;
var SETTINGS        = testCafeCore.SETTINGS;
var ERROR_TYPE      = testCafeCore.ERROR_TYPE;
var contentEditable = testCafeCore.contentEditable;
var domUtils        = testCafeCore.domUtils;
var positionUtils   = testCafeCore.positionUtils;
var styleUtils      = testCafeCore.styleUtils;
var arrayUtils      = testCafeCore.arrayUtils;
var selectElement   = testCafeUI.selectElement;


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

    var interval = nativeMethods.setInterval.call(window, function () {
        if (ensureExists()) {
            success = true;
            window.clearInterval(interval);
        }
    }, ELEMENT_AVAILABILITY_WAITING_DELAY);

    nativeMethods.setTimeout.call(window, function () {
        if (!success) {
            window.clearInterval(interval);
            failWithError(ERROR_TYPE.emptyFirstArgument, { action: actionName });
        }
    }, SETTINGS.get().ELEMENT_AVAILABILITY_TIMEOUT);
}

function ensureElementVisibility (element, actionName, callback) {
    var success = false;

    if (domUtils.isOptionElement(element) || domUtils.getTagName(element) === 'optgroup') {
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

    var interval = nativeMethods.setInterval.call(window, function () {
        if (positionUtils.isElementVisible(element)) {
            success = true;
            window.clearInterval(interval);
            callback();
        }
    }, ELEMENT_AVAILABILITY_WAITING_DELAY);

    nativeMethods.setTimeout.call(window, function () {
        if (!success) {
            window.clearInterval(interval);

            failWithError(ERROR_TYPE.invisibleActionElement, {
                element: domUtils.getElementDescription(element),
                action:  actionName
            });
        }
    }, SETTINGS.get().ELEMENT_AVAILABILITY_TIMEOUT);
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
        isWaitAction: isWaitAction
    });
}

function onTargetWaitingFinished () {
    stepIterator.onActionRun();
}

function getSelectAutomationArgumentsObject (element, apiArgs) {
    var argsLength = apiArgs.length;

    if (argsLength === 1)
        return { offset: apiArgs[0] };
    else if (argsLength === 2 || argsLength > 2 && !domUtils.isTextAreaElement(element)) {
        if (!isNaN(parseInt(apiArgs[0], 10))) {
            return {
                startPos: apiArgs[0],
                endPos:   apiArgs[1]
            };
        }
        else {
            return {
                startNode: apiArgs[0],
                endNode:   apiArgs[1]
            };
        }
    }
    else if (apiArgs.length > 2) {
        return {
            startLine: apiArgs[0],
            startPos:  apiArgs[1],
            endLine:   apiArgs[2],
            endPos:    apiArgs[3]
        };
    }
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

                options = options || {};

                var { offsetX, offsetY } = getOffsetOptions(element, options.offsetX, options.offsetY);

                var clickOptions = new ClickOptions({
                    offsetX,
                    offsetY,
                    caretPos:  options.caretPos,
                    modifiers: options
                }, false);

                var clickAutomation = iframe ?
                                      new iframe.contentWindow[AUTOMATIONS].ClickAutomation(element, clickOptions) :
                                      new ClickAutomation(element, clickOptions);

                clickAutomation
                    .run()
                    .then(callback);
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

                var { offsetX, offsetY } = getOffsetOptions(element, options.offsetX, options.offsetY);

                var clickOptions = new ClickOptions({
                    offsetX,
                    offsetY,
                    caretPos:  options.caretPos,
                    modifiers: options
                }, false);

                var rClickAutomation = iframe ?
                                       new iframe.contentWindow[AUTOMATIONS].RClickAutomation(element, clickOptions) :
                                       new RClickAutomation(element, clickOptions);

                rClickAutomation
                    .run()
                    .then(callback);
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

                options = options || {};

                var { offsetX, offsetY } = getOffsetOptions(element, options.offsetX, options.offsetY);

                var clickOptions = new ClickOptions({
                    offsetX,
                    offsetY,
                    caretPos:  options.caretPos,
                    modifiers: options
                }, false);

                var dblClickAutomation = iframe ?
                                         new iframe.contentWindow[AUTOMATIONS].DblClickAutomation(element, clickOptions) :
                                         new DblClickAutomation(element, clickOptions);

                dblClickAutomation
                    .run()
                    .then(callback);
            });
        });
}

export function drag (what) {
    var actionStarted      = false;
    var args               = arguments;
    var elements           = ensureArray(what);
    var secondArgIsCoord   = !(isNaN(parseInt(args[1])));
    var DragAutomationCtor = null;
    var dragAutomation     = null;
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

                var { offsetX, offsetY } = getOffsetOptions(element, options.offsetX, options.offsetY);

                // NOTE: Need to round offsets due to GH-365
                dragOffsetX = Math.round(dragOffsetX);
                dragOffsetY = Math.round(dragOffsetY);

                var mouseOptions = new MouseOptions({
                    offsetX,
                    offsetY,
                    modifiers: options
                }, false);

                if (destinationElement) {
                    DragAutomationCtor = iframe ?
                                         iframe.contentWindow[AUTOMATIONS].DragToElementAutomation :
                                         DragToElementAutomation;

                    dragAutomation = new DragAutomationCtor(element, destinationElement, mouseOptions);
                }
                else {
                    DragAutomationCtor = iframe ?
                                         iframe.contentWindow[AUTOMATIONS].DragToOffsetAutomation :
                                         DragToOffsetAutomation;

                    dragAutomation = new DragAutomationCtor(element, dragOffsetX, dragOffsetY, mouseOptions);
                }

                dragAutomation
                    .run()
                    .then(callback);
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

    stepIterator.asyncActionSeries(
        commonParentElement ? [commonParentElement] : elements,
        actionArgumentsIterator('select').run,
        function (element, callback, iframe) {
            ensureElementVisibility(element, 'select', function () {
                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                var iframeAutomations    = iframe ? iframe.contentWindow[AUTOMATIONS] : null;
                var SelectAutomationCtor = null;
                var selectAutomation     = null;

                if (startNode && endNode) {
                    SelectAutomationCtor = iframe ? iframeAutomations.SelectEditableContentAutomation : SelectEditableContentAutomation;
                    selectAutomation     = new SelectAutomationCtor(startNode, endNode);
                }
                else {
                    var selectArgsObject = getSelectAutomationArgumentsObject(element, args);
                    var { startPos, endPos }    = getSelectPositionArguments(element, selectArgsObject);

                    SelectAutomationCtor = iframe ? iframeAutomations.SelectTextAutomation : SelectTextAutomation;
                    selectAutomation     = new SelectAutomationCtor(element, startPos, endPos);
                }

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

    var actionStarted = false;
    var elements      = ensureArray(what);

    stepIterator.asyncActionSeries(
        elements,
        actionArgumentsIterator('type').run,
        function (element, callback, iframe) {
            ensureElementVisibility(element, 'type', function () {
                if (!actionStarted) {
                    actionStarted = true;
                    onTargetWaitingFinished();
                }

                options = options || {};

                var { offsetX, offsetY } = getOffsetOptions(element, options.offsetX, options.offsetY);
                var typeOptions = new TypeOptions({
                    offsetX,
                    offsetY,
                    caretPos: options.caretPos,
                    replace:  options.replace,

                    modifiers: options
                }, false);

                var typeAutomation = iframe ?
                                     new iframe.contentWindow[AUTOMATIONS].TypeAutomation(element, text, typeOptions) :
                                     new TypeAutomation(element, text, typeOptions);

                typeAutomation
                    .run()
                    .then(callback);
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

                var { offsetX, offsetY } = getOffsetOptions(element, options.offsetX, options.offsetY);

                var hoverOptions = new MouseOptions({
                    offsetX,
                    offsetY,
                    modifiers: options
                }, false);

                var hoverAutomation = iframe ?
                                      new iframe.contentWindow[AUTOMATIONS].HoverAutomation(element, hoverOptions) :
                                      new HoverAutomation(element, hoverOptions);

                hoverAutomation
                    .run()
                    .then(callback);
            });
        });
}

export function press () {
    stepIterator.asyncActionSeries(
        arguments,
        pressActionArgumentsIterator().run,
        function (keySequence, callback) {
            var parsedKeySequence = parseKeySequence(keySequence);

            if (parsedKeySequence.error)
                failWithError(ERROR_TYPE.incorrectPressActionArgument);
            else {
                var pressAutomation = new PressAutomation(parsedKeySequence.combinations);

                pressAutomation
                    .run()
                    .then(callback);
            }
        });
}

//wait
var conditionIntervalId = null;

function startConditionCheck (condition, onConditionReached) {
    conditionIntervalId = nativeMethods.setInterval.call(window, function () {
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

        var timeout = nativeMethods.setTimeout.call(window, onConditionReached, ms || 0);

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
        var timeoutID = nativeMethods.setTimeout.call(window, function () {
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
        nativeMethods.setTimeout.call(window, iteratorCallback, NAVIGATION_DELAY);
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
    SETTINGS.get().ELEMENT_AVAILABILITY_TIMEOUT = ms;
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
