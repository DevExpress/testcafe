import { KeyModifiers, KeyModifierValues } from './types';
import Protocol from 'devtools-protocol';
import MouseButton = Protocol.Input.MouseButton;

export function calculateKeyModifiersValue (modifiers: KeyModifiers): number {
    let result = 0;

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

export function calculateMouseButtonValue (options: any): MouseButton {
    if (!options.button)
        return 'left';

    return 'right';
}
