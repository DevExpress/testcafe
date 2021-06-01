interface Modifiers {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
}

export class ActionOptions {
    public constructor(data: object, validate: boolean);
    public speed: number;
}

export class OffsetOptions extends ActionOptions {
    public offsetX: number;
    public offsetY: number;
}

export class MouseOptions extends OffsetOptions {
    public modifiers: Modifiers;
}

export class ClickOptions extends MouseOptions {
    public caretPos: number;
}

export class MoveOptions extends MouseOptions {
    public minMovingTime: number;
    public holdLeftButton: boolean;
    public skipScrolling: boolean;
    public skipDefaultDragBehavior: boolean;
}

export class TypeOptions extends ClickOptions {
    public replace: boolean;
    public paste: boolean;
    public confidential: boolean;
}

export class DragToElementOptions extends MouseOptions {
    public destinationOffsetX: number;
    public destinationOffsetY: number;
}

export class AssertionOptions {
    public constructor(data: object, validate: boolean);
    public timeout: number;
    public allowUnawaitedPromise: number;
}

export class ResizeToFitDeviceOptions {
    public portraitOrientation: boolean;
}

export class PressOptions extends ActionOptions {
    public confidential: boolean;
}
