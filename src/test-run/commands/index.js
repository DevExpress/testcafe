export const TYPE = {
    click:     'click',
    assertion: 'assertion',
    testDone:  'test-done'
};

export function createClickCommand () {
    return {
        type:      TYPE.click,
        arguments: {}
    };
}

export function createAssertionCommand () {
    return {
        type:      TYPE.assertion,
        arguments: {}
    };
}

export function createDoneCommand () {
    return {
        type: TYPE.testDone
    };
}
