import { EventType } from '../types';
import { SimulatedKeyInfo } from './key-press/utils';
import { KeyModifierValues } from './types';
// @ts-ignore
import { utils, eventSandbox, nativeMethods } from '../../client/core/deps/hammerhead';
import { calculateKeyModifiersValue, calculateMouseButtonValue } from './utils';
import { AxisValuesData } from '../../client/core/utils/values/axis-values';
import sendRequestToFrame from '../../client/core/utils/send-request-to-frame';
import { findIframeByWindow } from '../../client/core/utils/dom';
import { getBordersWidthFloat, getElementPaddingFloat } from '../../client/core/utils/style';

const messageSandbox = eventSandbox.message;

const MOUSE_EVENT_OPTIONS = {
    clickCount: 1,
};

const CALCULATE_TOP_LEFT_POINT_REQUEST_CMD  = 'native-automation|calculate-top-left-point|request';
const CALCULATE_TOP_LEFT_POINT_RESPONSE_CMD = 'native-automation|calculate-top-left-point|response';

function getLeftTopPoint (driverIframe: any): AxisValuesData<number> {
    const rect     = driverIframe.getBoundingClientRect();
    const borders  = getBordersWidthFloat(driverIframe);
    const paddings = getElementPaddingFloat(driverIframe);

    return {
        x: rect.left + borders.left + paddings.left,
        y: rect.top + borders.top + paddings.top,
    };
}

// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, async (e:any) => {
    if (e.message.cmd === CALCULATE_TOP_LEFT_POINT_REQUEST_CMD) {
        const iframeWin = e.source;

        const { x, y } = await calculateIFrameTopLeftPoint();

        const iframe = findIframeByWindow(iframeWin);
        const topLeftPoint = getLeftTopPoint(iframe);

        const responseMsg = {
            cmd:          CALCULATE_TOP_LEFT_POINT_RESPONSE_CMD,
            topLeftPoint: {
                x: topLeftPoint.x + x,
                y: topLeftPoint.y + y,
            },
        };

        messageSandbox.sendServiceMsg(responseMsg, iframeWin);
    }
});

async function calculateIFrameTopLeftPoint (): Promise<AxisValuesData<number>> {
    if (window !== window.parent) {
        const msg: any = {
            cmd: CALCULATE_TOP_LEFT_POINT_REQUEST_CMD,
        };

        const { topLeftPoint } = await sendRequestToFrame(msg, CALCULATE_TOP_LEFT_POINT_RESPONSE_CMD, window.parent);

        return topLeftPoint;
    }

    return { x: 0, y: 0 };
}

export default class CDPEventDescriptor {
    private static _isNonCharKeyModifier (modifiers: number): boolean {
        const nonCharModifiers = [KeyModifierValues.ctrl, KeyModifierValues.alt, KeyModifierValues.meta];

        return nativeMethods.arrayIndexOf.call(nonCharModifiers, modifiers) > -1;
    }

    private static _getKeyDownEventText (options: SimulatedKeyInfo): any {
        if (options.isNewLine)
            return '\r';

        if (options.keyProperty.length === 1 && CDPEventDescriptor._isNonCharKeyModifier(options.modifiers))
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

    public static async createMouseEventOptions (type: string, options: any): Promise<any> {
        const { x, y } = await calculateIFrameTopLeftPoint();

        return utils.extend({
            x:         options.options.clientX + x,
            y:         options.options.clientY + y,
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
