import getKeyInfo from '../../../client/automation/playback/press/get-key-info';
// @ts-ignore
import { utils } from '../../../client/core/deps/hammerhead';
// @ts-ignore
import { getKeyArray, arrayUtils } from '../../../client/automation/deps/testcafe-core';
import { changeLetterCase, getActualKeysAndEventKeyProperties } from '../../../client/automation/playback/press/utils';
import { getModifiersState } from '../utils';
import getKeyCode from '../../../client/automation/utils/get-key-code';

export interface SimulatedKeyInfo {
    key: string;
    keyCode: number;
    keyProperty: string;
    modifiers: number;
    modifierKeyCode: number;
    isLetter: boolean;
    isChar: boolean;
    isNewLine: boolean;
}

export function getSimulatedKeyInfo (keyCombination: string): SimulatedKeyInfo[] {
    const keysArray                          = getKeyArray(keyCombination);
    const { actualKeys, eventKeyProperties } = getActualKeysAndEventKeyProperties(keysArray);

    return arrayUtils.map(actualKeys, (key: string, index: number) => {
        return utils.extend({ key }, getKeyInfo(key, eventKeyProperties[index]));
    });
}

export function changeLetterCaseIfNecessary (keyInfo: SimulatedKeyInfo): void {
    const modifiersState = getModifiersState(keyInfo.modifiers);

    if (modifiersState.shift && keyInfo.isLetter) {
        keyInfo.keyProperty = changeLetterCase(keyInfo.keyProperty);
        keyInfo.keyCode     = getKeyCode(keyInfo.keyProperty);
    }
}
