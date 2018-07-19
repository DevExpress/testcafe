import { writeFile } from '../../../../../utils/promisified-functions';
import { GET_WINDOW_DIMENSIONS_INFO_SCRIPT } from '../../../utils/client-functions';
import MarionetteProtocolClient from './protocol-client';
import MARIONETTE_COMMANDS from './commands';
import MARIONETTE_KEYMAP from './keymap';
import MARIONETTE_PROTOCOL_ACTIONS from './protocol-actions';
import ACTION_TYPES from './action-types';


const MAX_RESIZE_RETRY_COUNT = 2;

const MARIONETTE_PROTOCOL_ACTION_TYPES             = MARIONETTE_PROTOCOL_ACTIONS.types;
const MARIONETTE_PROTOCOL_ACTION_SUBTYPES          = MARIONETTE_PROTOCOL_ACTIONS.subTypes;
const MARIONETTE_PROTOCOL_ACTION_EVENT_SOURCES_IDS = MARIONETTE_PROTOCOL_ACTIONS.eventSourcesIds;

const MODIFIER_KEYS = ['ctrl', 'alt', 'shift', 'meta'];

export default class {
    constructor (port = 2828, host = '127.0.0.1') {
        this.protocolClient = new MarionetteProtocolClient(port, host);
    }

    async connect () {
        await this.protocolClient.connect();
    }

    dispose () {
        this.protocolClient.dispose();
    }

    async quit () {
        await this.protocolClient.getResponse({ command: 'quit' });
    }

    async executeScript (code) {
        return await this.protocolClient.getResponse({ command: MARIONETTE_COMMANDS.executeScript, parameters: { script: `return (${code})()` } });
    }

    async takeScreenshot (path) {
        var screenshot = await this.protocolClient.getResponse({ command: MARIONETTE_COMMANDS.takeScreenshot });

        await writeFile(path, screenshot.value, { encoding: 'base64' });
    }

    async setWindowSize (width, height) {
        var { value: pageRect } = await this.executeScript(GET_WINDOW_DIMENSIONS_INFO_SCRIPT);
        var attemptCounter      = 0;

        while (attemptCounter++ < MAX_RESIZE_RETRY_COUNT && (pageRect.width !== width || pageRect.height !== height)) {
            var currentRect = await this.protocolClient.getResponse({ command: MARIONETTE_COMMANDS.getWindowRect });

            await this.protocolClient.getResponse({
                command: MARIONETTE_COMMANDS.setWindowRect,

                parameters: {
                    x:      currentRect.x,
                    y:      currentRect.y,
                    width:  width + (currentRect.width - pageRect.width),
                    height: height + (currentRect.height - pageRect.height)
                }
            });

            ({ value: pageRect } = await this.executeScript(GET_WINDOW_DIMENSIONS_INFO_SCRIPT));
        }
    }

    // Actions
    async _performActions (actions) {
        await this.protocolClient.getResponse({ command: MARIONETTE_COMMANDS.performActions, parameters: { actions } });
    }

    async cancelAction () {
        this.protocolClient.cancelResponse();
    }

    _getModifiers (action) {
        return MODIFIER_KEYS.filter(key => action.modifiers[key]);
    }

    async _applyModifiers (action) {
        if (!action.modifiers || action.releaseModifiers)
            return null;

        const modifiers = this._getModifiers(action);

        if (modifiers.length) {
            await this._performActions([{
                id:   MARIONETTE_PROTOCOL_ACTION_EVENT_SOURCES_IDS.keyboard,
                type: MARIONETTE_PROTOCOL_ACTION_TYPES.key,

                actions: modifiers.map(key => ({ type: MARIONETTE_PROTOCOL_ACTION_SUBTYPES.keyDown, value: MARIONETTE_KEYMAP[key] }))
            }]);
        }

        return modifiers;
    }

    async _releaseModifiers (action, modifiers) {
        if (!action.modifiers || action.keepModifiers)
            return null;

        if (!modifiers)
            modifiers = this._getModifiers(action);

        if (modifiers.length) {
            await this._performActions([{
                id:   MARIONETTE_PROTOCOL_ACTION_EVENT_SOURCES_IDS.keyboard,
                type: MARIONETTE_PROTOCOL_ACTION_TYPES.key,

                actions: modifiers.map(key => ({ type: MARIONETTE_PROTOCOL_ACTION_SUBTYPES.keyUp, value: MARIONETTE_KEYMAP[key] }))
            }]);
        }

        return modifiers;
    }

    async _performMoveAction (action) {
        await this._performActions([{
            id:   MARIONETTE_PROTOCOL_ACTION_EVENT_SOURCES_IDS.mouse,
            type: MARIONETTE_PROTOCOL_ACTION_TYPES.pointer,

            parameters: {
                pointerType: MARIONETTE_PROTOCOL_ACTIONS.pointerTypes.mouse
            },

            actions: [
                {
                    type:     MARIONETTE_PROTOCOL_ACTION_SUBTYPES.pointerMove,
                    duration: 1000,
                    x:        action.x,
                    y:        action.y
                }
            ]
        }]);
    }

    async _performMouseButtonAction (action) {
        const button = action.type === ACTION_TYPES.rightClick
            ? MARIONETTE_PROTOCOL_ACTIONS.mouseButtons.right
            : MARIONETTE_PROTOCOL_ACTIONS.mouseButtons.left;

        const actions = [];

        if (action.type !== ACTION_TYPES.mouseUp)
            actions.push({ type: MARIONETTE_PROTOCOL_ACTION_SUBTYPES.pointerDown, button });

        if (action.type !== ACTION_TYPES.mouseDown)
            actions.push({ type: MARIONETTE_PROTOCOL_ACTION_SUBTYPES.pointerUp, button });

        if (action.type === ACTION_TYPES.doubleClick)
            actions.push(...actions);

        await this._performActions([{
            id:   MARIONETTE_PROTOCOL_ACTION_EVENT_SOURCES_IDS.mouse,
            type: MARIONETTE_PROTOCOL_ACTION_TYPES.pointer,

            parameters: {
                pointerType: MARIONETTE_PROTOCOL_ACTIONS.pointerTypes.mouse
            },

            actions
        }]);
    }

    async _performTypeTextAction (action) {
        const actions = [];

        Array.prototype.forEach.call(action.text, char => {
            actions.push(
                { type: MARIONETTE_PROTOCOL_ACTION_SUBTYPES.keyDown, value: char },
                { type: MARIONETTE_PROTOCOL_ACTION_SUBTYPES.keyUp, value: char }
            );
        });

        await this._performActions([{
            id:   MARIONETTE_PROTOCOL_ACTION_EVENT_SOURCES_IDS.keyboard,
            type: MARIONETTE_PROTOCOL_ACTION_TYPES.key,

            actions
        }]);
    }

    async _performPressKeyAction (action) {
        const actions = [];

        action.combinations.forEach(comb => {
            comb = comb.replace(/^\+/, 'plus').replace('++', '+plus');

            const keys = comb.split(/\+/);

            actions.push(...keys.map(key => ({ type: MARIONETTE_PROTOCOL_ACTION_SUBTYPES.keyDown, value: MARIONETTE_KEYMAP[key] || key })));
            actions.push(...keys.map(key => ({ type: MARIONETTE_PROTOCOL_ACTION_SUBTYPES.keyUp, value: MARIONETTE_KEYMAP[key] || key })));
        });

        await this._performActions([{
            id:   MARIONETTE_PROTOCOL_ACTION_EVENT_SOURCES_IDS.keyboard,
            type: MARIONETTE_PROTOCOL_ACTION_TYPES.key,

            actions
        }]);
    }

    async _dispatchAction (action) {
        switch (action.type) {
            case ACTION_TYPES.move:
                return this._performMoveAction(action);

            case ACTION_TYPES.click:
            case ACTION_TYPES.rightClick:
            case ACTION_TYPES.doubleClick:
            case ACTION_TYPES.mouseDown:
            case ACTION_TYPES.mouseUp:
                return this._performMouseButtonAction(action);

            case ACTION_TYPES.pressKey:
                return this._performPressKeyAction(action);

            case ACTION_TYPES.typeText:
                return this._performTypeTextAction(action);
        }

        return null;
    }

    async performAction (action) {
        if (this.executingAction)
            this.cancelAction();

        this.executingAction = true;

        const modifiers = await this._applyModifiers(action);

        await this._dispatchAction(action);

        await this._releaseModifiers(action, modifiers);

        this.executingAction = false;
    }
}

