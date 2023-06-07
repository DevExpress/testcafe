import getKeyInfo from '../../../client/automation/playback/press/get-key-info';
import SHORTCUT_TYPE from '../../../client/automation/playback/press/shortcut-type';
// @ts-ignore
import { utils } from '../../../client/core/deps/hammerhead';
// @ts-ignore
import { getKeyArray, arrayUtils } from '../../../client/automation/deps/testcafe-core';
import { changeLetterCase, getActualKeysAndEventKeyProperties } from '../../../client/automation/playback/press/utils';
import { getModifiersState } from '../utils';
import getKeyCode from '../../../client/automation/utils/get-key-code';

const SHORTCUT_TO_COMMANDS_MAP = {
    [SHORTCUT_TYPE.ctrlA]: 'selectAll',
};

export interface SimulatedKeyInfo {
    key: string;
    keyCode: number;
    keyProperty: string;
    modifiers: number;
    modifierKeyCode: number;
    isLetter: boolean;
    isChar: boolean;
    isNewLine: boolean;
    commands: string[];
}

function getKeyCombinationCommands (keyCombination: string, keyIndex: number): string[] {
    const sanitizedKeyCombination = keyCombination.toLowerCase();

    if (keyIndex === 1 && SHORTCUT_TO_COMMANDS_MAP[sanitizedKeyCombination])
        return [SHORTCUT_TO_COMMANDS_MAP[sanitizedKeyCombination]];

    return [];
}

export function getSimulatedKeyInfo (keyCombination: string): SimulatedKeyInfo[] {
    const keysArray                          = getKeyArray(keyCombination);
    const { actualKeys, eventKeyProperties } = getActualKeysAndEventKeyProperties(keysArray);

    return arrayUtils.map(actualKeys, (key: string, index: number) => {
        const commands = getKeyCombinationCommands(keyCombination, index);

        return utils.extend({ key, commands }, getKeyInfo(key, eventKeyProperties[index]));
    });
}

export function changeLetterCaseIfNecessary (keyInfo: SimulatedKeyInfo): void {
    const modifiersState = getModifiersState(keyInfo.modifiers);

    if (modifiersState.shift && keyInfo.isLetter) {
        keyInfo.keyProperty = changeLetterCase(keyInfo.keyProperty);
        keyInfo.keyCode     = getKeyCode(keyInfo.keyProperty);
    }
}
