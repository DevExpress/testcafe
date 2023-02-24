export interface KeyModifiers {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
}

export enum KeyModifierValues {
    alt=1,
    ctrl=2,
    meta=4,
    shift=8
}

export interface DispatchEventFn {
    single: Function;
    sequence: Function;
}
