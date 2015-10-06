import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import clickPlayback from './playback/click';
import dblClickPlayback from './playback/dblclick';
import dragPlayback from './playback/drag';
import hoverPlayback from './playback/hover';
import pressPlayback from './playback/press';
import rClickPlayback from './playback/rclick';
import selectPlayback from './playback/select';
import typePlayback from './playback/type';
import async from '../deps/async';

var browserUtils   = hammerhead.utils.browser;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;
var listeners      = hammerhead.eventSandbox.listeners;

var $          = testCafeCore.$;
var SETTINGS   = testCafeCore.SETTINGS;
var eventUtils = testCafeCore.eventUtils;
var domUtils   = testCafeCore.domUtils;


const REAL_ACTION_EVENTS_REGEXP = /blur|focus|(dbl)?click|contextmenu|key|mouse|pointer/i;


//Default action descriptors
var defaultActionDescriptor        = {
        type:        '',
        serviceInfo: {
            prevPageState: null,
            isDeferred:    false
        }
    },

    defaultElementActionDescriptor = $.extend(true, {}, defaultActionDescriptor, {
        element:     null,
        selector:    null,
        serviceInfo: {
            selectors: []
        }
    });

export var AUTOMATION_RUNNERS = 'tc-ar-73630b99';

export var SUPPORTED_SHORTCUTS = [
    'ctrl+a',
    'backspace',
    'delete',
    'left',
    'right',
    'up',
    'down',
    'shift+left',
    'shift+right',
    'shift+up',
    'shift+down',
    'shift+home',
    'shift+end',
    'home',
    'end',
    'enter',
    'tab',
    'shift+tab'
];

export var ADD_ACTION_SHORTCUTS = {
    wait:       'Ctrl+Q',
    hover:      'Ctrl+Space',
    screenshot: 'Ctrl+M'
};

export var defaultMouseActionDescriptor = $.extend(true, {}, defaultElementActionDescriptor, {
    apiArguments: {
        options: {
            ctrl:    false,
            alt:     false,
            shift:   false,
            meta:    false,
            offsetX: '',
            offsetY: ''
        }
    },
    serviceInfo:  {
        useOffsets: false
    }
});

export var defaultDragActionDescriptor = $.extend(true, {}, defaultMouseActionDescriptor, {
    type:          'drag',
    apiArguments:  {
        dragOffsetX: 0,
        dragOffsetY: 0
    },
    startPosition: null,
    endPosition:   null
});

export var defaultHoverActionDescriptor = $.extend(true, {}, defaultElementActionDescriptor, {
    type: 'hover'
});

export var defaultTypeActionDescriptor = $.extend(true, {}, defaultMouseActionDescriptor, {
    type:         'type',
    apiArguments: {
        text:    '',
        options: {
            replace:  false,
            caretPos: ''
        }
    }
});

export var defaultPressActionDescriptor = $.extend(true, {}, defaultActionDescriptor, {
    type:         'press',
    apiArguments: {
        keysCommand: ''
    }
});

export var defaultWaitActionDescriptor = {
    type:         'wait',
    apiArguments: {
        ms: ''
    }
};

export var defaultScreenshotActionDescriptor = {
    type: 'screenshot'
};

export var defaultSelectActionDescriptor = $.extend(true, {}, defaultElementActionDescriptor, {
    type:         'select',
    apiArguments: {
        startPos: null,
        endPos:   null
    }
});

//Init
var inSimulation = false;

//NOTE: when test is run we should block real events (from mouse, keyboard), because it may lead to
// unexpected test result.
var preventRealEvtHandler = function (e, dispatched, preventDefault) {
    var target = e.target || e.srcElement;

    if (REAL_ACTION_EVENTS_REGEXP.test(e.type) && !dispatched &&
        (!SETTINGS.get().RECORDING || SETTINGS.get().PLAYBACK || inSimulation) &&
        !(SETTINGS.get().PLAYBACK && domUtils.isShadowUIElement(target))) {
        //If an element loses focus because of becoming invisible, a blur event is raised. We must not prevent this blur event.
        //In the IE an element loses focus only if css display property is set to 'none', other ways of making
        // element invisible don't lead to blurring (in MSEdge focus/blur is sync)
        if (e.type === 'blur') {
            var $target = $(target);
            if (browserUtils.isIE && browserUtils.version < 12) {
                if ((!domUtils.isWindowInstance(target) && $target.css('display') === 'none') ||
                    $target.parents().filter(function () {
                        return this.style.display === 'none';
                    }).length)
                //B254768 - reason of setTimeout method using
                    window.setTimeout(function () {
                        eventSimulator.blur($target[0]);
                    }, 0);
            }
            //NOTE: fix for jQuery bug. An exception raises when call .is(':visible') for window or document on page loading (e.ownerDocument is null)
            else if (target !== window && target !== window.document && !$target.is(':visible'))
                return;
        }

        preventDefault();
    }
};

var initialized = false;

export function init () {
    if (initialized)
        return;

    listeners.initElementListening(window, eventUtils.RECORDING_LISTENED_EVENTS);
    listeners.addFirstInternalHandler(window, eventUtils.RECORDING_LISTENED_EVENTS, preventRealEvtHandler);

    initialized = true;
}

//Running
var runners = window[AUTOMATION_RUNNERS] = {
    click:    {
        playback: clickPlayback
    },
    rclick:   {
        playback: rClickPlayback
    },
    dblclick: {
        playback: dblClickPlayback
    },
    drag:     {
        playback: dragPlayback
    },
    select:   {
        playback: selectPlayback
    },
    press:    {
        playback: pressPlayback
    },
    type:     {
        playback: typePlayback
    },
    hover:    {
        playback: hoverPlayback
    }
};

function runAutomation (descriptor, runner, callback) {
    if (/click|drag|select|type|hover/.test(descriptor.type) && !descriptor.element) {
        callback();
        return;
    }

    switch (descriptor.type) {
        case 'click':
            //NOTE: We should send previous selected index to be able to determine whether to send the change event
            runner.run(descriptor.element, descriptor.apiArguments.options, callback, {
                prevSelectedIndex: descriptor.serviceInfo.prevPageState &&
                                   descriptor.serviceInfo.prevPageState.affectedElementSelectedIndex ?
                                   descriptor.serviceInfo.prevPageState.affectedElementSelectedIndex : null
            });
            break;

        case 'rclick':
            runner.run(descriptor.element, descriptor.apiArguments.options, callback);
            break;

        case 'dblclick':
            runner.run(descriptor.element, descriptor.apiArguments.options, callback);
            break;

        case 'drag':
            var to = {
                dragOffsetX: descriptor.apiArguments.dragOffsetX,
                dragOffsetY: descriptor.apiArguments.dragOffsetY
            };

            runner.run(descriptor.element, to, descriptor.apiArguments.options, callback, {
                screenPointTo: descriptor.endPosition
            });
            break;

        case 'select':
            var positions = {
                startPos: descriptor.apiArguments.startPos,
                endPos:   descriptor.apiArguments.endPos
            };

            runner.run(descriptor.element, positions, callback, {
                screenPointTo: descriptor.endPosition
            });
            break;

        case 'type':
            runner.run(descriptor.element, descriptor.apiArguments.text,
                descriptor.apiArguments.options, callback);
            break;

        case 'press':
            runner.run(descriptor.apiArguments.keysCommand, callback);
            break;

        case 'hover':
            runner.run(descriptor.element, descriptor.apiArguments.options, callback);
            break;

        default:
            callback();
            break;
    }
}
