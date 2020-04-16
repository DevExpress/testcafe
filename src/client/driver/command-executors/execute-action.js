import { Promise } from '../deps/hammerhead';
import { SelectorElementActionTransform, createReplicator } from './client-functions/replicator';

import {
    domUtils,
    promiseUtils,
    contentEditable,
    parseKeySequence,
    delay
} from '../deps/testcafe-core';

import {
    calculateSelectTextArguments,
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
    Upload as UploadAutomation,
    ERROR_TYPES as AUTOMATION_ERROR_TYPES,
    getOffsetOptions
} from '../deps/testcafe-automation';

import DriverStatus from '../status';

import runWithBarriers from '../utils/run-with-barriers';
import { ensureElements, createElementDescriptor, createAdditionalElementDescriptor } from '../utils/ensure-elements';

import {
    ActionElementIsInvisibleError,
    ActionIncorrectKeysError,
    ActionCannotFindFileToUploadError,
    ActionElementNonEditableError,
    ActionElementNonContentEditableError,
    ActionRootContainerNotFoundError,
    ActionElementNotTextAreaError,
    ActionElementIsNotFileInputError
} from '../../../errors/test-run';

import COMMAND_TYPE from '../../../test-run/commands/type';


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

function ensureOffsetOptions (element, options) {
    const { offsetX, offsetY } = getOffsetOptions(element, options.offsetX, options.offsetY);

    options.offsetX = offsetX;
    options.offsetY = offsetY;
}

const MAX_DELAY_AFTER_EXECUTION             = 2000;
const CHECK_ELEMENT_IN_AUTOMATIONS_INTERVAL = 250;

class ActionExecutor {
    constructor (command, globalSelectorTimeout, statusBar, testSpeed) {
        this.command                = command;
        this.globalSelectorTimeout  = globalSelectorTimeout;
        this.statusBar              = statusBar;
        this.testSpeed              = testSpeed;

        this.targetElement           = null;
        this.elements                = [];
        this.ensureElementsPromise   = null;
        this.ensureElementsStartTime = null;

        this.executionStartTime      = null;
        this.executionStartedHandler = null;
        this.commandSelectorTimeout  = null;
    }

    _getSpecificTimeout () {
        const hasSpecificTimeout = this.command.selector && typeof this.command.selector.timeout === 'number';

        return hasSpecificTimeout ? this.command.selector.timeout : this.globalSelectorTimeout;
    }

    _delayAfterExecution () {
        if (!this.command.options || this.command.options.speed === 1)
            return Promise.resolve();

        return delay((1 - this.command.options.speed) * MAX_DELAY_AFTER_EXECUTION);
    }

    _isExecutionTimeoutExpired () {
        return Date.now() - this.executionStartTime >= this.commandSelectorTimeout;
    }

    _ensureCommandArguments () {
        if (this.command.type === COMMAND_TYPE.pressKey) {
            const parsedKeySequence = parseKeySequence(this.command.keys);

            if (parsedKeySequence.error)
                throw new ActionIncorrectKeysError('keys');
        }
    }

    _ensureCommandElements () {
        const elementDescriptors = [];

        if (this.command.selector)
            elementDescriptors.push(createElementDescriptor(this.command.selector));

        if (this.command.type === COMMAND_TYPE.dragToElement)
            elementDescriptors.push(createAdditionalElementDescriptor(this.command.destinationSelector, 'destinationSelector'));
        else if (this.command.type === COMMAND_TYPE.selectEditableContent) {
            elementDescriptors.push(createAdditionalElementDescriptor(this.command.startSelector, 'startSelector'));
            elementDescriptors.push(createAdditionalElementDescriptor(this.command.endSelector || this.command.startSelector, 'endSelector'));
        }

        return ensureElements(elementDescriptors, this.globalSelectorTimeout)
            .then(elements => {
                this.elements = elements;
            });
    }

    _ensureCommandElementsProperties () {
        if (this.command.type === COMMAND_TYPE.selectText)
            ensureElementEditable(this.elements[0]);

        else if (this.command.type === COMMAND_TYPE.selectTextAreaContent)
            ensureTextAreaElement(this.elements[0]);

        else if (this.command.type === COMMAND_TYPE.selectEditableContent) {
            ensureContentEditableElement(this.elements[0], 'startSelector');
            ensureContentEditableElement(this.elements[1], 'endSelector');
            ensureRootContainer(this.elements);
        }

        else if (this.command.type === COMMAND_TYPE.setFilesToUpload || this.command.type === COMMAND_TYPE.clearUpload)
            ensureFileInput(this.elements[0]);
    }

    _ensureCommandOptions () {
        if (this.elements.length && this.command.options && 'offsetX' in this.command.options && 'offsetY' in this.command.options)
            ensureOffsetOptions(this.elements[0], this.command.options);
    }

    _createAutomation () {
        let selectArgs = null;

        switch (this.command.type) {
            case COMMAND_TYPE.click :
                if (/option|optgroup/.test(domUtils.getTagName(this.elements[0])))
                    return new SelectChildClickAutomation(this.elements[0], this.command.options);

                return new ClickAutomation(this.elements[0], this.command.options);

            case COMMAND_TYPE.rightClick :
                return new RClickAutomation(this.elements[0], this.command.options);

            case COMMAND_TYPE.doubleClick :
                return new DblClickAutomation(this.elements[0], this.command.options);

            case COMMAND_TYPE.hover :
                return new HoverAutomation(this.elements[0], this.command.options);

            case COMMAND_TYPE.drag :
                return new DragToOffsetAutomation(this.elements[0], this.command.dragOffsetX, this.command.dragOffsetY, this.command.options);

            case COMMAND_TYPE.dragToElement :
                return new DragToElementAutomation(this.elements[0], this.elements[1], this.command.options);

            case COMMAND_TYPE.typeText:
                // eslint-disable-next-line no-restricted-properties
                return new TypeAutomation(this.elements[0], this.command.text, this.command.options);

            case COMMAND_TYPE.selectText:
            case COMMAND_TYPE.selectTextAreaContent:
                selectArgs = calculateSelectTextArguments(this.elements[0], this.command);

                return new SelectTextAutomation(this.elements[0], selectArgs.startPos, selectArgs.endPos, this.command.options);

            case COMMAND_TYPE.selectEditableContent:
                return new SelectEditableContentAutomation(this.elements[0], this.elements[1], this.command.options);

            case COMMAND_TYPE.pressKey:
                return new PressAutomation(parseKeySequence(this.command.keys).combinations, this.command.options);

            case COMMAND_TYPE.setFilesToUpload :
                return new UploadAutomation(this.elements[0], this.command.filePath,
                    (filePaths, scannedFilePaths) => new ActionCannotFindFileToUploadError(filePaths, scannedFilePaths)
                );

            case COMMAND_TYPE.clearUpload :
                return new UploadAutomation(this.elements[0]);
        }

        return null;
    }

    _runAction (strictElementCheck) {
        return this
            ._ensureCommandElements()
            .then(() => this._ensureCommandElementsProperties())
            .then(() => {
                this._ensureCommandOptions();

                const automation = this._createAutomation();

                if (automation.TARGET_ELEMENT_FOUND_EVENT) {
                    automation.on(automation.TARGET_ELEMENT_FOUND_EVENT, e => {
                        this.targetElement = e.element;

                        this.statusBar.hideWaitingElementStatus(true);
                        this.executionStartedHandler();
                    });
                }
                else {
                    this.statusBar.hideWaitingElementStatus(true);
                    this.executionStartedHandler();
                }

                return automation
                    .run(strictElementCheck);
            });
    }

    _runRecursively () {
        let actionFinished     = false;
        let strictElementCheck = true;

        return promiseUtils.whilst(() => !actionFinished, () => {
            return this
                ._runAction(strictElementCheck)
                .then(() => {
                    actionFinished = true;
                })
                .catch(err => {
                    if (this._isExecutionTimeoutExpired()) {
                        if (err.message === AUTOMATION_ERROR_TYPES.foundElementIsNotTarget) {
                            // If we can't get a target element via elementFromPoint but it's
                            // visible we click on the point where the element is located.
                            strictElementCheck = false;

                            return Promise.resolve();
                        }

                        throw err.message === AUTOMATION_ERROR_TYPES.elementIsInvisibleError ?
                            new ActionElementIsInvisibleError() : err;
                    }

                    return delay(CHECK_ELEMENT_IN_AUTOMATIONS_INTERVAL);
                });
        });
    }

    execute () {
        if (this.command.options && !this.command.options.speed)
            this.command.options.speed = this.testSpeed;

        const startPromise = new Promise(resolve => {
            this.executionStartedHandler = resolve;
        });

        const completionPromise = new Promise(resolve => {
            this.executionStartTime = new Date();

            try {
                this._ensureCommandArguments();
            }
            catch (err) {
                resolve(new DriverStatus({ isCommandResult: true, executionError: err }));
                return;
            }

            this.commandSelectorTimeout = this._getSpecificTimeout();

            this.statusBar.showWaitingElementStatus(this.commandSelectorTimeout);

            const { actionPromise, barriersPromise } = runWithBarriers(() => this._runRecursively());

            actionPromise
                .then(() => Promise.all([
                    this._delayAfterExecution(),
                    barriersPromise
                ]))
                .then(() => {
                    const status   = { isCommandResult: true };
                    const elements = [...this.elements];

                    if (this.targetElement)
                        elements[0] = this.targetElement;

                    status.result = createReplicator(new SelectorElementActionTransform()).encode(elements);

                    resolve(new DriverStatus(status));
                })
                .catch(err => {
                    return this.statusBar.hideWaitingElementStatus(false)
                        .then(() => resolve(new DriverStatus({ isCommandResult: true, executionError: err })));
                });
        });

        return { startPromise, completionPromise };
    }
}

export default function executeAction (command, globalSelectorTimeout, statusBar, testSpeed) {
    const actionExecutor = new ActionExecutor(command, globalSelectorTimeout, statusBar, testSpeed);

    return actionExecutor.execute();
}
