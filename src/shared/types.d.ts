/* global globalThis */

import { ExecuteSelectorCommand } from '../test-run/commands/observation';
import { ScrollOptions } from '../test-run/commands/options';
import AxisValues, { AxisValuesData, LeftTopValues } from './utils/values/axis-values';
import BoundaryValues, { BoundaryValuesData } from './utils/values/boundary-values';
import { ElementRectangle } from '../client/core/utils/shared/types';
import Dimensions from './utils/values/dimensions';
import { MouseClickStrategyBase } from './actions/automations/click/mouse-click-strategy-base';

export interface NativeMethods {
    setTimeout: typeof globalThis.setTimeout;
    clearTimeout: typeof globalThis.clearTimeout;
    arrayIndexOf: any[]['indexOf'];
    arraySplice: any[]['splice'];
    arraySlice: any[]['slice'];
    arrayFilter: any[]['filter'];
    objectAssign: ObjectConstructor['assign'];
    objectKeys: ObjectConstructor['keys'];
    dateNow: DateConstructor['now'];
}

type SharedFnResult<T> = T | Promise<T>;

export interface SharedAdapter {
    nativeMethods: NativeMethods;
    PromiseCtor: typeof Promise;
    getOffsetOptions?: (el: any, offsetX: number, offsetY: number) => { offsetX: number; offsetY: number };
    scroll: (el: any, scrollOptions: ScrollOptions) => Promise<boolean>;

    getElementExceptUI: (point: AxisValuesData<number>, underTopShadowUIElement?: boolean) => Promise<any>;

    browser: {
        isChrome?: boolean;
        isFirefox?: boolean;
    };

    featureDetection: {
        isTouchDevice: boolean;
    };

    dom: {
        isHtmlElement: (el: any) => boolean;
        isBodyElement: (el: any) => boolean;
        isDomElement: (el: any) => boolean;
        getDocumentElement: (win: any) => SharedFnResult<any>;
        findIframeByWindow: (win: any) => SharedFnResult<any>;
        isDocumentElement: (el: any) => SharedFnResult<boolean>;
        isIframeWindow (win: any): SharedFnResult<boolean | null>;
        getTagName: (el: any) => string;
        isImgElement: (el: any) => boolean;
        isNodeEqual: (el1: any, el2: any) => boolean;
        closest: (el: any, selector: string) => SharedFnResult<any | null>;
        containsElement: (el1: any, el2: any) => SharedFnResult<boolean>;
        getNodeText: (el: any) => SharedFnResult<string>;
        getImgMapName: (el: any) => string;
        getParents: (el: any) => SharedFnResult<any[]> ;
    };

    position: {
        getElementFromPoint: (point: AxisValuesData<number>) => SharedFnResult<any>;
        containsOffset: (el: any, offsetX?: number, offsetY?: number) => SharedFnResult<boolean>;
        getIframeClientCoordinates: (el: any) => SharedFnResult<BoundaryValuesData>;
        getClientPosition: (el: any) => SharedFnResult<AxisValues<number>>;
        getOffsetPosition: (el: any, roundFn?: (n: number) => number) => SharedFnResult<LeftTopValues<number>>;
        getWindowPosition: () => SharedFnResult<AxisValues<number>>;
        getClientDimensions (el: any): SharedFnResult<Dimensions>;
        getElementRectangle (el: any): SharedFnResult<ElementRectangle>;
        offsetToClientCoords (point: AxisValuesData<number>): SharedFnResult<AxisValues<number>>;
    };

    utils: {
        extend (target: Record<string, any>, ...args: Record<string, any>[]): Record<string, any>;
    };

    style: {
        getWindowDimensions: (win: any) => SharedFnResult<BoundaryValues>;
        getElementScroll: (el: any) => SharedFnResult<LeftTopValues<number>>;
        hasScroll: (el: any) => SharedFnResult<boolean>;
    };

    event: {
        BUTTONS_PARAMETER: {
            noButton: number;
            leftButton: number;
            rightButton: number;
        };
    };

    createEventSequence: (dragAndDropEnabled: boolean, firstMovingStepOccured: boolean, options: any) => any;
    sendRequestToFrame (msg: any, MOVE_RESPONSE_CMD: string, activeWindow: SharedWindow): SharedFnResult<any>;
    ensureMouseEventAfterScroll: (currentElement: any, element: any, wasScrolled: boolean) => SharedFnResult<any>;

    automations: {
        click: {
            createMouseClickStrategy: (element: any, caretPos: number) => MouseClickStrategyBase<any>;
        };

        _ensureWindowAndCursorForLegacyTests (automation: any): void;
    };
}

export interface ClientRequestEmitter<R> {
    onRequestSend: (fn: (req: R) => void) => void;
    onRequestCompleted: (fn: (req: R) => void) => void;
    onRequestError: (fn: (req: R) => void) => void;
    offAll: () => void;
}

export interface ScriptExecutionEmitter<S> {
    onScriptAdded: (fn: (scr: S) => void) => void;
    onScriptLoadedOrFailed: (fn: (scr: S) => void) => void;
    offAll: () => void;
}

interface AutomationErrorCtor {
    name: string;
    firstArg: string | null;
}

interface AutomationErrorCtors {
    notFound: AutomationErrorCtor | string;
    invisible: AutomationErrorCtor | string;
}

export type ExecuteSelectorFn<T> = (selector: ExecuteSelectorCommand, errCtors: AutomationErrorCtors, startTime: number) => Promise<T>;

export interface SharedWindow {
    parent: SharedWindow | null;
}
