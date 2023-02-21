import ActionExecutor from './index';

import { // @ts-ignore
    domUtils, // @ts-ignore
    contentEditable, // @ts-ignore
    parseKeySequence,
} from '../../deps/testcafe-core';

import { // @ts-ignore
    calculateSelectTextArguments, // @ts-ignore
    DispatchEvent as DispatchEventAutomation, // @ts-ignore
    Click as ClickAutomation, // @ts-ignore
    SelectChildClick as SelectChildClickAutomation, // @ts-ignore
    RClick as RClickAutomation, // @ts-ignore
    DblClick as DblClickAutomation, // @ts-ignore
    DragToOffset as DragToOffsetAutomation, // @ts-ignore
    DragToElement as DragToElementAutomation, // @ts-ignore
    Hover as HoverAutomation, // @ts-ignore
    Type as TypeAutomation, // @ts-ignore
    SelectText as SelectTextAutomation, // @ts-ignore
    SelectEditableContent as SelectEditableContentAutomation, // @ts-ignore
    Press as PressAutomation, // @ts-ignore
    Upload as UploadAutomation, // @ts-ignore
    SetScroll as SetScrollAutomation, // @ts-ignore
    ScrollIntoView as ScrollIntoViewAutomation, // @ts-ignore
    cursor,
} from '../../deps/testcafe-automation';

import {
    ActionIncorrectKeysError,
    ActionCannotFindFileToUploadError,
    ActionElementNonEditableError,
    ActionElementNonContentEditableError,
    ActionRootContainerNotFoundError,
    ActionElementNotTextAreaError,
    ActionElementIsNotFileInputError,
} from '../../../../shared/errors';

import COMMAND_TYPE from '../../../../test-run/commands/type';
import { ActionCommandBase } from '../../../../test-run/commands/base';
import { Automation } from '../../../automation/types';
import AxisValues from '../../../core/utils/values/axis-values';


ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.dispatchEvent] = {
    additionalSelectorProps: ['relatedTarget'],

    create: (command, elements) => {
        if (elements[1]) // @ts-ignore
            command.options.relatedTarget = elements[1];

        return new DispatchEventAutomation(elements[0], command.eventName, command.options);
    },
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.pressKey] = {
    create: (command, [], dispatchProxylessEventFn?: Function) => new PressAutomation(parseKeySequence(command.keys).combinations, command.options, dispatchProxylessEventFn), // eslint-disable-line no-empty-pattern

    ensureCmdArgs: command => {
        const parsedKeySequence = parseKeySequence(command.keys);

        if (parsedKeySequence.error)
            throw new ActionIncorrectKeysError('keys');
    },
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.click] = {
    create: (command, elements, dispatchProxylessEventFn?: Function, leftTopPoint?: AxisValues<number>) => {
        if (/option|optgroup/.test(domUtils.getTagName(elements[0])))
            return new SelectChildClickAutomation(elements[0], command.options);

        cursor.shouldRender = !dispatchProxylessEventFn;

        return new ClickAutomation(elements[0], command.options, window, cursor, dispatchProxylessEventFn, leftTopPoint);
    },
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.rightClick] = {
    create: (command, elements) => new RClickAutomation(elements[0], command.options),
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.doubleClick] = {
    create: (command, elements) => new DblClickAutomation(elements[0], command.options),
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.hover] = {
    create: (command, elements) => new HoverAutomation(elements[0], command.options),
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.drag] = {
    create: (command, elements) =>
        new DragToOffsetAutomation(elements[0], command.dragOffsetX, command.dragOffsetY, command.options),
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.dragToElement] = {
    additionalSelectorProps: ['destinationSelector'],
    create:                  (command, elements) =>
        new DragToElementAutomation(elements[0], elements[1], command.options),
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.scroll] = {
    create: (command, elements) => {
        const { x, y, position, options } = command;

        return new SetScrollAutomation(elements[0], { x, y, position }, options) as Automation;
    },
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.scrollBy] = {
    create: (command, elements) => {
        const { byX, byY, options } = command;

        return new SetScrollAutomation(elements[0], { byX, byY }, options) as Automation;
    },
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.scrollIntoView] = {
    create: (command, elements) => new ScrollIntoViewAutomation(elements[0], command.options),
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.typeText] = {
    // eslint-disable-next-line no-restricted-properties
    create: (command, elements, dispatchProxylessEventFn?: Function) => new TypeAutomation(elements[0], command.text, command.options, dispatchProxylessEventFn),
};


function createSelectTextAutomation (command: ActionCommandBase, elements: any[]): Automation {
    const selectArgs = calculateSelectTextArguments(elements[0], command);

    return new SelectTextAutomation(elements[0], selectArgs.startPos, selectArgs.endPos, command.options);
}

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.selectText] = {
    create: createSelectTextAutomation,

    ensureElsProps: elements => {
        if (!domUtils.isEditableElement(elements[0]))
            throw new ActionElementNonEditableError();
    },
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.selectTextAreaContent] = {
    create: createSelectTextAutomation,

    ensureElsProps: elements => {
        if (!domUtils.isTextAreaElement(elements[0]))
            throw new ActionElementNotTextAreaError();
    },
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.selectEditableContent] = {
    additionalSelectorProps: ['startSelector', 'endSelector'],

    create: (command, elements) => {
        command.endSelector = command.endSelector || command.startSelector;

        return new SelectEditableContentAutomation(elements[0], elements[1], command.options);
    },

    ensureElsProps: elements => {
        if (!domUtils.isContentEditableElement(elements[0]))
            throw new ActionElementNonContentEditableError('startSelector');

        if (!domUtils.isContentEditableElement(elements[1]))
            throw new ActionElementNonContentEditableError('endSelector');

        // NOTE: We should find a common element for the nodes to perform the select action
        if (!contentEditable.getNearestCommonAncestor(elements[0], elements[1]))
            throw new ActionRootContainerNotFoundError();
    },
};


function ensureFileInput (element: Node[]): never | void {
    if (!domUtils.isFileInput(element))
        throw new ActionElementIsNotFileInputError();
}

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.setFilesToUpload] = {
    create: (command, elements) => {
        return new UploadAutomation(elements[0], command.filePath,
            (filePaths: string[], scannedFilePaths: string[]) => new ActionCannotFindFileToUploadError(filePaths, scannedFilePaths),
        );
    },

    ensureElsProps: elements => ensureFileInput(elements[0]),
};

ActionExecutor.ACTIONS_HANDLERS[COMMAND_TYPE.clearUpload] = {
    create:         (command, elements) => new UploadAutomation(elements[0]),
    ensureElsProps: elements => ensureFileInput(elements[0]),
};
