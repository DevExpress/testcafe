/* global globalThis */

import { ExecuteSelectorCommand } from '../test-run/commands/observation';
import { ScrollOptions } from '../test-run/commands/options';
import AxisValues, { AxisValuesData } from './utils/values/axis-values';
import Dimensions from './utils/values/dimensions';
import BoundaryValues from './utils/values/boundary-values';

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

    dom: {
        getTagName: (el: any) => string;
        isImgElement: (el: any) => boolean;
        isDomElement: (el: any) => boolean;
        isNodeEqual: (el1: any, el2: any) => boolean;
        closest: (el: any, selector: string) => SharedFnResult<any | null>;
        containsElement: (el1: any, el2: any) => SharedFnResult<boolean>;
        getNodeText: (el: any) => SharedFnResult<string>;
        getImgMapName: (el: any) => string;
        getDocumentElement: (win: any) => SharedFnResult<any>;
    };

    position: {
        getElementFromPoint: (point: AxisValuesData<number>) => SharedFnResult<any>;
        getClientDimensions: (target: any) => SharedFnResult<Dimensions>;
        containsOffset: (el: any, offsetX: number, offsetY: number) => SharedFnResult<boolean>;
        getIframeClientCoordinates: (el: any) => SharedFnResult<BoundaryValues>;
        getIframePointRelativeToParentFrame: (iframePoint: AxisValues<number>, win: any) => SharedFnResult<AxisValues<number> | null>;
        getClientPosition: (el: any) => SharedFnResult<AxisValues<number>>;
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

export interface Window {
    parent: Window;
}
