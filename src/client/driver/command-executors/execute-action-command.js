import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import testCafeRunner from '../deps/testcafe-runner';
import testCafeUI from '../deps/testcafe-ui';
import DriverStatus from '../status';
import {
    ActionElementNotFoundError,
    ActionElementIsInvisibleError,
    ActionAdditionalElementNotFoundError,
    ActionAdditionalElementIsInvisibleError,
    ActionIncorrectKeysError,
    ActionCanNotFindFileToUploadError
} from '../../../errors/test-run';

import COMMAND_TYPE from '../../../test-run/commands/type';
import {
    ensureElementEditable,
    ensureTextAreaElement,
    ensureContentEditableElement,
    ensureRootContainer,
    ensureElement,
    ensureFileInput
} from './ensure-element-utils';

var Promise                         = hammerhead.Promise;
var XhrBarrier                      = testCafeCore.XhrBarrier;
var pageUnloadBarrier               = testCafeCore.pageUnloadBarrier;
var ClickAutomation                 = testCafeRunner.get('./automation/playback/click');
var RClickAutomation                = testCafeRunner.get('./automation/playback/rclick');
var DblClickAutomation              = testCafeRunner.get('./automation/playback/dblclick');
var DragToOffsetAutomation          = testCafeRunner.get('./automation/playback/drag/to-offset');
var DragToElementAutomation         = testCafeRunner.get('./automation/playback/drag/to-element');
var HoverAutomation                 = testCafeRunner.get('./automation/playback/hover');
var TypeAutomation                  = testCafeRunner.get('./automation/playback/type');
var SelectTextAutomation            = testCafeRunner.get('./automation/playback/select/select-text');
var SelectEditableContentAutomation = testCafeRunner.get('./automation/playback/select/select-editable-content');
var PressAutomation                 = testCafeRunner.get('./automation/playback/press');
var parseKeySequence                = testCafeRunner.get('./automation/playback/press/parse-key-sequence');
var getSelectPositionArguments      = testCafeRunner.get('./automation/playback/select/get-select-position-arguments');
var UploadAutomation                = testCafeRunner.get('./automation/playback/upload');
var ProgressPanel                   = testCafeUI.ProgressPanel;


const PROGRESS_PANEL_TEXT                = 'Waiting for the target element of the next action to appear';
const START_SELECTOR_ARGUMENT_NAME       = 'startSelector';
const END_SELECTOR_ARGUMENT_NAME         = 'endSelector';
const DESTINATION_SELECTOR_ARGUMENT_NAME = 'destinationSelector';
const KEYS_ARGUMENT_NAME                 = 'keys';


function ensureCommandElements (command, timeout) {
    var progressPanel = new ProgressPanel();

    progressPanel.show(PROGRESS_PANEL_TEXT, timeout);

    var ensureElementPromises = [];

    if (command.selector) {
        ensureElementPromises.push(ensureElement(command.selector, timeout,
            () => new ActionElementNotFoundError(), () => new ActionElementIsInvisibleError()));
    }

    if (command.type === COMMAND_TYPE.dragToElement) {
        ensureElementPromises.push(ensureElement(command.destinationSelector, timeout,
            () => new ActionAdditionalElementNotFoundError(DESTINATION_SELECTOR_ARGUMENT_NAME),
            () => new ActionAdditionalElementIsInvisibleError(DESTINATION_SELECTOR_ARGUMENT_NAME)));
    }

    if (command.type === COMMAND_TYPE.selectEditableContent) {
        var endSelector = command.endSelector || command.startSelector;

        ensureElementPromises.push(ensureElement(command.startSelector, timeout,
            () => new ActionAdditionalElementNotFoundError(START_SELECTOR_ARGUMENT_NAME),
            () => new ActionAdditionalElementIsInvisibleError(START_SELECTOR_ARGUMENT_NAME)));

        ensureElementPromises.push(ensureElement(endSelector, timeout,
            () => new ActionAdditionalElementNotFoundError(END_SELECTOR_ARGUMENT_NAME),
            () => new ActionAdditionalElementIsInvisibleError(END_SELECTOR_ARGUMENT_NAME)));
    }

    return Promise.all(ensureElementPromises)
        .then(elements => {
            if (command.type === COMMAND_TYPE.selectText)
                ensureElementEditable(elements[0]);

            if (command.type === COMMAND_TYPE.selectTextAreaContent)
                ensureTextAreaElement(elements[0]);

            if (command.type === COMMAND_TYPE.selectEditableContent) {
                ensureContentEditableElement(elements[0], START_SELECTOR_ARGUMENT_NAME);
                ensureContentEditableElement(elements[1], END_SELECTOR_ARGUMENT_NAME);
                ensureRootContainer(elements);
            }

            if (command.type === COMMAND_TYPE.uploadFile || command.type === COMMAND_TYPE.clearUpload)
                ensureFileInput(elements[0]);

            return elements;
        })
        .catch(err => {
            progressPanel.close(false);
            throw err;
        })
        .then(elements => {
            progressPanel.close(true);
            return elements;
        });
}

function ensureCommandArguments (command) {
    if (command.type === COMMAND_TYPE.pressKey) {
        var parsedKeySequence = parseKeySequence(command.keys);

        if (parsedKeySequence.error)
            throw new ActionIncorrectKeysError(KEYS_ARGUMENT_NAME);
    }
}

function createAutomation (elements, command) {
    var selectArgs = null;

    /* eslint-disable indent*/
    // TODO: eslint raises an 'incorrect indent' error here. We use
    // the old eslint version (v1.x.x). We should migrate to v2.x.x
    switch (command.type) {
        case COMMAND_TYPE.click :
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
            selectArgs = getSelectPositionArguments(elements[0], command);

            return new SelectTextAutomation(elements[0], selectArgs.startPos, selectArgs.endPos);

        case COMMAND_TYPE.selectEditableContent:
            return new SelectEditableContentAutomation(elements[0], elements[1]);

        case COMMAND_TYPE.pressKey:
            return new PressAutomation(parseKeySequence(command.keys).combinations);

        case COMMAND_TYPE.uploadFile :
            return new UploadAutomation(elements[0], command.filePath,
                filePaths => new ActionCanNotFindFileToUploadError(filePaths)
            );

        case COMMAND_TYPE.clearUpload :
            return new UploadAutomation(elements[0]);
    }
    /* eslint-enable indent*/
}

export default function executeActionCommand (command, elementAvailabilityTimeout) {
    var resolveStartPromise = null;
    var startPromise        = new Promise(resolve => resolveStartPromise = resolve);

    var completionPromise = new Promise(resolve => {
        var xhrBarrier = null;

        ensureCommandElements(command, elementAvailabilityTimeout)
            .then(elements => {
                resolveStartPromise();

                xhrBarrier = new XhrBarrier();

                ensureCommandArguments(command);

                return createAutomation(elements, command).run();
            })
            .then(() => {
                return Promise.all([
                    xhrBarrier.wait(),
                    pageUnloadBarrier.wait()
                ]);
            })
            .then(() => resolve(new DriverStatus({ isCommandResult: true })))
            .catch(err => resolve(new DriverStatus({ isCommandResult: true, executionError: err })));
    });

    return { startPromise, completionPromise };
}

