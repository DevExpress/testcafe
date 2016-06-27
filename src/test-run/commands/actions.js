import TYPE from './type';
import SelectorFactory from '../../client-functions/selector-factory';
import Assignable from '../../utils/assignable';
import { ClickOptions, MouseOptions, TypeOptions } from './options';

import {
    actionOptions,
    integerArgument,
    positiveIntegerArgument,
    nonEmptyStringArgument,
    urlArgument,
    stringOrStringArrayArgument
} from './validations/argument';

import { ActionSelectorError } from '../../errors/test-run';
import { APIError } from '../../errors/runtime';


// Initializers
function initSelector (name, val) {
    try {
        var factory = new SelectorFactory(val, null, { instantiation: 'Selector' });

        return factory.getCommand([], { visibilityCheck: true });
    }
    catch (err) {
        var msg = err.constructor === APIError ? err.rawMessage : err.message;

        throw new ActionSelectorError(name, msg);
    }
}

function initClickOptions (name, val) {
    return new ClickOptions(val, true);
}

function initMouseOptions (name, val) {
    return new MouseOptions(val, true);
}

function initTypeOptions (name, val) {
    return new TypeOptions(val, true);
}

// Commands
export class ClickCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.click;
        this.selector = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true }
        ];
    }
}

export class RightClickCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.rightClick;
        this.selector = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true }
        ];
    }
}

export class DoubleClickCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.doubleClick;
        this.selector = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initClickOptions, required: true }
        ];
    }
}

export class HoverCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.hover;
        this.selector = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true }
        ];
    }
}

export class TypeTextCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.typeText;
        this.selector = null;
        this.text     = null;
        this.options  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'text', type: nonEmptyStringArgument, required: true },
            { name: 'options', type: actionOptions, init: initTypeOptions, required: true }
        ];
    }
}

export class DragCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type        = TYPE.drag;
        this.selector    = null;
        this.dragOffsetX = null;
        this.dragOffsetY = null;
        this.options     = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'dragOffsetX', type: integerArgument, required: true },
            { name: 'dragOffsetY', type: integerArgument, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true }
        ];
    }
}

export class DragToElementCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.dragToElement;

        this.selector            = null;
        this.destinationSelector = null;
        this.options             = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'destinationSelector', init: initSelector, required: true },
            { name: 'options', type: actionOptions, init: initMouseOptions, required: true }
        ];
    }
}

export class SelectTextCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.selectText;
        this.selector = null;
        this.startPos = null;
        this.endPos   = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'startPos', type: positiveIntegerArgument },
            { name: 'endPos', type: positiveIntegerArgument }
        ];
    }
}

export class SelectEditableContentCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type          = TYPE.selectEditableContent;
        this.startSelector = null;
        this.endSelector   = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'startSelector', init: initSelector, required: true },
            { name: 'endSelector', init: initSelector }
        ];
    }
}

export class SelectTextAreaContentCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type      = TYPE.selectTextAreaContent;
        this.selector  = null;
        this.startLine = null;
        this.startPos  = null;
        this.endLine   = null;
        this.endPos    = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'startLine', type: positiveIntegerArgument },
            { name: 'startPos', type: positiveIntegerArgument },
            { name: 'endLine', type: positiveIntegerArgument },
            { name: 'endPos', type: positiveIntegerArgument }
        ];
    }
}

export class PressKeyCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.pressKey;
        this.keys = '';

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'keys', type: nonEmptyStringArgument, required: true }
        ];
    }
}

export class NavigateToCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.navigateTo;
        this.url  = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'url', type: urlArgument, required: true }
        ];
    }
}

export class SetFilesToUploadCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.setFilesToUpload;

        this.selector = null;
        this.filePath = '';

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true },
            { name: 'filePath', type: stringOrStringArrayArgument, required: true }
        ];
    }
}

export class ClearUploadCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type = TYPE.clearUpload;

        this.selector = null;

        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true }
        ];
    }
}

export class SwitchToIframeCommand extends Assignable {
    constructor (obj) {
        super(obj);

        this.type     = TYPE.switchToIframe;
        this.selector = null;
        this._assignFrom(obj, true);
    }

    _getAssignableProperties () {
        return [
            { name: 'selector', init: initSelector, required: true }
        ];
    }
}

export class SwitchToMainWindowCommand {
    constructor () {
        this.type = TYPE.switchToMainWindow;
    }
}
