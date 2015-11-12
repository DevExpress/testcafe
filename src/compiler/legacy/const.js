// --------------------------------------------------------
// WARNING: this file is used by both the client and the server.
// Do not use any browser or node-specific API!
// --------------------------------------------------------

export default {
    ACTION_FUNC_NAMES: [
        'click',
        'rclick',
        'dblclick',
        'drag',
        'type',
        'wait',
        'waitFor',
        'hover',
        'press',
        'select',
        'navigateTo',
        'upload',
        'screenshot'
    ],

    ASSERTION_FUNC_NAMES: [
        'ok', 'notOk', 'eq', 'notEq'
    ]
};
