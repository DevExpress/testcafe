/*eslint no-unused-vars:0*/

var expect        = require('chai').expect;
var SelectOptions = require('../../lib/test-run/commands/options').SelectOptions;
var OffsetOptions = require('../../lib/test-run/commands/options').OffsetOptions;
var MouseOptions  = require('../../lib/test-run/commands/options').MouseOptions;
var ClickOptions  = require('../../lib/test-run/commands/options').ClickOptions;
var DragOptions   = require('../../lib/test-run/commands/options').DragOptions;
var MoveOptions   = require('../../lib/test-run/commands/options').MoveOptions;
var TypeOptions   = require('../../lib/test-run/commands/options').TypeOptions;
var TYPE          = require('../../lib/errors/test-run/type');
var CATEGORY      = require('../../lib/errors/test-run/category');

describe('Test run command options', function () {
    describe('Construction from object', function () {
        it('Should create SelectOptions from object', function () {
            var options = new SelectOptions({
                endPos: 15,
                dummy:  false
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                startPos: null,
                endPos:   15
            });
        });

        it('Should create OffsetOptions from object', function () {
            var options = new OffsetOptions({
                offsetY: 15,
                dummy:   false
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
                offsetX: 0,
                offsetY: 15
            });
        });

        it('Should create MouseOptions from object', function () {
            var options = new MouseOptions({
                offsetX: 15,
                dummy:   false,

                modifiers: {
                    ctrl:  true,
                    shift: true,
                    dummy: 'yo'
                }
            }, false);

            expect(JSON.parse(JSON.stringify(options))).eql({
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

        it('Should create ClickOptions from object', function () {
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

            expect(JSON.parse(JSON.stringify(options))).eql({
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

        it('Should create DragOptions from object', function () {
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

            expect(JSON.parse(JSON.stringify(options))).eql({
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

        it('Should create MoveOptions from object', function () {
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

            expect(JSON.parse(JSON.stringify(options))).eql({
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

        it('Should create TypeOptions from object', function () {
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

            expect(JSON.parse(JSON.stringify(options))).eql({
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
    });

    describe('Validation', function () {
        it('Should validate OffsetOptions', function () {
            expect(function () {
                new OffsetOptions({
                    offsetX: null
                }, true);
            }).to.throw({
                category:    CATEGORY.actionError,
                type:        TYPE.actionPositiveNumberOptionError,
                actualValue: 'object',
                optionName:  'offsetX'
            });

            expect(function () {
                new OffsetOptions({
                    offsetY: -3
                }, true);
            }).to.throw({
                category:    CATEGORY.actionError,
                type:        TYPE.actionPositiveNumberOptionError,
                actualValue: '-3',
                optionName:  'offsetY'
            });
        });

        it('Should validate MouseOptions', function () {
            expect(function () {
                new MouseOptions({ modifiers: { ctrl: 42 } }, true);
            }).to.throw({
                category:    CATEGORY.actionError,
                type:        TYPE.actionBooleanOptionError,
                actualValue: 'number',
                optionName:  'modifiers.ctrl'
            });

            expect(function () {
                new MouseOptions({ modifiers: { alt: 42 } }, true);
            }).to.throw({
                category:    CATEGORY.actionError,
                type:        TYPE.actionBooleanOptionError,
                actualValue: 'number',
                optionName:  'modifiers.alt'
            });

            expect(function () {
                new MouseOptions({ modifiers: { shift: 42 } }, true);
            }).to.throw({
                category:    CATEGORY.actionError,
                type:        TYPE.actionBooleanOptionError,
                actualValue: 'number',
                optionName:  'modifiers.shift'
            });

            expect(function () {
                new MouseOptions({ modifiers: { meta: 42 } }, true);
            }).to.throw({
                category:    CATEGORY.actionError,
                type:        TYPE.actionBooleanOptionError,
                actualValue: 'number',
                optionName:  'modifiers.meta'
            });
        });

        it('Should validate ClickOptions', function () {
            expect(function () {
                new ClickOptions({
                    caretPos: -1
                }, true);
            }).to.throw({
                category:    CATEGORY.actionError,
                type:        TYPE.actionPositiveNumberOptionError,
                actualValue: 'object',
                optionName:  'caretPos'
            });
        });

        it('Should validate DragOptions', function () {
            expect(function () {
                new DragOptions({
                    dragOffsetX: null
                }, true);
            }).to.throw({
                category:    CATEGORY.actionError,
                type:        TYPE.actionNumberOptionError,
                actualValue: 'object',
                optionName:  'dragOffsetX'
            });

            expect(function () {
                new DragOptions({
                    dragOffsetY: null
                }, true);
            }).to.throw({
                category:    CATEGORY.actionError,
                type:        TYPE.actionNumberOptionError,
                actualValue: 'object',
                optionName:  'dragOffsetY'
            });
        });

        it('Should validate TypeOptions', function () {
            expect(function () {
                new TypeOptions({ replace: 42 }, true);
            }).to.throw({
                category:    CATEGORY.actionError,
                type:        TYPE.actionBooleanOptionError,
                actualValue: 'number',
                optionName:  'replace'
            });
        });

    });
});
