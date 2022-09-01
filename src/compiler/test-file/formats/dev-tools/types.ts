export type RawCommand = {
    type: string;
    [key: string]: string;
}

export type RawTest = {
    name: string;
    commands: RawCommand[];
}

export type RawFixture = {
    tests: RawTest[];
    name: string;
}

export type RawRecording = {
    fixtures: RawFixture[];
}

export type DevToolsRecorderStep = {
    [key: string]: unknown;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    offsetX?: number;
    offsetY?: number;
    operator?: string;
    value?: string;
    expression?: string;
}

export const DEVTOOLS_COMMAND_TYPE = {
    navigate:          'navigate',
    setViewport:       'setViewport',
    click:             'click',
    dblClick:          'doubleClick',
    hover:             'hover',
    change:            'change',
    keyDown:           'keyDown',
    keyUp:             'keyUp',
    scroll:            'scroll',
    waitForExpression: 'waitForExpression',
    waitForElement:    'waitForElement',
    close:             'close',
};
