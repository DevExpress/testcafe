import { KeyModifiers, KeyModifierValues } from './types';
import Protocol from 'devtools-protocol';
import MouseButton = Protocol.Input.MouseButton;
// @ts-ignore
import { utils } from '../../client/core/deps/hammerhead';

const EMPTY_MODIFIERS = {
    ctrl:  false,
    alt:   false,
    shift: false,
    meta:  false,
};

export function calculateKeyModifiersValue (modifiers?: KeyModifiers): number {
    let result = 0;

    if (!modifiers)
        return result;

    if (modifiers.ctrl)
        result |= KeyModifierValues.ctrl;
    if (modifiers.alt)
        result |= KeyModifierValues.alt;
    if (modifiers.shift)
        result |= KeyModifierValues.shift;
    if (modifiers.meta)
        result |= KeyModifierValues.meta;

    return result;
}

export function getModifiersState (modifiersBit?: number): KeyModifiers {
    const modifiers = utils.extend({}, EMPTY_MODIFIERS) as KeyModifiers;

    if (!modifiersBit)
        return modifiers;

    if (modifiersBit & KeyModifierValues.ctrl)
        modifiers.ctrl = true;
    if (modifiersBit & KeyModifierValues.alt)
        modifiers.alt = true;
    if (modifiersBit & KeyModifierValues.shift)
        modifiers.shift = true;
    if (modifiersBit & KeyModifierValues.meta)
        modifiers.meta = true;

    return modifiers;
}

export function getModifiersBit (key: string): number {
    // @ts-ignore
    return KeyModifierValues[key] || 0;
}

export function calculateMouseButtonValue (options: any): MouseButton {
    if (!options.button)
        return 'left';

    return 'right';
}
