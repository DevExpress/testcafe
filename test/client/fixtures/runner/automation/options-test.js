var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var SelectOptions  = testCafeRunner.get('../../test-run/commands/options').SelectOptions;
var OffsetOptions  = testCafeRunner.get('../../test-run/commands/options').OffsetOptions;
var MouseOptions   = testCafeRunner.get('../../test-run/commands/options').MouseOptions;
var ClickOptions   = testCafeRunner.get('../../test-run/commands/options').ClickOptions;
var DragOptions    = testCafeRunner.get('../../test-run/commands/options').DragOptions;
var MoveOptions    = testCafeRunner.get('../../test-run/commands/options').MoveOptions;
var TypeOptions    = testCafeRunner.get('../../test-run/commands/options').TypeOptions;
var TYPE           = testCafeRunner.get('../../errors/test-run/type');
var CATEGORY       = testCafeRunner.get('../../errors/test-run/category');


module('assignment');

test('SelectOptions', function () {
    var options = new SelectOptions({
        endPos: 15,
        dummy:  false
    }, false);

    deepEqual(JSON.parse(JSON.stringify(options)), {
        startPos: null,
        endPos:   15
    });
});

test('OffsetOptions', function () {
    var options = new OffsetOptions({
        offsetY: 15,
        dummy:   false
    }, false);

    deepEqual(JSON.parse(JSON.stringify(options)), {
        offsetX: 0,
        offsetY: 15
    });
});

test('MouseOptions', function () {
    var options = new MouseOptions({
        offsetX: 15,
        dummy:   false,

        modifiers: {
            ctrl:  true,
            shift: true,
            dummy: 'yo'
        }
    }, false);

    deepEqual(JSON.parse(JSON.stringify(options)), {
        offsetX: 15,
        offsetY: 0,

        modifiers: {
            ctrl:  true,
            alt:   false,
            shift: true,
            meta:  false
        }
    });
});

test('ClickOptions', function () {
    var options = new ClickOptions({
        offsetX:  15,
        caretPos: 20,
        dummy:    false,

        modifiers: {
            ctrl:  true,
            shift: true,
            dummy: 'yo'
        }
    }, false);

    deepEqual(JSON.parse(JSON.stringify(options)), {
        offsetX:  15,
        offsetY:  0,
        caretPos: 20,

        modifiers: {
            ctrl:  true,
            alt:   false,
            shift: true,
            meta:  false
        }
    });
});

test('DragOptions', function () {
    var options = new DragOptions({
        offsetX:     15,
        dragOffsetX: -20,
        dummy:       false,

        modifiers: {
            ctrl:  true,
            shift: true,
            dummy: 'yo'
        }
    }, false);

    deepEqual(JSON.parse(JSON.stringify(options)), {
        offsetX:            15,
        offsetY:            0,
        destinationElement: null,
        dragOffsetX:        -20,
        dragOffsetY:        0,

        modifiers: {
            ctrl:  true,
            alt:   false,
            shift: true,
            meta:  false
        }
    });
});

test('MoveOptions', function () {
    var options = new MoveOptions({
        offsetY:     15,
        dragOffsetX: 20,
        dummy:       false,
        speed:       20,
        dragMode:    true,

        modifiers: {
            ctrl:  true,
            shift: true,
            dummy: 'yo'
        }
    }, false);

    deepEqual(JSON.parse(JSON.stringify(options)), {
        offsetX:       0,
        offsetY:       15,
        speed:         20,
        minMovingTime: null,
        dragMode:      true,

        modifiers: {
            ctrl:  true,
            alt:   false,
            shift: true,
            meta:  false
        }
    });
});

test('TypeOptions', function () {
    var options = new TypeOptions({
        offsetX:  15,
        caretPos: 20,
        replace:  true,
        dummy:    false,

        modifiers: {
            ctrl:  true,
            shift: true,
            dummy: 'yo'
        }
    }, false);

    deepEqual(JSON.parse(JSON.stringify(options)), {
        offsetX:  15,
        offsetY:  0,
        caretPos: 20,
        replace:  true,

        modifiers: {
            ctrl:  true,
            alt:   false,
            shift: true,
            meta:  false
        }
    });
});

module('validation');

test('OffsetOptions', function () {
    throws(
        function () {
            new OffsetOptions({
                offsetX: null
            }, true);
        },
        {
            category:    CATEGORY.actionError,
            type:        TYPE.actionPositiveNumberOptionError,
            actualValue: 'object',
            optionName:  'offsetX'
        }
    );

    throws(
        function () {
            new OffsetOptions({
                offsetY: -3
            }, true);
        },
        {
            category:    CATEGORY.actionError,
            type:        TYPE.actionPositiveNumberOptionError,
            actualValue: '-3',
            optionName:  'offsetY'
        }
    );
});

test('MouseOptions', function () {
    throws(
        function () {
            new MouseOptions({ modifiers: { ctrl: 42 } }, true);
        },
        {
            category:    CATEGORY.actionError,
            type:        TYPE.actionBooleanOptionError,
            actualValue: 'number',
            optionName:  'modifiers.ctrl'
        }
    );

    throws(
        function () {
            new MouseOptions({ modifiers: { alt: 42 } }, true);
        },
        {
            category:    CATEGORY.actionError,
            type:        TYPE.actionBooleanOptionError,
            actualValue: 'number',
            optionName:  'modifiers.alt'
        }
    );

    throws(
        function () {
            new MouseOptions({ modifiers: { shift: 42 } }, true);
        },
        {
            category:    CATEGORY.actionError,
            type:        TYPE.actionBooleanOptionError,
            actualValue: 'number',
            optionName:  'modifiers.shift'
        }
    );

    throws(
        function () {
            new MouseOptions({ modifiers: { meta: 42 } }, true);
        },
        {
            category:    CATEGORY.actionError,
            type:        TYPE.actionBooleanOptionError,
            actualValue: 'number',
            optionName:  'modifiers.meta'
        }
    );
});

test('ClickOptions', function () {
    throws(
        function () {
            new ClickOptions({
                caretPos: -1
            }, true);
        },
        {
            category:    CATEGORY.actionError,
            type:        TYPE.actionPositiveNumberOptionError,
            actualValue: 'object',
            optionName:  'caretPos'
        }
    );
});

test('DragOptions', function () {
    throws(
        function () {
            new DragOptions({
                dragOffsetX: null
            }, true);
        },
        {
            category:    CATEGORY.actionError,
            type:        TYPE.actionNumberOptionError,
            actualValue: 'object',
            optionName:  'dragOffsetX'
        }
    );

    throws(
        function () {
            new DragOptions({
                dragOffsetY: null
            }, true);
        },
        {
            category:    CATEGORY.actionError,
            type:        TYPE.actionNumberOptionError,
            actualValue: 'object',
            optionName:  'dragOffsetY'
        }
    );
});

test('TypeOptions', function () {
    throws(
        function () {
            new TypeOptions({ replace: 42 }, true);
        },
        {
            category:    CATEGORY.actionError,
            type:        TYPE.actionBooleanOptionError,
            actualValue: 'number',
            optionName:  'replace'
        }
    );
});
