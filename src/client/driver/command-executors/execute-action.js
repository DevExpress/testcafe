import { Promise } from '../deps/hammerhead';
import {
    domUtils,
    contentEditable,
    RequestBarrier,
    pageUnloadBarrier,
    parseKeySequence,
    delay,
    NODE_TYPE_DESCRIPTIONS
} from '../deps/testcafe-core';

import ScriptExecutionBarrier from '../script-execution-barrier';

import {
    ERROR_TYPES as AUTOMATION_ERROR_TYPES,
    calculateSelectTextArguments,
    getOffsetOptions,
    Click as ClickAutomation,
    SelectChildClick as SelectChildClickAutomation,
    RClick as RClickAutomation,
    DblClick as DblClickAutomation,
    DragToOffset as DragToOffsetAutomation,
    DragToElement as DragToElementAutomation,
    Hover as HoverAutomation,
    Type as TypeAutomation,
    SelectText as SelectTextAutomation,
    SelectEditableContent as SelectEditableContentAutomation,
    Press as PressAutomation,
    Upload as UploadAutomation
} from '../deps/testcafe-automation';

import DriverStatus from '../status';
import SelectorExecutor from './client-functions/selector-executor';
import COMMAND_TYPE from '../../../test-run/commands/type';

import {
    ActionElementNotFoundError,
    ActionElementIsInvisibleError,
    ActionSelectorMatchesWrongNodeTypeError,
    ActionAdditionalElementNotFoundError,
    ActionAdditionalElementIsInvisibleError,
    ActionAdditionalSelectorMatchesWrongNodeTypeError,
    ActionIncorrectKeysError,
    ActionCanNotFindFileToUploadError,
    ActionElementNonEditableError,
    ActionElementNonContentEditableError,
    ActionRootContainerNotFoundError,
    ActionElementNotTextAreaError,
    ActionElementIsNotFileInputError
} from '../../../errors/test-run';


const MAX_DELAY_AFTER_STEP                  = 2000;
const CHECK_ELEMENT_IN_AUTOMATIONS_INTERVAL = 250;


// Ensure command element properties
function ensureElementEditable (element) {
    if (!domUtils.isEditableElement(element))
        throw new ActionElementNonEditableError();
}

function ensureTextAreaElement (element) {
    if (!domUtils.isTextAreaElement(element))
        throw new ActionElementNotTextAreaError();
}

function ensureContentEditableElement (element, argumentTitle) {
    if (!domUtils.isContentEditableElement(element))
        throw new ActionElementNonContentEditableError(argumentTitle);
}

function ensureRootContainer (elements) {
    // NOTE: We should find a common element for the nodes to perform the select action
    if (!contentEditable.getNearestCommonAncestor(elements[0], elements[1]))
        throw new ActionRootContainerNotFoundError();

    return elements;
}

function ensureFileInput (element) {
    if (!domUtils.isFileInput(element))
        throw new ActionElementIsNotFileInputError();
}

function ensureCommandElementsProperties (command, elements) {
    if (command.type === COMMAND_TYPE.selectText)
        ensureElementEditable(elements[0]);

    else if (command.type === COMMAND_TYPE.selectTextAreaContent)
        ensureTextAreaElement(elements[0]);

    else if (command.type === COMMAND_TYPE.selectEditableContent) {
        ensureContentEditableElement(elements[0], 'startSelector');
        ensureContentEditableElement(elements[1], 'endSelector');
        ensureRootContainer(elements);
    }

    else if (command.type === COMMAND_TYPE.setFilesToUpload || command.type === COMMAND_TYPE.clearUpload)
        ensureFileInput(elements[0]);
}

// Ensure command elements
function ensureCommandElements (command, globalSelectorTimeout, statusBar) {
    var elements             = [];
    var ensureElementPromise = Promise.resolve();
    var startTime            = new Date();

    var ensureElement = (selectorCommand, createNotFoundError, createIsInvisibleError, createHasWrongNodeTypeError) => {
        ensureElementPromise = ensureElementPromise
            .then(() => {
                var selectorExecutor = new SelectorExecutor(selectorCommand, globalSelectorTimeout, startTime, statusBar,
                    createNotFoundError, createIsInvisibleError);

                return selectorExecutor.getResult();
            })
            .then(el => {
                if (!domUtils.isDomElement(el))
                    throw createHasWrongNodeTypeError(NODE_TYPE_DESCRIPTIONS[el.nodeType]);

                elements.push(el);
            });
    };

    if (command.selector) {
        ensureElement(
            command.selector,
            () => new ActionElementNotFoundError(),
            () => new ActionElementIsInvisibleError(),
            nodeDescription => new ActionSelectorMatchesWrongNodeTypeError(nodeDescription)
        );
    }

    if (command.type === COMMAND_TYPE.dragToElement) {
        ensureElement(
            command.destinationSelector,
            () => new ActionAdditionalElementNotFoundError('destinationSelector'),
            () => new ActionAdditionalElementIsInvisibleError('destinationSelector'),
            nodeDescription => new ActionAdditionalSelectorMatchesWrongNodeTypeError('destinationSelector', nodeDescription)
        );
    }

    else if (command.type === COMMAND_TYPE.selectEditableContent) {
        ensureElement(
            command.startSelector,
            () => new ActionAdditionalElementNotFoundError('startSelector'),
            () => new ActionAdditionalElementIsInvisibleError('startSelector'),
            nodeDescription => new ActionAdditionalSelectorMatchesWrongNodeTypeError('startSelector', nodeDescription)
        );

        ensureElement(
            command.endSelector || command.startSelector,
            () => new ActionAdditionalElementNotFoundError('endSelector'),
            () => new ActionAdditionalElementIsInvisibleError('endSelector'),
            nodeDescription => new ActionAdditionalSelectorMatchesWrongNodeTypeError('endSelector', nodeDescription)
        );
    }

    return ensureElementPromise
        .then(() => {
            ensureCommandElementsProperties(command, elements);

            return elements;
        });
}


// Ensure options and arguments
function ensureCommandArguments (command) {
    if (command.type === COMMAND_TYPE.pressKey) {
        var parsedKeySequence = parseKeySequence(command.keys);

        if (parsedKeySequence.error)
            throw new ActionIncorrectKeysError('keys');
    }
}

function ensureOffsetOptions (element, options) {
    var { offsetX, offsetY } = getOffsetOptions(element, options.offsetX, options.offsetY);

    options.offsetX = offsetX;
    options.offsetY = offsetY;
}


// Automations
function createAutomation (elements, command) {
    var selectArgs = null;

    if (command.options && 'offsetX' in command.options && 'offsetY' in command.options)
        ensureOffsetOptions(elements[0], command.options);

    switch (command.type) {
        case COMMAND_TYPE.click :
            if (/option|optgroup/.test(domUtils.getTagName(elements[0])))
                return new SelectChildClickAutomation(elements[0], command.options);

            return new ClickAutomation(elements[0], command.options);

        case COMMAND_TYPE.rightClick :
            return new RClickAutomation(elements[0], command.options);

        case COMMAND_TYPE.doubleClick :
            return new DblClickAutomation(elements[0], command.options);

        case COMMAND_TYPE.hover :
            return new HoverAutomation(elements[0], command.options);

        case COMMAND_TYPE.drag :
            return new DragToOffsetAutomation(elements[0], command.dragOffsetX, command.dragOffsetY, command.options);

        case COMMAND_TYPE.dragToElement :
            return new DragToElementAutomation(elements[0], elements[1], command.options);

        case COMMAND_TYPE.typeText:
            return new TypeAutomation(elements[0], command.text, command.options);

        case COMMAND_TYPE.selectText:
        case COMMAND_TYPE.selectTextAreaContent:
            selectArgs = calculateSelectTextArguments(elements[0], command);

            return new SelectTextAutomation(elements[0], selectArgs.startPos, selectArgs.endPos, command.options);

        case COMMAND_TYPE.selectEditableContent:
            return new SelectEditableContentAutomation(elements[0], elements[1], command.options);

        case COMMAND_TYPE.pressKey:
            return new PressAutomation(parseKeySequence(command.keys).combinations, command.options);

        case COMMAND_TYPE.setFilesToUpload :
            return new UploadAutomation(elements[0], command.filePath,
                filePaths => new ActionCanNotFindFileToUploadError(filePaths)
            );

        case COMMAND_TYPE.clearUpload :
            return new UploadAutomation(elements[0]);
    }

    return null;
}


// Execute action
export default function executeAction (command, globalSelectorTimeout, statusBar, testSpeed) {
    var resolveStartPromise = null;

    var startPromise = new Promise(resolve => {
        resolveStartPromise = resolve;
    });

    if (command.options && !command.options.speed)
        command.options.speed = testSpeed;

    var delayAfterAction = () => {
        if (!command.options || command.options.speed === 1)
            return Promise.resolve();

        return delay((1 - command.options.speed) * MAX_DELAY_AFTER_STEP);
    };

    var completionPromise = new Promise(resolve => {
        var startTime = new Date();

        try {
            ensureCommandArguments(command);
        }
        catch (err) {
            resolve(new DriverStatus({ isCommandResult: true, executionError: err }));
            return;
        }

        var requestBarrier         = new RequestBarrier();
        var scriptExecutionBarrier = new ScriptExecutionBarrier();

        pageUnloadBarrier.watchForPageNavigationTriggers();

        var hasSpecificTimeout     = command.selector && typeof command.selector.timeout === 'number';
        var commandSelectorTimeout = hasSpecificTimeout ? command.selector.timeout : globalSelectorTimeout;

        function runRecursively (forced) {
            return ensureCommandElements(command, globalSelectorTimeout, statusBar)
                .then(elements => {
                    var automation = createAutomation(elements, command);

                    if (automation.TARGET_ELEMENT_FOUND_EVENT)
                        automation.on(automation.TARGET_ELEMENT_FOUND_EVENT, resolveStartPromise);
                    else
                        resolveStartPromise();

                    return automation.run(!forced);
                })
                .catch(err => {
                    var timeoutExpired = Date.now() - startTime >= commandSelectorTimeout;

                    if (timeoutExpired) {
                        if (err.message === AUTOMATION_ERROR_TYPES.foundElementIsNotTarget) {
                            // If we can't get a target element via elementFromPoint but it's
                            // visible we click on the point where the element is located.
                            return runRecursively(true);
                        }

                        throw err.message === AUTOMATION_ERROR_TYPES.elementIsInvisibleError ?
                              new ActionElementIsInvisibleError() : err;
                    }

                    return delay(CHECK_ELEMENT_IN_AUTOMATIONS_INTERVAL).then(runRecursively);
                });
        }

        runRecursively()
            .then(() => {
                return Promise.all([
                    delayAfterAction(),

                    // NOTE: script can be added by xhr-request, so we should run
                    // script execution barrier waiting after request barrier resolved
                    requestBarrier
                        .wait()
                        .then(() => scriptExecutionBarrier.wait()),

                    pageUnloadBarrier.wait()
                ]);
            })
            .then(() => resolve(new DriverStatus({ isCommandResult: true })))
            .catch(err => resolve(new DriverStatus({ isCommandResult: true, executionError: err })));
    });

    return { startPromise, completionPromise };
}
