import { EventType } from '../types';
import { SimulatedKeyInfo } from './key-press/utils';
// @ts-ignore
import { utils } from '../../client/core/deps/hammerhead';
import { calculateKeyModifiersValue, calculateMouseButtonValue } from './utils';
import AxisValues from '../../client/core/utils/values/axis-values';

const MOUSE_EVENT_OPTIONS = {
    clickCount: 1,
    button:     'left',
};

export default class CDPEventDescriptor {
    private static _getKeyDownEventText (options: SimulatedKeyInfo): any {
        if (options.isNewLine)
            return '\r';

        if (options.keyProperty.length === 1)
            return options.keyProperty;

        return '';
    }

    public static createKeyDownOptions (options: SimulatedKeyInfo): any {
        const text = CDPEventDescriptor._getKeyDownEventText(options);

        return {
            type:                  text ? 'keyDown' : 'rawKeyDown',
            modifiers:             options.modifiers || 0,
            windowsVirtualKeyCode: options.keyCode,
            key:                   options.keyProperty,
            text,
        };
    }

    public static createKeyUpOptions (options: SimulatedKeyInfo): any {
        return {
            type:                  'keyUp',
            modifiers:             options.modifiers || 0,
            key:                   options.keyProperty,
            windowsVirtualKeyCode: options.keyCode,
        };
    }

    public static createMouseEventOptions (type: string, options: any, leftTopPoint: AxisValues<number>): any {
        return utils.extend({
            x:         options.options.clientX + leftTopPoint.x,
            y:         options.options.clientY + leftTopPoint.y,
            modifiers: calculateKeyModifiersValue(options.options),
            button:    calculateMouseButtonValue(options.options),
            type,
        }, MOUSE_EVENT_OPTIONS);
    }

    public static delay (delay: number): any {
        return {
            type:    EventType.Delay,
            options: { delay },
        };
    }

    public static keyDown (keyInfo: SimulatedKeyInfo): any {
        return {
            type:    EventType.Keyboard,
            options: CDPEventDescriptor.createKeyDownOptions(keyInfo),
        };
    }

    public static keyUp (keyInfo: SimulatedKeyInfo): any {
        return {
            type:    EventType.Keyboard,
            options: CDPEventDescriptor.createKeyUpOptions(keyInfo),
        };
    }
}
