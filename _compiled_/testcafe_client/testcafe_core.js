(function () {
    window.initTestCafeClientCore = function (window) {
        var HammerheadClient = window.HammerheadClient,
            TestCafeClient = window.TestCafeClient = new HammerheadClient.Mods(),
            document = window.document;


TestCafeClient.define('Automation', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        Settings = require('Settings'),
        $ = Hammerhead.$,
        async = Hammerhead.async,
        EventSandbox = Hammerhead.EventSandbox,
        EventSimulator = Hammerhead.EventSimulator,
        Util = Hammerhead.Util,
        JavascriptExecutor = require('Base.JavascriptExecutor'),

        ClickPlayback = require('Automation.Click.Playback'),
        RClickPlayback = require('Automation.RClick.Playback'),
        DblClickPlayback = require('Automation.DblClick.Playback'),
        DragPlayback = require('Automation.Drag.Playback'),
        SelectPlayback = require('Automation.Select.Playback'),
        PressPlayback = require('Automation.Press.Playback'),
        TypePlayback = require('Automation.Type.Playback'),
        HoverPlayback = require('Automation.Hover.Playback');

    //Const
    var REAL_ACTION_EVENTS_REGEXP = /blur|focus|(dbl)?click|contextmenu|key|mouse|pointer/i;

    //Default action descriptors
    var defaultActionDescriptor = {
            type: '',
            serviceInfo: {
                prevPageState: null,
                isDeferred: false
            }
        },

        defaultElementActionDescriptor = $.extend(true, {}, defaultActionDescriptor, {
            element: null,
            selector: null,
            serviceInfo: {
                selectors: []
            }
        });

    exports.AUTOMATION_RUNNERS = 'tc-ar-73630b99';

    exports.SUPPORTED_SHORTCUTS = [
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

    exports.ADD_ACTION_SHORTCUTS = {
        wait: 'Ctrl+Q',
        hover: 'Ctrl+Space',
        screenshot: 'Ctrl+M'
    };

    exports.defaultMouseActionDescriptor = $.extend(true, {}, defaultElementActionDescriptor, {
        apiArguments: {
            options: {
                ctrl: false,
                alt: false,
                shift: false,
                meta: false,
                offsetX: '',
                offsetY: ''
            }
        },
        serviceInfo: {
            useOffsets: false
        }
    });

    exports.defaultDragActionDescriptor = $.extend(true, {}, exports.defaultMouseActionDescriptor, {
        type: 'drag',
        apiArguments: {
            dragOffsetX: 0,
            dragOffsetY: 0
        },
        startPosition: null,
        endPosition: null
    });

    exports.defaultHoverActionDescriptor = $.extend(true, {}, defaultElementActionDescriptor, {
        type: 'hover'
    });

    exports.defaultTypeActionDescriptor = $.extend(true, {}, exports.defaultMouseActionDescriptor, {
        type: 'type',
        apiArguments: {
            text: '',
            options: {
                replace: false,
                caretPos: ''
            }
        }
    });

    exports.defaultPressActionDescriptor = $.extend(true, {}, defaultActionDescriptor, {
        type: 'press',
        apiArguments: {
            keysCommand: ''
        }
    });

    exports.defaultWaitActionDescriptor = {
        type: 'wait',
        apiArguments: {
            ms: ''
        }
    };

    exports.defaultScreenshotActionDescriptor = {
        type: 'screenshot'
    };

    exports.defaultSelectActionDescriptor = $.extend(true, {}, defaultElementActionDescriptor, {
        type: 'select',
        apiArguments: {
            startPos: null,
            endPos: null
        }
    });

    //Init
    var inSimulation = false;

    //NOTE: when test is run we should block real events (from mouse, keyboard), because it may lead to
    // unexpected test result.
    var preventRealEvtHandler = function (e, dispatched, preventDefault) {
        var target = e.target || e.srcElement;

        if (REAL_ACTION_EVENTS_REGEXP.test(e.type) && !dispatched && (!Settings.RECORDING || Settings.PLAYBACK || inSimulation) && !(Settings.PLAYBACK && Util.isShadowUIElement(target))) {
            //If an element loses focus because of becoming invisible, a blur event is raised. We must not prevent this blur event.
            //In the IE an element loses focus only if css display property is set to 'none', other ways of making
            // element invisible don't lead to blurring
            if (e.type === 'blur') {
                var $target = $(target);
                if (Util.isIE) {
                    if ((!Util.isWindowInstance(target) && $target.css('display') === 'none') || $target.parents().filter(function () {
                        return this.style.display === 'none';
                    }).length)
                    //B254768 - reason of setTimeout method using
                        window.setTimeout(function () {
                            EventSimulator.blur($target[0]);
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

    exports.init = function () {
        if (initialized)
            return;

        EventSandbox.addFirstInternalHandler(window, Util.RECORDING_LISTENED_EVENTS, preventRealEvtHandler);

        initialized = true;
    };

    //Running
    var runners = window[exports.AUTOMATION_RUNNERS] = {
        click: {
            playback: ClickPlayback
        },
        rclick: {
            playback: RClickPlayback
        },
        dblclick: {
            playback: DblClickPlayback
        },
        drag: {
            playback: DragPlayback
        },
        select: {
            playback: SelectPlayback
        },
        press: {
            playback: PressPlayback
        },
        type: {
            playback: TypePlayback
        },
        hover: {
            playback: HoverPlayback
        }
    };

    function runAutomation(descriptor, runner, callback) {
        if (/click|drag|select|type|hover/.test(descriptor.type) && !descriptor.element) {
            callback();
            return;
        }

        switch (descriptor.type) {
            case 'click':
                //NOTE: We should send previous selected index to be able to determine whether to send the change event
                runner.run(descriptor.element, descriptor.apiArguments.options, callback, {
                    prevSelectedIndex: descriptor.serviceInfo.prevPageState && descriptor.serviceInfo.prevPageState.affectedElementSelectedIndex ?
                        descriptor.serviceInfo.prevPageState.affectedElementSelectedIndex : null});
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
                    screenPointTo: descriptor.endPosition});
                break;

            case 'select':
                var positions = {
                    startPos: descriptor.apiArguments.startPos,
                    endPos: descriptor.apiArguments.endPos
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

    function ensureElements(descriptor) {
        if (descriptor.selector) {
            var $elements = JavascriptExecutor.parseSelectorSync(descriptor.selector).$elements;

            if ($elements && $elements.length) {
                if ($elements.length === 1)
                    descriptor.element = $elements[0];
                else
                    descriptor.elements = $elements.toArray();
            }
        }
    }

    exports.playback = function (descriptor, callback) {
        var curDescriptor = null,
            curIndex = 0;

        if (!runners[descriptor.type]) {
            callback();
            return;
        }

        inSimulation = true;

        ensureElements(descriptor);

        //NOTE: Descriptor contains array of elements for action click on select+option
        //we should call action playback for each array element
        async.forEachSeries(
            descriptor.elements || [],
            function (el, seriesCallback) {
                curDescriptor = $.extend(curDescriptor, descriptor);
                curDescriptor.element = el;
                delete curDescriptor.elements;

                if (curIndex === descriptor.elements.length - 1) {
                    seriesCallback();
                    return;
                }

                runAutomation(curDescriptor, runners[curDescriptor.type].playback, function () {
                    curDescriptor = {};
                    curIndex++;
                    seriesCallback();
                });

            },
            function () {
                curDescriptor = curDescriptor || descriptor;

                runAutomation(curDescriptor, runners[curDescriptor.type].playback, function () {
                    inSimulation = false;

                    callback();
                });
            }
        );
    };
});

TestCafeClient.define('Automation.IFrameBehavior', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        Util = Hammerhead.Util,
        MessageSandbox = Hammerhead.MessageSandbox,
        Settings = require('Settings'),
        CrossDomainMessages = require('Base.CrossDomainMessages'),
        MovePlaybackAutomation = require('Automation.Move.Playback'),
        ScrollAutomation = require('Automation.Scroll'),
        CursorWidget = require('UI.Cursor');

    function onMessage(e) {
        var message = e.message,

            iFrameRectangle = null,
            intersectionPoint = null;

        switch (message.cmd) {
            case CrossDomainMessages.CURSOR_START_REQUEST_CMD:
                if (!Settings.RECORDING || Settings.PLAYBACK) {
                    CursorWidget.start(message.position, function () {
                        MessageSandbox.sendServiceMsg({ cmd: CrossDomainMessages.CURSOR_START_RESPONSE_CMD }, e.source);
                    }, e.source);
                }
                break;

            case CrossDomainMessages.MOVE_TO_IFRAME_REQUEST_CMD:
                var curCursorPosition = CursorWidget.getPosition();

                if (!curCursorPosition) {
                    MessageSandbox.sendServiceMsg({
                        cmd: CrossDomainMessages.MOVE_TO_IFRAME_RESPONSE_CMD,
                        point: null
                    }, e.source);
                    return;
                }

                var fixedPoint = Util.getFixedPosition(message.point, e.source),
                    pageCursorPosition = Util.clientToOffsetCoord(curCursorPosition);

                iFrameRectangle = Util.getIFrameCoordinates(e.source);

                if (Util.checkPresenceInRectangle(pageCursorPosition, iFrameRectangle) && Util.checkPresenceInRectangle(fixedPoint, iFrameRectangle)) {
                    MessageSandbox.sendServiceMsg({
                        cmd: CrossDomainMessages.MOVE_TO_IFRAME_RESPONSE_CMD,
                        point: message.point
                    }, e.source);
                }
                else {
                    intersectionPoint = Util.findLineAndRectangelIntersection(pageCursorPosition, fixedPoint, iFrameRectangle);

                    MovePlaybackAutomation.run(intersectionPoint, false, {}, function () {
                        MessageSandbox.sendServiceMsg({
                            cmd: CrossDomainMessages.MOVE_TO_IFRAME_RESPONSE_CMD,
                            point: Util.getFixedPositionForIFrame(intersectionPoint, e.source)
                        }, e.source);
                    });
                }

                break;

            case CrossDomainMessages.MOVE_CURSOR_IN_IFRAME_PING:
                if (message.isPingRequest) {
                    MessageSandbox.sendServiceMsg({
                        cmd: CrossDomainMessages.MOVE_CURSOR_IN_IFRAME_PING,
                        isPingResponse: true
                    }, e.source);
                }
                break;

            case CrossDomainMessages.MOVE_FROM_IFRAME_REQUEST_CMD:
                var frameDoc = document.documentElement,
                    iFrameVerticalScroll = frameDoc.scrollHeight > frameDoc.clientHeight ? Util.getScrollbarSize() : 0,
                    iFrameHorizontalScroll = frameDoc.scrollWidth > frameDoc.clientWidth ? Util.getScrollbarSize() : 0;

                iFrameRectangle = {
                    left: message.rectangle.left,
                    right: message.rectangle.right - iFrameVerticalScroll,
                    top: message.rectangle.top,
                    bottom: message.rectangle.bottom - iFrameHorizontalScroll
                };

                if (!Util.checkPresenceInRectangle(message.endPoint, iFrameRectangle)) {
                    MessageSandbox.sendServiceMsg({
                        cmd: CrossDomainMessages.MOVE_FROM_IFRAME_RESPONSE_CMD,
                        point: null
                    }, e.source);
                }
                else {
                    //NOTE: after scroll in top window cursor position in iframe could be changed (if cursor was above iframe)
                    CursorWidget.setPosition(message.cursorPosition);

                    intersectionPoint = Util.findLineAndRectangelIntersection(message.startPoint, message.endPoint, iFrameRectangle);

                    //NOTE: convert for IFrame
                    intersectionPoint = {
                        x: intersectionPoint.x - iFrameRectangle.left,
                        y: intersectionPoint.y - iFrameRectangle.top
                    };

                    MovePlaybackAutomation.run(Util.clientToOffsetCoord(intersectionPoint), false, {}, function () {
                        MessageSandbox.sendServiceMsg({
                            cmd: CrossDomainMessages.MOVE_FROM_IFRAME_RESPONSE_CMD,
                            point: intersectionPoint
                        }, e.source);
                    });
                }

                break;

            case CrossDomainMessages.SCROLL_TOP_WINDOW_REQUEST_CMD:
                ScrollAutomation.setScroll(e.source, message.point, message.options, function () {
                    MessageSandbox.sendServiceMsg({ cmd: CrossDomainMessages.SCROLL_TOP_WINDOW_RESPONSE_CMD }, e.source);
                });
                break;

            case CrossDomainMessages.GET_IFRAME_POSITION_DATA_REQUEST_CMD:
                var data = ScrollAutomation.getScrollData(e.source);

                data.cmd = CrossDomainMessages.GET_IFRAME_POSITION_DATA_RESPONSE_CMD;

                MessageSandbox.sendServiceMsg(data, e.source);
                break;
        }
    }

    exports.init = function () {
        MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
    };

    exports.destroy = function () {
        MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
    };
});
TestCafeClient.define('Automation.Scroll', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ScrollPlaybackAutomation = require('Automation.Scroll.Playback');

    exports.setScroll = function (iFrameWin, point, actionOptions, callback) {
        var iFrame = Util.getIFrameByWindow(iFrameWin),
            target = point ? Util.getFixedPosition(point, iFrameWin, true) : iFrame,
            options = point ? null : actionOptions;

        ScrollPlaybackAutomation.run(target, options, null, callback);
    };

    exports.getScrollData = function (iFrameWin) {
        var iFrame = Util.getIFrameByWindow(iFrameWin);

        return {
            scroll: Util.getElementScroll($(Util.findDocument(document))),
            iFrameOffset: Util.getOffsetPosition(iFrame),
            iFrameBorders: Util.getBordersWidth($(iFrame)),
            iFramePadding: Util.getElementPadding($(iFrame))
        };
    };
});

TestCafeClient.define('Automation.Settings', function (require, exports) {
    exports.MOVING_SPEED = 1000; //pixels/ms
    exports.MOVING_SPEED_IN_DRAGGING = 4; //pixels/ms
    exports.MINIMUM_MOVING_TIME = 25;

    //NOTE: some scripts work incorrectly when a delay between user actions too small, so we should make it more
    exports.ACTION_STEP_DELAY = 80;
    exports.CLICK_STEP_DELAY = 160;
    exports.DRAG_ACTION_STEP_DELAY = 100;
});
TestCafeClient.define('Automation.Util', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        ContentEditableHelper = Hammerhead.ContentEditableHelper,
        TextSelection = Hammerhead.TextSelection,
        CursorWidget = require('UI.Cursor'),
        Util = Hammerhead.Util,
        EventSandbox = Hammerhead.EventSandbox;

    var $document = $(document);

    exports.getMouseActionPoint = function (el, actionOptions, convertToScreen) {
        var elementOffset = Util.getOffsetPosition(el),
            left = el === $document[0].documentElement ? 0 : elementOffset.left,
            top = el === $document[0].documentElement ? 0 : elementOffset.top,
            elementScroll = Util.getElementScroll($(el)),
            point = Util.findCenter(el);

        if (actionOptions && typeof actionOptions.offsetX !== 'undefined' && !isNaN(parseInt(actionOptions.offsetX)))
            point.x = left + (actionOptions.offsetX || 0);

        if (actionOptions && typeof actionOptions.offsetY !== 'undefined' && !isNaN(parseInt(actionOptions.offsetY)))
            point.y = top + (actionOptions.offsetY || 0);

        if (convertToScreen) {
            if (!/html/i.test(el.tagName) && Util.hasScroll(el, Util.findDocument(el))) {
                point.x -= elementScroll.left;
                point.y -= elementScroll.top;
            }
            return Util.offsetToClientCoords(point);
        }

        return point;
    };

    exports.getEventOptionCoordinates = function (element, screenPoint) {
        var clientPoint = {
            x: screenPoint.x,
            y: screenPoint.y
        };

        if (Util.isElementInIframe(element)) {
            var currentIFrame = Util.getIFrameByElement(element);
            if (currentIFrame) {
                var iFramePosition = Util.getOffsetPosition(currentIFrame),
                    iFrameBorders = Util.getBordersWidth($(currentIFrame)),
                    iframeClientPosition = Util.offsetToClientCoords({x: iFramePosition.left, y: iFramePosition.top});

                clientPoint.x -= (iframeClientPosition.x + iFrameBorders.left);
                clientPoint.y -= (iframeClientPosition.y + iFrameBorders.top);
            }
        }

        return clientPoint;
    };

    exports.focusAndSetSelection = function (element, options, needFocus, callback) {
        var activeElement = Util.getActiveElement(),
            isTextEditable = Util.isTextEditableElement(element),
            isContentEditable = Util.isContentEditableElement(element),
            focusableElement = isContentEditable ? ContentEditableHelper.findContentEditableParent(element) : element,
            contentEditableParent = null,
            needSelection = isTextEditable || isContentEditable,
            $labelWithForAttr = $(element).closest('label[for]');

        //NOTE: in WebKit if selection was never set in an input element, focus method selects all text of this element
        if (needFocus && Util.isWebKit && isTextEditable)
            TextSelection.select(element, 0, 0);
        //NOTE: we should call focus for input element after click on label with attribute 'for' (on recording)
        if ($labelWithForAttr.length) {
            if (needFocus)
                exports.focusInputByLabel(element, callback);
            else
                callback();
        }
        else
            EventSandbox.focus(focusableElement, function () {
                //NOTE: if some other element was focused in the focus event handler we should not set selection
                if (!isContentEditable && needFocus && element !== Util.getActiveElement()) {
                    callback();
                    return;
                }

                if (needSelection) {
                    if (isContentEditable && isNaN(parseInt(options.caretPos)))
                        TextSelection.setCursorToLastVisiblePosition(element);
                    else {
                        var position = isNaN(parseInt(options.caretPos)) ? element.value.length : options.caretPos;
                        TextSelection.select(element, position, position);
                    }
                }
                else {
                    //NOTE: if focus is called for not contentEditable element (like 'img' or 'button') inside contentEditable parent
                    // we should try to set right window selection. Generally we can't set right window selection object because
                    // after selection setup window.getSelection method returns  a different object depending on the browser.
                    contentEditableParent = ContentEditableHelper.findContentEditableParent(focusableElement);
                    if (contentEditableParent)
                        TextSelection.setCursorToLastVisiblePosition(focusableElement);
                }
                //we can't avoid element focusing because set selection methods lead to focusing.
                // So we just focus previous active element without handlers if we don't need focus here
                if (!needFocus && activeElement !== Util.getActiveElement()) {
                    EventSandbox.focus(activeElement, callback, true, true);
                }
                else
                    callback();
            }, !needFocus, true);
    };

    //NOTE: in all browsers after simulation of  click on label with attribute 'for' occurs focus event
    // for related input, except Mozilla (so we should call focus)
    exports.focusInputByLabel = function (element, callback) {
        var $labelWithForAttr = $(element).closest('label[for]');

        if ($labelWithForAttr.length) {
            var $focusableElements = $('#' + $labelWithForAttr.attr('for'), Util.findDocument($labelWithForAttr[0]));

            if ($focusableElements.length) {
                var focusableElement = $focusableElements[0];

                if (Util.getActiveElement() !== focusableElement) {
                    EventSandbox.focus(focusableElement, callback, false, true);

                    return;
                }
            }
        }
        if (callback)
            callback();
    };

    exports.getDragEndPoint = function (startPosition, to, currentDocument) {
        var dragInIFrame = currentDocument !== document,
            pointTo = {
                x: startPosition.x + Math.floor(to.dragOffsetX),
                y: startPosition.y + Math.floor(to.dragOffsetY)
            },
            maxX = 0,
            maxY = 0;

        if (dragInIFrame) {
            var currentIFrame = Util.getIFrameByElement(currentDocument);
            if (currentIFrame) {
                var iFrameOffset = Util.getOffsetPosition(currentIFrame),
                    iFrameBorders = Util.getBordersWidth($(currentIFrame));

                maxX = iFrameOffset.left + iFrameBorders.left;
                maxY = iFrameOffset.top + iFrameBorders.top;
            }
        }

        maxX += $(currentDocument).width();
        maxY += $(currentDocument).height();
        pointTo.x = pointTo.x < 0 ? 0 : pointTo.x;
        pointTo.x = pointTo.x > maxX ? maxX : pointTo.x;
        pointTo.y = pointTo.y < 0 ? 0 : pointTo.y;
        pointTo.y = pointTo.y > maxY ? maxY : pointTo.y;

        return pointTo;
    };

    exports.getElementUnderCursor = function (x, y, currentDocument, target) {
        var topElement = CursorWidget.getElementUnderCursor(x, y, currentDocument);

        if (!target || !Util.isDomElement(target) || topElement === target || (target.tagName.toLowerCase() !== 'a' && !$(target).parents('a').length) || !$(target).text().length)
            return topElement;
        //NOTE: we caught link's child with text so it fit for redirect
        else if (target && Util.isDomElement(target) && target.tagName.toLowerCase() === 'a' && topElement !== target && $(target).has(topElement).length && $(topElement).text().length)
            return topElement;

        //NOTE: try to find myltiline link by her rectangle (T163678)
        var linkRect = target.getBoundingClientRect(),
            curTopElement = CursorWidget.getElementUnderCursor(linkRect.right - 1, linkRect.top + 1, currentDocument);

        if ((curTopElement && curTopElement === target) || ($(target).has(curTopElement).length && $(curTopElement).text().length))
            return curTopElement;
        else {
            curTopElement = CursorWidget.getElementUnderCursor(linkRect.left + 1, linkRect.bottom - 1);

            if ((curTopElement && curTopElement === target) || ($(target).has(curTopElement).length && $(curTopElement).text().length))
                return curTopElement;
        }

        return topElement;
    };
});
TestCafeClient.define('Base.CrossDomainMessages', function (require, exports) {
    exports.IFRAME_TEST_RUNNER_PING_DISPATCHER_CMD = 'pingIFrameDispatcher';
    exports.IFRAME_TEST_RUNNER_RUN_CMD = 'runInIFrameTestRunner';
    exports.IFRAME_TEST_RUNNER_WAITING_STEP_COMPLETION_REQUEST_CMD = 'waitingStepCompletionRequest';
    exports.IFRAME_TEST_RUNNER_WAITING_STEP_COMPLETION_RESPONSE_CMD = 'waitingStepCompletionResponse';

    exports.CURSOR_START_REQUEST_CMD = 'cursorStartRequest';
    exports.CURSOR_START_RESPONSE_CMD = 'cursorStartResponse';

    exports.MOVE_TO_IFRAME_REQUEST_CMD = 'moveToIFrameRequest';
    exports.MOVE_TO_IFRAME_RESPONSE_CMD = 'moveToIFrameResponse';

    exports.MOVE_CURSOR_IN_IFRAME_PING = 'moveCursorInIFramePing';
    exports.MOVE_FROM_IFRAME_REQUEST_CMD = 'moveFromIFrameRequest';
    exports.MOVE_FROM_IFRAME_RESPONSE_CMD = 'moveFromIFrameResponse';

    exports.SCROLL_TOP_WINDOW_REQUEST_CMD = 'scrollTopWindowRequest';
    exports.SCROLL_TOP_WINDOW_RESPONSE_CMD = 'scrollTopWindowResponse';

    exports.GET_IFRAME_POSITION_DATA_REQUEST_CMD = 'getIFramePositionDataRequest';
    exports.GET_IFRAME_POSITION_DATA_RESPONSE_CMD = 'getIFramePositionDataResponse';

    exports.GENERATE_GENERAL_PROPERTIES_IN_IFRAME_REQUEST_CMD = 'generateGeneralPropertiesRequest';
    exports.GENERATE_GENERAL_PROPERTIES_IN_IFRAME_RESPONSE_CMD = 'generateGeneralPropertiesResponse';

    exports.GENERATE_CSS_PROPERTIES_IN_IFRAME_REQUEST_CMD = 'generateCssPropertiesRequest';
    exports.GENERATE_CSS_PROPERTIES_IN_IFRAME_RESPONSE_CMD = 'generateCssPropertiesResponse';

    exports.GENERATE_ATTRIBUTES_IN_IFRAME_REQUEST_CMD = 'generateAttributesRequest';
    exports.GENERATE_ATTRIBUTES_IN_IFRAME_RESPONSE_CMD = 'generateAttributesResponse';

    exports.ASSERT_REQUEST_CMD = 'assertRequest';
    exports.ASSERT_RESPONSE_CMD = 'assertResponse';

    exports.OBJECT_VIEWER_GET_OBJECT_VIEW_REQUEST_CMD = 'objectViewerGetObjectViewRequest';
    exports.OBJECT_VIEWER_GET_OBJECT_VIEW_RESPONSE_CMD = 'objectViewerGetObjectViewResponse';

    exports.OBJECT_VIEWER_GET_OBJECT_PROPERTIES_ROWS_REQUEST_CMD = 'objectViewerGetObjectPropertiesRowsRequest';
    exports.OBJECT_VIEWER_GET_OBJECT_PROPERTIES_ROWS_RESPONSE_CMD = 'objectViewerGetObjectPropertiesRowsResponse';
});
TestCafeClient.define('Base.IFrameDispatcher', function (require, exports) {
    var testRunInitializedCallback = null,
        runStep = null;

    (function () {
        var Hammerhead = HammerheadClient.get('Hammerhead'),
            MessageSandbox = Hammerhead.MessageSandbox,
            Util = Hammerhead.Util,
            XhrBarrier = require('ActionBarrier.Xhr'),
            CrossDomainMessages = require('Base.CrossDomainMessages'),
            Automation = require('Automation'),
            AutomationIFrameBehavior = require('Automation.IFrameBehavior'),
            CursorWidget = require('UI.Cursor'),
            TestRunnerBase = require('TestRunner.TestRunnerBase'),
            IFrameTestRunner = require('TestRunner.IFrameTestRunner');

        var pageInitialzied = false,
            actionsQueue = [],
            testRunnerInitialized = false,

            testRunner = new IFrameTestRunner();

        exports.MESSAGE_RECEIVED = 'messageReceived';

        function runOrPushInQueue(fn) {
            if (!pageInitialzied)
                actionsQueue.push(fn);
            else
                fn();
        }

        function onRunStepsMsg(msg) {
            if (!testRunnerInitialized) {
                testRunnerInitialized = true;
                testRunInitializedCallback(testRunner, function (runStepInContext) {
                    runStep = runStepInContext;
                });

                runOrPushInQueue(function () {
                    runStep(msg.stepName, msg.step, 0, function () {
                        testRunner.act._start.apply(testRunner, arguments);
                    });
                });
            }
            else {
                runOrPushInQueue(function () {
                    runStep(msg.stepName, msg.step, 0, function () {
                        testRunner.run.apply(testRunner, arguments);
                    });
                });
            }
        }

        exports.init = function (onTestRunInitialized) {
            Automation.init();

            testRunInitializedCallback = onTestRunInitialized;

            var eventEmitter = new Util.EventEmitter();

            exports.on = function () {
                eventEmitter.on.apply(eventEmitter, arguments);
            };

            exports.off = function () {
                eventEmitter.off.apply(eventEmitter, arguments);
            };

            MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, function (e) {
                var msg = e.message;
                switch (msg.cmd) {
                    case CrossDomainMessages.IFRAME_TEST_RUNNER_RUN_CMD:
                        onRunStepsMsg(msg);
                        break;

                    case CrossDomainMessages.IFRAME_TEST_RUNNER_PING_DISPATCHER_CMD:
                        if (msg.isPingRequest) {
                            MessageSandbox.sendServiceMsg({
                                cmd: CrossDomainMessages.IFRAME_TEST_RUNNER_PING_DISPATCHER_CMD,
                                isPingResponse: true
                            }, window.top);
                        }
                        break;

                    default:
                        eventEmitter.emit(exports.MESSAGE_RECEIVED, msg);
                }
            });
        };

        //Const
        var PAGE_LOAD_TIMEOUT = 3000,
            ANIMATIONS_WAIT_DELAY = 200;

        //Util
        function waitPageLoad(callback) {
            var internal$ = Hammerhead.$,
                loaded = false,
                callbackWrapper = function () {
                    if (!loaded) {
                        loaded = true;
                        callback();
                    }
                };

            internal$(window).load(callbackWrapper);
            internal$(document).ready(function () {
                //NOTE: an iFrame may be removed in this moment
                if (window && window.top)
                    window.setTimeout(callbackWrapper, PAGE_LOAD_TIMEOUT);
            });
        }

        XhrBarrier.init();

        var initialized = false;

        AutomationIFrameBehavior.init();
        CursorWidget.init();

        waitPageLoad(function () {
            if (!initialized) {
                initialized = true;

                window.setTimeout(function () {
                    XhrBarrier.waitPageInitialRequests(function () {
                        MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, function (e) {
                            var msg = e.message;

                            if (msg.cmd === CrossDomainMessages.IFRAME_TEST_RUNNER_WAITING_STEP_COMPLETION_RESPONSE_CMD) {
                                testRunner.onStepCompleted();

                                if (!testRunner.testIterator.state.stopped) {
                                    MessageSandbox.sendServiceMsg({
                                        cmd: TestRunnerBase.IFRAME_STEP_COMPLETED_CMD
                                    }, window.top);
                                }
                            }
                        });

                        var stepWaitingRequestMsg = {
                            cmd: CrossDomainMessages.IFRAME_TEST_RUNNER_WAITING_STEP_COMPLETION_REQUEST_CMD
                        };

                        MessageSandbox.sendServiceMsg(stepWaitingRequestMsg, window.top);

                        pageInitialzied = true;

                        for (var i = 0; i < actionsQueue.length; i++) {
                            actionsQueue[i]();
                        }
                    });
                }, ANIMATIONS_WAIT_DELAY);
            }
        });
    })();
});
TestCafeClient.define('Base.JavascriptExecutor', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        NativeMethods = Hammerhead.NativeMethods,
        ShadowUI = Hammerhead.ShadowUI,
        MessageSandbox = Hammerhead.MessageSandbox,
        JSProcessor = Hammerhead.JSProcessor,
        CustomSelectors = require('Base.jQueryExtensions.Selectors'),

        SAFE_EXECUTOR_DIV_CLASS = 'safeExecutor',
        SAFE_EXECUTOR_IFRAME_CLASS = 'safeExecutorIFrame',

        $safeExecutorDiv = null,
        safeExecutorIFrame = null,
        safeExecutorDocumentBodyOverrided = null;

    //Errors
    exports.EMPTY_SELECTOR_ERROR = 'Empty element selector';
    exports.INVALID_ELEMENTS_IN_JQUERY_OBJECT_ERROR = 'jQuery object contains invalid elements';
    exports.INVALID_ELEMENTS_IN_ARRAY_ERROR = 'Array contains invalid elements';
    exports.INVALID_OBJECT_ERROR = 'Invalid object type';
    exports.RECURSIVE_JQUERY_CALLING_ERROR = 'Maximum call stack size exceeded';
    exports.SELECTOR_DOES_NOT_CONTAIN_ELEMENT_ERROR = 'Selector doesn\'t contain any element';
    exports.JAVASCRIPT_ERROR_PREFIX = 'Javascript error: ';

    var isInIFrameWindow = window.top !== window.self;

    var getSafeExecutorDiv = function () {
        if (!$safeExecutorDiv || !isElementInDom($safeExecutorDiv)) {
            $safeExecutorDiv = ShadowUI.getRoot().find(' > div[class]').filter(function () {
                return $(this).attr('class').indexOf(SAFE_EXECUTOR_DIV_CLASS) === 0;
            });
            if (!$safeExecutorDiv.length) {
                $safeExecutorDiv = $(NativeMethods.createElement.call(document, 'div'));
                NativeMethods.appendChild.call(ShadowUI.getRoot()[0], $safeExecutorDiv[0]);
                ShadowUI.addClass($safeExecutorDiv, SAFE_EXECUTOR_DIV_CLASS);
            }
        }
        return $safeExecutorDiv;
    };

    var getSafeExecutorIFrame = function () {
        if (!safeExecutorIFrame || !isElementInDom($(safeExecutorIFrame)))
            initSafeExecutorIFrame();
        return safeExecutorIFrame;
    };

    var initSafeExecutorIFrame = function () {
        createSafeExecutorIFrame();
        overrideSafeExecutorIFrameProperties();
    };

    var createSafeExecutorIFrame = function () {
        var $safeExecutorIFrame = getSafeExecutorDiv().find('iframe');
        if (!$safeExecutorIFrame.length) {
            $safeExecutorIFrame = $(NativeMethods.createElement.call(document, 'iframe'));
            $safeExecutorIFrame.css('display', 'none');
            NativeMethods.appendChild.call(getSafeExecutorDiv()[0], $safeExecutorIFrame[0]);
            ShadowUI.addClass($safeExecutorIFrame, SAFE_EXECUTOR_IFRAME_CLASS);
        }
        safeExecutorIFrame = $safeExecutorIFrame.get(0);
        $safeExecutorIFrame.load(overrideSafeExecutorIFrameProperties);
    };

    var overrideSafeExecutorIFrameProperties = function () {
        if (!safeExecutorIFrame || !isElementInDom($(safeExecutorIFrame)))
            createSafeExecutorIFrame();

        //NOTE: we override safeExecutorIFrame.contentWindow.document.body property to allow parsing strings like 'document.body.childNodes[0]'
        // or '$('div:first', document.body)' . Safari throws exception on this, so we use another approach in it (change input string during parsing)
        try {
            if (Object.getOwnPropertyDescriptor && Object.getOwnPropertyDescriptor(safeExecutorIFrame.contentWindow.document, 'body') && Object.getOwnPropertyDescriptor(safeExecutorIFrame.contentWindow.document, 'body').configurable) {
                Object.defineProperty(safeExecutorIFrame.contentWindow.document, 'body', {
                    get: function () {
                        return window.document.body;
                    },
                    configurable: true
                });
                safeExecutorDocumentBodyOverrided = true;
            }
            else safeExecutorDocumentBodyOverrided = false;
        }
        catch (e) {
            safeExecutorDocumentBodyOverrided = false;
        }

        var sandboxedJQuery = CustomSelectors.create(Hammerhead.SandboxedJQuery);

        CustomSelectors.init();

        safeExecutorIFrame.contentWindow.$ = safeExecutorIFrame.contentWindow.jQuery = function (selector, context) {
            if (selector === arguments.callee || context === arguments.callee)
                throw new Error(exports.RECURSIVE_JQUERY_CALLING_ERROR);
            else
                return sandboxedJQuery(selector, context);
        };
        safeExecutorIFrame.contentWindow.alert = safeExecutorIFrame.contentWindow.confirm = safeExecutorIFrame.contentWindow.prompt = new Function();

        safeExecutorIFrame.contentWindow[JSProcessor.CALL_METHOD_METH_NAME] = window[JSProcessor.CALL_METHOD_METH_NAME];
        safeExecutorIFrame.contentWindow[JSProcessor.GET_LOCATION_METH_NAME] = window[JSProcessor.GET_LOCATION_METH_NAME];
        safeExecutorIFrame.contentWindow[JSProcessor.GET_PROPERTY_METH_NAME] = window[JSProcessor.GET_PROPERTY_METH_NAME];
        safeExecutorIFrame.contentWindow[JSProcessor.PROCESS_SCRIPT_METH_NAME] = window[JSProcessor.PROCESS_SCRIPT_METH_NAME];
        safeExecutorIFrame.contentWindow[JSProcessor.SET_LOCATION_METH_NAME] = new Function();
        safeExecutorIFrame.contentWindow[JSProcessor.SET_PROPERTY_METH_NAME] = new Function();
    };

    var isElementInDom = function($el){
        return !!$el.parents('body').length;
    };

    var convertToJQueryObject = function (obj) {
        var $result = null,
            error = null;

        var createResultObject = function () {
            return {
                result: $result,
                error: error
            };
        };

        if (Util.isJQueryObj(obj)) {
            if (isDomElementsCollection(obj))
                $result = obj;
            else
                error = exports.INVALID_ELEMENTS_IN_JQUERY_OBJECT_ERROR;
            return createResultObject();
        }

        if (typeof obj === 'string' || Util.isDomElement(obj) || obj instanceof NodeList || obj instanceof HTMLCollection) {
            try {
                var res = $(obj);
                if (Util.isJQueryObj(res))
                    $result = res;
                return createResultObject();
            }
            catch (err) {
                error = exports.JAVASCRIPT_ERROR_PREFIX + err;
                return createResultObject();
            }
        }

        if ($.isArray(obj)) {
            $result = $();
            for (var i = 0; i < obj.length; i++) {
                var converted = convertToJQueryObject(obj[i]);
                if (converted.error) {
                    error = converted.error;
                    return createResultObject();
                }
                else if (!converted.result) {
                    error = exports.INVALID_ELEMENTS_IN_ARRAY_ERROR;
                    return createResultObject();
                }
                $result = $result.add(converted.result);
            }
            return createResultObject();
        }

        if (typeof obj === 'function') {
            $result = exports.eval(obj + '()', function (err) {
                error = exports.JAVASCRIPT_ERROR_PREFIX + err;
            });
            if (error)
                return createResultObject();
            return convertToJQueryObject($result);
        }

        return createResultObject();
    };

    function isDomElementsCollection(obj) {
        if (obj instanceof NodeList || obj instanceof HTMLCollection || $.isArray(obj) || Util.isJQueryObj(obj)) {
            for (var i = 0; i < obj.length; i++)
                if (!Util.isDomElement(obj[i]))
                    return false;
            return true;
        }
        else
            return false;
    }

    function evalExpression(expression) {
        var scriptToEval = [];

        scriptToEval.push('(function (window, document, jQuery, $) {');
        scriptToEval.push('var savedAlert = window.alert;window.alert = new Function();');
        scriptToEval.push('var savedConfirm = window.confirm;window.confirm = new Function();');
        scriptToEval.push('var savedPrompt = window.prompt;window.prompt = new Function();');
        scriptToEval.push('var savedConsoleLog = null; if(window.console) {savedConsoleLog = window.console.log;window.console.log = new Function();}');
        scriptToEval.push('var saved$ = window.$, savedJQuery = window.jQuery; window.$ = $; window.jQuery = $;');
        scriptToEval.push('var err = null;');
        scriptToEval.push('try { var res = (function () { return ' + JSProcessor.process(expression) + '})(); } catch (e) {err = e;}');
        scriptToEval.push('window.alert = savedAlert;');
        scriptToEval.push('window.confirm = savedConfirm;');
        scriptToEval.push('window.prompt = savedPrompt;');
        scriptToEval.push('if(savedConsoleLog){window.console.log = savedConsoleLog;}');
        scriptToEval.push('window.$ = saved$; window.jQuery = savedJQuery;');
        scriptToEval.push('if(err)throw err;');
        scriptToEval.push('return res;');
        scriptToEval.push('})(window.parent, window.parent.document, window.$, window.$)');

        return getSafeExecutorIFrame().contentWindow.eval(scriptToEval.join(''));
    }

    exports.eval = function (expression, errorCallback) {
        try {
            if (!safeExecutorDocumentBodyOverrided)
                expression = expression.replace(/(^|[^a-z0-9_\$])document.body($|[^a-z0-9_\$])/g, function (substr, charBefore, charAfter) {
                    return charBefore + (isInIFrameWindow ? 'window.document.body' : 'window.top.document.body') + charAfter;
                });

            return evalExpression(expression);
        }
        catch (err) {
            errorCallback(err);
        }
    };

    exports.parseSelector = function (selector, parseDomElementsOrJqueryObjectsOnly, callback, context) {
        if (!context || !(window.top === window.self && context.top !== context.self)) {
            callback(exports.parseSelectorSync(selector, parseDomElementsOrJqueryObjectsOnly));
            return;
        }

        currentParseCallback = callback;

        var msg = {
            cmd: IFRAME_PARSE_SELECTOR_REQUEST_MSG_CMD,
            selector: selector,
            parseDomElementsOrJqueryObjectsOnly: parseDomElementsOrJqueryObjectsOnly
        };

        MessageSandbox.sendServiceMsg(msg, context);
    };

    exports.parseSelectorSync = function (selector, parseDomElementsOrJqueryObjectsOnly) {
        var evalResults = null,
            $elements = null,
            $visibleElements = null,
            errorMessage = '';

        function isCombinationOfSelectAndChild() {
            return $elements.length === 2 && Util.isSelectElement($elements[0]) &&
                /option|optgroup/.test($elements[1].tagName.toLowerCase()) && $elements.eq(0).has($elements.last()).length;
        }

        if (!selector.length)
            return {
                $elements: null,
                length: 0,
                $visibleElements: null,
                visibleLength: 0,
                iframeContext: false,
                error: exports.EMPTY_SELECTOR_ERROR,
                selector: selector
            };

        evalResults = exports.eval(selector, function (err) {
            errorMessage = exports.JAVASCRIPT_ERROR_PREFIX + err.message;
        });

        if (!errorMessage) {
            if (Util.isJQueryObj(evalResults)) {
                if (isDomElementsCollection(evalResults))
                    $elements = evalResults;
                else
                    errorMessage = exports.INVALID_ELEMENTS_IN_JQUERY_OBJECT_ERROR;
            }
            else if (parseDomElementsOrJqueryObjectsOnly) {
                if (Util.isDomElement(evalResults) || isDomElementsCollection(evalResults))
                    $elements = $(evalResults);
                else {
                    errorMessage = exports.SELECTOR_DOES_NOT_CONTAIN_ELEMENT_ERROR;
                }
            }
            else {
                var converted = convertToJQueryObject(evalResults);
                if (converted.error) {
                    errorMessage = converted.error;
                }
                else if (!converted.result)
                    errorMessage = exports.INVALID_OBJECT_ERROR;
                else
                    $elements = converted.result;
            }
        }

        //NOTE: we combine clicks on select and option tags to the one action
        var combineSelectAndOption = false;

        if ($elements && !errorMessage) {
            combineSelectAndOption = isCombinationOfSelectAndChild();

            $visibleElements = combineSelectAndOption ? $elements :
                $elements.filter(function (index) {
                    return Util.isElementVisible($elements[index]);
                });
        }

        return {
            $elements: $elements,
            length: combineSelectAndOption ? 1 : ($elements ? $elements.length : 0),
            $visibleElements: $visibleElements,
            visibleLength: combineSelectAndOption ? 1 : ($visibleElements ? $visibleElements.length : 0),
            iframeContext: false,
            error: errorMessage,
            selector: selector,
            evalResults: evalResults
        };
    };

    exports.init = function () {
        //B238559 - iframe creating breaks text selection so we create safe executor iframe after recording starts
        initSafeExecutorIFrame();
    };

    //Cross-domain
    var IFRAME_PARSE_SELECTOR_REQUEST_MSG_CMD = 'parseSelectorRequest',
        IFRAME_PARSE_SELECTOR_RESPONSE_MSG_CMD = 'parseSelectorResponse';

    var currentParseCallback = null;

    MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, function (e) {
        var msg = e.message;

        switch (msg.cmd) {
            case IFRAME_PARSE_SELECTOR_REQUEST_MSG_CMD:
                var res = exports.parseSelectorSync(msg.selector, msg.parseDomElementsOrJqueryObjectsOnly);

                res.length = res.$elements ? res.$elements.length : 0;
                res.iframeContext = true;

                //NOTE: prepare to JSON serialization
                delete res.$elements;
                delete res.$visibleElements;
                delete res.evalResults;

                var responseMsg = {
                    cmd: IFRAME_PARSE_SELECTOR_RESPONSE_MSG_CMD,
                    parsedSelector: res,
                    selector: msg.selector
                };

                MessageSandbox.sendServiceMsg(responseMsg, window.top);

                break;

            case IFRAME_PARSE_SELECTOR_RESPONSE_MSG_CMD:
                if (typeof currentParseCallback === 'function') {
                    currentParseCallback(msg.parsedSelector);
                    currentParseCallback = null;
                }
                break;
        }
    });
});
TestCafeClient.define('Base.Transport', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        Transport = Hammerhead.Transport,
        Settings = require('Settings'),
        ServiceCommands = require('Shared.ServiceCommands');

    //Const
    var MAX_INACTIVITY_DURATION = 110000;

    //Globals
    var inactivityHandler = null,
        inactivityTimeout = null;

    function resetInactivityTimeout(expectedInactivityDuration) {
        if (inactivityHandler) {
            window.clearTimeout(inactivityTimeout);
            inactivityTimeout = window.setTimeout(inactivityHandler, expectedInactivityDuration || MAX_INACTIVITY_DURATION);
        }
    }

    //Exports
    //-------------------------------------------------------------------------------------
    exports.syncServiceMsg = function (msg, callback) {
        resetInactivityTimeout();

        return Transport.syncServiceMsg(msg, callback);
    };

    exports.asyncServiceMsg = function (msg, callback) {
        resetInactivityTimeout();

        return Transport.asyncServiceMsg(msg, callback);
    };

    exports.waitForServiceMessagesCompleted = Transport.waitForServiceMessagesCompleted;
    exports.batchUpdate = Transport.batchUpdate;
    exports.queuedAsyncServiceMsg = Transport.queuedAsyncServiceMsg;

    exports.switchToWorkerIdle = function () {
        window.location.href = Settings.WORKER_IDLE_URL;
    };

    exports.switchToStartRecordingUrl = function (recordingUrl) {
        var removeHashRegExp = /#.*$/,
            replacedLocationHref = window.location.href.replace(removeHashRegExp, '').toLowerCase(),
            replacedRecordingUrl = recordingUrl.replace(removeHashRegExp, '').toLowerCase();

        window.location.href = recordingUrl;

        //T210251 - Playback doesn't start on page with location with hash
        if (window.location.hash && replacedLocationHref === replacedRecordingUrl && removeHashRegExp.test(recordingUrl))
            window.location.reload(true);
    };

    exports.expectInactivity = function (duration, callback) {
        var maxDuration = duration + MAX_INACTIVITY_DURATION;

        //NOTE: order is important here. serviceMsg should go first because it also resets inactivity timeout
        var inactivityExpectedMsg = {
            cmd: ServiceCommands.INACTIVITY_EXPECTED,
            duration: maxDuration
        };

        exports.asyncServiceMsg(inactivityExpectedMsg, function () {
            resetInactivityTimeout(maxDuration);
            callback();
        });
    };

    exports.fail = function (err) {
        var testFailMsg = {
            cmd: ServiceCommands.TEST_FAIL,
            err: err
        };

        exports.asyncServiceMsg(testFailMsg, function () {
            exports.switchToWorkerIdle();
        });

        //HACK: this helps stop current JS context execution
        window.onerror = function () {
        };
        throw 'STOP';
    };

    exports.assertionFailed = function (err) {
        var assertionFailedMsg = {
            cmd: ServiceCommands.ASSERTION_FAILED,
            err: err
        };

        exports.asyncServiceMsg(assertionFailedMsg);
    };


    //NOTE: we are using transport messages as a test activity monitor. If we are not receiving any service
    //message for a long time period then something is definitely went wrong.
    exports.startInactivityMonitor = function (onInactivity) {
        inactivityHandler = onInactivity;
        resetInactivityTimeout();
    };

    exports.stopInactivityMonitor = function () {
        if (inactivityHandler) {
            inactivityHandler = null;
            window.clearTimeout(inactivityTimeout);
        }
    };
});
TestCafeClient.define('TestRunner.SourceIndexTracker', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        Util = Hammerhead.Util,
        Settings = require('Settings');

    var SOURCE_INDEX_ARG_REGEXP = /#(\d+)/;

    exports.currentIndex = null;

    exports.wrapTrackableMethods = function (methodsHost, methodNames) {
        Util.arrForEach(methodNames, function (methName) {
            var originalMeth = methodsHost[methName];

            methodsHost[methName] = function () {
                var args = Array.prototype.slice.call(arguments);

                if (Settings.ENABLE_SOURCE_INDEX) {
                    var idxArg = args[args.length - 1],
                        idxMatch = typeof idxArg === 'string' && idxArg.match(SOURCE_INDEX_ARG_REGEXP);

                    //NOTE: check if we actually have sourc index. Because in some edge case it can't be
                    //calcualted by compiler
                    if (idxMatch) {
                        exports.currentIndex = parseInt(idxMatch[1], 10);
                        args.pop();
                    }
                }

                return originalMeth.apply(this, args);
            };
        });
    };
});
TestCafeClient.define('TestRunner.TestIterator', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        async = Hammerhead.async,
        Util = Hammerhead.Util,
        NativeMethods = Hammerhead.NativeMethods,
        JSON = Hammerhead.JSON,
        ActionBarrier = require('ActionBarrier'),
        XhrBarrier = require('ActionBarrier.Xhr'),
        Settings = require('Settings'),
        SharedErrors = require('Shared.Errors');

    //Const
    var STEP_DELAY = 500,
        PROLONGED_STEP_DELAY = 3000,
        SHORT_PROLONGED_STEP_DELAY = 30;

    //Iterator
    var TestIterator = this.exports = function (pingIFrame) {
        this.state = {
            step: 0,
            stepNames: null,
            testSteps: null,
            pageUnloading: false,
            stepDelayTimeout: null,
            inAsyncAction: false,
            prolongStepDelay: false,
            shortProlongStepDelay: false,
            stepsSharedData: {},
            lastSyncedSharedDataJSON: null,
            stopped: false,
            waitedIFrame: null,
            needScreeshot: false
        };

        this.pingIFrame = pingIFrame;
        this.globalWaitForEvent = null;
        this.globalWaitForTimeout = null;

        this.eventEmitter = new Util.EventEmitter();
    };

    //Events
    TestIterator.TEST_COMPLETE_EVENT = 'testComplete';
    TestIterator.NEXT_STEP_STARTED_EVENT = 'nextStepStarted';
    TestIterator.ACTION_TARGET_WAITING_STARTED_EVENT = 'actionTargetWaitingStarted';
    TestIterator.ACTION_RUN_EVENT = 'actionRun';
    TestIterator.ERROR_EVENT = 'error';
    TestIterator.ASSERTION_FAILED_EVENT = 'assertionFailed';
    TestIterator.SET_STEPS_SHARED_DATA_EVENT = 'setStepsSharedData';
    TestIterator.GET_STEPS_SHARED_DATA_EVENT = 'getStepsSharedData';
    TestIterator.EXPECT_INACTIVITY_EVENT = 'expectInactivity';
    TestIterator.TAKE_SCREENSHOT_EVENT = 'takeScreenshot';
    TestIterator.BEFORE_UNLOAD_EVENT_RAISED = 'beforeUnload';
    TestIterator.UNLOAD_EVENT_RAISED = 'unload';

    TestIterator.prototype.on = function () {
        return this.eventEmitter.on.apply(this.eventEmitter, arguments);
    };

    TestIterator.prototype._checkSharedDataSerializable = function () {
        var error = null;

        if (!JSON.isSerializable(this.state.stepsSharedData)) {
            error = {
                code: SharedErrors.STORE_DOM_NODE_OR_JQUERY_OBJECT,
                stepName: Settings.CURRENT_TEST_STEP_NAME,
                stepNum: this.state.step - 1
            };

            this.eventEmitter.emit(TestIterator.ERROR_EVENT, error);

            return false;
        }

        return true;
    };

    TestIterator.prototype._runStep = function () {
        this.state.stopped = false;

        var testIterator = this;

        if (testIterator.state.step > 0 && !testIterator.state.stepDoneCalled && typeof testIterator.state.stepDone === 'function') {
            testIterator.state.stepDone();
            testIterator.state.stepDoneCalled = true;
        }

        if (this.state.stopped)
            return;

        if (testIterator.state.step >= testIterator.state.testSteps.length) {
            this.eventEmitter.emit(TestIterator.TEST_COMPLETE_EVENT, {
                callback: function () {
                    testIterator.state.runningCopmlete = true;
                }
            });

            return;
        }

        Settings.CURRENT_TEST_STEP_NAME = testIterator.state.stepNames[testIterator.state.step];

        var stepToRun = testIterator.state.testSteps[testIterator.state.step];

        testIterator.state.step++;

        testIterator.eventEmitter.emit(TestIterator.NEXT_STEP_STARTED_EVENT, {
            nextStep: testIterator.state.step,
            callback: function () {
                testIterator.__waitFor(function () {
                    var error = null;

                    if (typeof testIterator.state.stepSetup === 'function')
                        testIterator.state.stepSetup();

                    testIterator.state.stepDoneCalled = false;

                    testIterator.state.inAsyncAction = false;
                    testIterator.state.prolongStepDelay = false;
                    testIterator.state.shortProlongStepDelay = false;

                    try {
                        testIterator.callWithSharedDataContext(stepToRun);
                    } catch (err) {
                        error = {
                            code: SharedErrors.UNCAUGHT_JS_ERROR_IN_TEST_CODE_STEP,
                            scriptErr: (err && err.message) || err,
                            stepName: Settings.CURRENT_TEST_STEP_NAME,
                            stepNum: testIterator.state.step - 1
                        };

                        testIterator.eventEmitter.emit(TestIterator.ERROR_EVENT, error);
                    }

                    if (testIterator.state.stopped)
                        return;

                    var runCallback = function () {
                        if (typeof testIterator.state.stepDone === 'function' && !testIterator.state.stepDoneCalled) {
                            testIterator.state.stepDone();
                            testIterator.state.stepDoneCalled = true;
                        }

                        testIterator._runStep();
                    };

                    //NOTE: don't run next step if previous step initiated async action
                    if (!testIterator.state.inAsyncAction) {
                        //NOTE: validate shared data changes that were made on this step (see: B236594)
                        //If there was an action in the step, validation must be performed in _syncSharedData
                        //  before serialization.
                        if (!testIterator._checkSharedDataSerializable())
                            return;

                        if (Settings.TAKE_SCREENSHOT_ON_FAILS && testIterator.state.needScreeshot) {
                            testIterator.takeScreenshot(function () {
                                testIterator.state.needScreeshot = false;
                                runCallback();
                            }, true);
                        }
                        else
                            runCallback();
                    }
                });
            }
        });
    };

    TestIterator.prototype._setupUnloadPrediction = function () {
        var testIterator = this,
            $form = $('form'),
            prolong = function () {
                testIterator.state.prolongStepDelay = true;
            },
            shortProlong = function () {
                testIterator.state.shortProlongStepDelay = true;
            },
            beforeUnload = function () {
                testIterator.state.pageUnloading = true;

                testIterator.eventEmitter.emit(TestIterator.BEFORE_UNLOAD_EVENT_RAISED);
            },
            unload = function () {
                testIterator.state.pageUnloading = true;

                testIterator.eventEmitter.emit(TestIterator.UNLOAD_EVENT_RAISED);
            };

        $(document).on('submit', 'form', prolong);

        $form.each(function () {
            var submit = this.submit;

            this.submit = function () {
                prolong();
                submit.apply(this, arguments);
            };
        });

        var skipBeforeUnloadEvent = false;

        NativeMethods.addEventListener.call(document, 'click', function (e) {
            var target = (e.srcElement || e.target);

            if (!e.defaultPrevented && target.tagName && target.tagName.toLowerCase() === 'a') {
                var href = $(target).attr('href');

                if (target.hasAttribute('href') && !/(^javascript:)|(^mailto:)|(^tel:)|(^#)/.test(href))
                    prolong();
                else if (Util.isIE)
                    skipBeforeUnloadEvent = true;
            }
        });

        //NOTE: IE fires onbeforeunload even if link was just clicked without actual unloading
        function onBeforeUnloadIE() {
            shortProlong();

            window.setTimeout(function () {
                //NOTE: except file downloading
                if (document.readyState === 'loading' && !(document.activeElement && document.activeElement.tagName.toLowerCase() === 'a' && document.activeElement.getAttribute('download') !== null))
                    beforeUnload();
            }, 0);
        }

        Hammerhead.on(Hammerhead.BEFORE_UNLOAD_EVENT, Util.isIE ? onBeforeUnloadIE : beforeUnload);

        Hammerhead.on(Hammerhead.BEFORE_UNLOAD_EVENT, function () {
            skipBeforeUnloadEvent = false;
        });

        NativeMethods.windowAddEventListener.call(window, 'unload', unload);
    };

    TestIterator.prototype._syncSharedDataWithServer = function (callback) {
        var testIterator = this,
            sharedDataJSON = '';

        if (!testIterator._checkSharedDataSerializable())
            return;

        sharedDataJSON = JSON.stringify(testIterator.state.stepsSharedData);

        //NOTE: avoid unnecessary shared data sync if it's not changed
        if (testIterator.state.lastSyncedSharedDataJSON === sharedDataJSON) {
            if (typeof callback === 'function')
                callback();
        }
        else {
            testIterator.eventEmitter.emit(TestIterator.SET_STEPS_SHARED_DATA_EVENT, {
                stepsSharedData: testIterator.state.stepsSharedData,
                callback: function () {
                    testIterator.state.lastSyncedSharedDataJSON = sharedDataJSON;

                    if (typeof callback === 'function')
                        callback();
                }
            });
        }
    };

    TestIterator.prototype._completeAsyncAction = function () {
        var testIterator = this;

        if (typeof testIterator.state.stepDone === 'function' && !testIterator.state.stepDoneCalled) {
            testIterator.state.stepDone();
            testIterator.state.stepDoneCalled = true;
        }

        if (testIterator.state.stopped)
            return;

        var run = function () {
            if (!testIterator.state.pageUnloading) {
                testIterator._runStep();
                window.clearTimeout(testIterator.state.stepDelayTimeout);
                testIterator.state.stepDelayTimeout = null;
            }
        };

        //NOTE: browsers continues to execute script even if the request for the new page occurs. To workaround this
        //we are using heuristic-based delays for the next step execution (see setupUnloadPrediction() method).
        testIterator.state.stepDelayTimeout = window.setTimeout(function () {
            if (testIterator.state.prolongStepDelay || testIterator.state.shortProlongStepDelay) {
                testIterator.state.stepDelayTimeout = window.setTimeout(function () {
                    run();
                }, testIterator.state.prolongStepDelay ? PROLONGED_STEP_DELAY : SHORT_PROLONGED_STEP_DELAY);
            } else
                run();
        }, STEP_DELAY);
    };

    TestIterator.prototype.callWithSharedDataContext = function (func) {
        return func.apply(this.state.stepsSharedData);
    };

    TestIterator.prototype._checkIFrame = function (element, callback) {
        if (window.top !== window.self || !Util.isElementInIframe(element)) {
            callback(null);
            return;
        }

        var iFrame = Util.getIFrameByElement(element);

        this.pingIFrame(iFrame, function () {
            callback(iFrame);
        });

    };

    TestIterator.prototype.asyncAction = function (action) {
        var testIterator = this;

        this.state.inAsyncAction = true;

        var actionRun = function () {
            testIterator._syncSharedDataWithServer(function () {
                ActionBarrier.waitActionSideEffectsCompletion(action, function () {
                    testIterator._completeAsyncAction.apply(testIterator, arguments);
                });
            });
        };

        if (Settings.TAKE_SCREENSHOT_ON_FAILS && this.state.needScreeshot) {
            this.takeScreenshot(function () {
                testIterator.state.needScreeshot = false;
                actionRun();
            }, true);
        }
        else
            actionRun();
    };

    TestIterator.prototype.asyncActionSeries = function (items, runArgumentsIterator, action) {
        var testIterator = this;

        var actionsRun = function () {
            var seriesActionsRun = function (elements, callback) {
                async.forEachSeries(
                    elements,
                    function (element, asyncCallback) {
                        //NOTE: since v.14.1.5 it's recommended to run actions with the inIFrame function. But we should support old-style iframes
                        //using, so, it'll be resolved here.
                        testIterator._checkIFrame(element, function (iframe) {
                            if (!iframe) {
                                ActionBarrier.waitActionSideEffectsCompletion(function (barrierCallback) {
                                    action(element, barrierCallback);
                                }, asyncCallback);
                            }
                            else {
                                var iFrameStartXhrBarrier = iframe.contentWindow[XhrBarrier.GLOBAL_START_XHR_BARRIER],
                                    iFrameWaitXhrBarrier = iframe.contentWindow[XhrBarrier.GLOBAL_WAIT_XHR_BARRIER];

                                ActionBarrier.waitActionSideEffectsCompletion(function (barrierCallback) {
                                    var iFrameBeforeUnloadRaised = false;

                                    testIterator.iFrameActionCallback = function () {
                                        testIterator.iFrameActionCallback = null;
                                        testIterator.waitedIFrame = null;
                                        barrierCallback();
                                    };

                                    testIterator.waitedIFrame = iframe;

                                    iFrameStartXhrBarrier(function () {
                                        if (!iFrameBeforeUnloadRaised)
                                            testIterator.iFrameActionCallback();
                                    });

                                    function onBeforeUnload() {
                                        NativeMethods.windowRemoveEventListener.call(iframe.contentWindow, 'beforeunload', onBeforeUnload);
                                        iFrameBeforeUnloadRaised = true;
                                    }

                                    NativeMethods.windowAddEventListener.call(iframe.contentWindow, 'beforeunload', onBeforeUnload, true);

                                    action(element, function () {
                                        iFrameWaitXhrBarrier();
                                    }, iframe);
                                }, asyncCallback);
                            }
                        });
                    },
                    function () {
                        if (testIterator.state.stopped)
                            return;

                        callback();
                    });
            };

            testIterator._syncSharedDataWithServer(function () {
                runArgumentsIterator(items, seriesActionsRun, function () {
                    testIterator._completeAsyncAction.apply(testIterator, arguments);
                });
            });
        };

        testIterator.state.inAsyncAction = true;

        if (Settings.TAKE_SCREENSHOT_ON_FAILS && this.state.needScreeshot) {
            this.takeScreenshot(function () {
                testIterator.state.needScreeshot = false;
                actionsRun();
            }, true);
        }
        else
            actionsRun();
    };

    TestIterator.prototype._init = function () {
        this.initialized = true;

        this._setupUnloadPrediction();
    };

    TestIterator.prototype.start = function (stepNames, testSteps, stepSetup, stepDone, nextStep) {
        this._init();

        this.runSteps(stepNames, testSteps, stepSetup, stepDone, nextStep);
    };

    TestIterator.prototype.stop = function () {
        //NOTE: this flag created for playback in recording mode
        // to prevent test playback after error raised
        //and in test running to prevent playback during screenshot making
        this.state.stopped = true;
    };

    TestIterator.prototype.runSteps = function (stepNames, testSteps, stepSetup, stepDone, nextStep) {
        if (!this.initialized)
            this._init();

        var testIterator = this;

        testIterator.state.testSteps = testSteps;
        testIterator.state.stepNames = stepNames;
        testIterator.state.inAsyncAction = false;
        testIterator.state.step = nextStep;
        testIterator.state.stepSetup = stepSetup;
        testIterator.state.stepDone = stepDone;
        testIterator.state.runningCopmlete = false;

        testIterator.eventEmitter.emit(TestIterator.GET_STEPS_SHARED_DATA_EVENT, {
            callback: function (sharedData) {
                testIterator.state.stepsSharedData = sharedData || {};
                testIterator.state.lastSyncedSharedDataJSON = JSON.stringify(testIterator.state.stepsSharedData);
                testIterator._runStep();
            }
        });
    };

    TestIterator.prototype.getSharedData = function () {
        return this.state.stepsSharedData;
    };

    TestIterator.prototype.setSharedData = function (data) {
        this.state.stepsSharedData = data;
        this._syncSharedDataWithServer();
    };

    TestIterator.prototype.onError = function (err) {
        if (this.state.stopped)
            return;

        this.eventEmitter.emit(TestIterator.ERROR_EVENT, $.extend({
            stepNum: this.state.step - 1
        }, err));
    };

    TestIterator.prototype.onAssertionFailed = function (err) {
        if (this.state.stopped)
            return;

        this.eventEmitter.emit(TestIterator.ASSERTION_FAILED_EVENT, {
            err: err,
            stepNum: this.state.step - 1,
            isAssertion: true
        });
    };

    TestIterator.prototype.expectInactivity = function (duration, callback) {
        this.eventEmitter.emit(TestIterator.EXPECT_INACTIVITY_EVENT, {
            duration: duration,
            callback: callback
        });
    };

    TestIterator.prototype.runNext = function () {
        this._runStep();
    };

    TestIterator.prototype.runLast = function () {
        this.state.step--;
        this.runNext();
    };

    TestIterator.prototype.getCurrentStep = function () {
        return this.state.stepNames ? this.state.stepNames[this.state.step - 1] : Settings.CURRENT_TEST_STEP_NAME;
    };

    TestIterator.prototype.getCurrentStepNum = function () {
        return this.state.step - 1;
    };

    TestIterator.prototype.onActionTargetWaitingStarted = function (e) {
        this.eventEmitter.emit(TestIterator.ACTION_TARGET_WAITING_STARTED_EVENT, e);
    };

    TestIterator.prototype.onActionRun = function () {
        this.eventEmitter.emit(TestIterator.ACTION_RUN_EVENT, {});
    };

    //Global __waitFor()
    TestIterator.prototype.setGlobalWaitFor = function (event, timeout) {
        this.globalWaitForEvent = event;
        this.globalWaitForTimeout = timeout;
    };

    TestIterator.prototype.__waitFor = function (callback) {
        var testIterator = this;

        if (typeof this.globalWaitForEvent !== 'function') {
            callback();
            return;
        }

        if (typeof this.globalWaitForTimeout !== 'number')
            this.globalWaitForTimeout = 0;

        var timeoutID = window.setTimeout(function () {
            testIterator.onError({
                code: SharedErrors.API_WAIT_FOR_ACTION_TIMEOUT_EXCEEDED,
                stepName: Settings.CURRENT_TEST_STEP_NAME
            });
        }, this.globalWaitForTimeout);


        this.expectInactivity(this.globalWaitForTimeout, function () {
            testIterator.callWithSharedDataContext(function () {
                testIterator.globalWaitForEvent.call(this, function () {
                    window.clearTimeout(timeoutID);
                    callback();
                });
            });
        });
    };

    TestIterator.prototype.takeScreenshot = function (callback, isFailedStep) {
        this.eventEmitter.emit(TestIterator.TAKE_SCREENSHOT_EVENT, {
            isFailedStep: isFailedStep,
            callback: callback
        });
    };
});
TestCafeClient.define('TestRunner.TestRunner', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        Util = Hammerhead.Util,
        Transport = require('Base.Transport'),
        ServiceCommands = require('Shared.ServiceCommands'),
        SharedErrors = require('Shared.Errors'),
        Settings = require('Settings'),

        TestRunnerBase = require('TestRunner.TestRunnerBase');

    var WAITING_FOR_SERVICE_MESSAGES_COMPLETED_DELAY = 1000;

    var TestRunner = this.exports = function (startedCallback) {
        var testRunner = this;

        TestRunnerBase.apply(this, [startedCallback]);

        Transport.startInactivityMonitor(function () {
            testRunner._onError({
                code: SharedErrors.TEST_INACTIVITY
            });
        });
    };

    Util.inherit(TestRunner, TestRunnerBase);

    TestRunner.prototype._onTestComplete = function (e) {
        Transport.waitForServiceMessagesCompleted(function () {
            var testCompleteMsg = {
                cmd: ServiceCommands.TEST_COMPLETE
            };

            Transport.asyncServiceMsg(testCompleteMsg, function () {
                e.callback();
                Transport.switchToWorkerIdle();
            });
        }, WAITING_FOR_SERVICE_MESSAGES_COMPLETED_DELAY);
    };

    TestRunner.prototype._onNextStepStarted = function (e) {
        var nextStepMsg = {
            cmd: ServiceCommands.SET_NEXT_STEP,
            nextStep: e.nextStep
        };

        Transport.asyncServiceMsg(nextStepMsg, e.callback);
    };

    //NOTE: decrease step counter while an action is waiting for element available and decrease it when action running started (T230851)
    TestRunner.prototype._onActionTargetWaitingStarted = function (e) {
        TestRunnerBase.prototype._onActionTargetWaitingStarted.apply(this, [e]);

        var msg = {
            cmd: ServiceCommands.SET_ACTION_TARGET_WAITING,
            value: true
        };

        Transport.asyncServiceMsg(msg);
    };

    TestRunner.prototype._onActionRun = function () {
        TestRunnerBase.prototype._onActionRun.apply(this, []);

        var msg = {
            cmd: ServiceCommands.SET_ACTION_TARGET_WAITING,
            value: false
        };

        Transport.asyncServiceMsg(msg);
    };

    TestRunner.prototype._onError = function (err) {
        var testRunner = this;

        if (this.stopped)
            return;

        //NOTE: we should stop testIterator to prevent playback after an error is occurred
        this.testIterator.stop();

        TestRunnerBase.prototype._onError.call(this, err);

        if (!Settings.TAKE_SCREENSHOT_ON_FAILS) {
            this.stopped = true;
            Transport.fail(err);
            return;
        }

        var setErrorMsg = {
            cmd: ServiceCommands.SET_TEST_ERROR,
            err: err
        };

        Transport.asyncServiceMsg(setErrorMsg);

        this._onTakeScreenshot({
            isFailedStep: true,
            withoutStepName: !(SharedErrors.hasErrorStepName(err) && Hammerhead.Errs.hasErrorStepName(err)),
            callback: function () {
                testRunner.stopped = true;
                Transport.fail(err);
            }
        });
    };

    TestRunner.prototype._onAssertionFailed = function (e, inIFrame) {
        this.testIterator.state.needScreeshot = !inIFrame;
        Transport.assertionFailed(e.err);
    };

    TestRunner.prototype._onSetStepsSharedData = function (e) {
        var msg = {
            cmd: ServiceCommands.SET_STEPS_SHARED_DATA,
            stepsSharedData: e.stepsSharedData
        };

        Transport.asyncServiceMsg(msg, function () {
            e.callback();
        });
    };

    TestRunner.prototype._onGetStepsSharedData = function (e) {
        var msg = {cmd: ServiceCommands.GET_STEPS_SHARED_DATA};

        Transport.asyncServiceMsg(msg, e.callback);
    };

    TestRunner.prototype._onExpectInactivity = function (e) {
        Transport.expectInactivity(e.duration, e.callback);
    };

    TestRunner.prototype._onTakeScreenshot = function (e) {
        var savedTitle = document.title,
            windowMark = '[tc-' + Date.now() + ']',
            browserName = null,
            callback = e && e.callback ? e.callback : function () {
            },
            testRunner = this;

        testRunner.eventEmitter.emit(TestRunnerBase.SCREENSHOT_CREATING_STARTED_EVENT, {});


        if (Util.isSafari)
            browserName = 'SAFARI';
        else if (Util.isOpera || Util.isOperaWithWebKit)
            browserName = 'OPERA';
        else if (Util.isWebKit)
            browserName = 'CHROME';
        else if (Util.isMozilla)
            browserName = 'FIREFOX';
        else if (Util.isIE)
            browserName = 'IE';

        var msg = {
            cmd: ServiceCommands.TAKE_SCREENSHOT,
            windowMark: windowMark,
            browserName: browserName,
            isFailedStep: e.isFailedStep,
            withoutStepName: e.withoutStepName,
            url: window.location.toString()
        };

        var assignedTitle = savedTitle + windowMark,
            checkTitleIntervalId = window.setInterval(function () {
                if (document.title !== assignedTitle) {
                    savedTitle = document.title;
                    document.title = assignedTitle;
                }
            }, 50);

        document.title = assignedTitle;

        //NOTE: we should set timeouts to changing of document title
        //in any case we are waiting response from server
        window.setTimeout(function () {
            Transport.asyncServiceMsg(msg, function () {
                window.clearInterval(checkTitleIntervalId);
                checkTitleIntervalId = null;
                document.title = savedTitle;
                testRunner.eventEmitter.emit(TestRunnerBase.SCREENSHOT_CREATING_FINISHED_EVENT, {});

                window.setTimeout(function () {
                    callback();
                }, 100);
            });
        }, 500);
    };

    TestRunner.prototype._onDialogsInfoChanged = function (info) {
        Transport.asyncServiceMsg({
            cmd: ServiceCommands.NATIVE_DIALOGS_INFO_SET,
            info: info,
            timeStamp: Date.now()
        });
    };
});

TestCafeClient.define('TestRunner.TestRunnerBase', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        MessageSandbox = Hammerhead.MessageSandbox,
        jQuerySelectorExtensions = require('Base.jQueryExtensions.Selectors'),
        Settings = require('Settings'),
        Transport = require('Base.Transport'),
        CrossDomainMessages = require('Base.CrossDomainMessages'),
        SharedErrors = require('Shared.Errors'),
        ServiceCommands = require('Shared.ServiceCommands'),

        TestIterator = require('TestRunner.TestIterator'),
        ActionsAPI = require('TestRunner.API.Actions'),
        DialogsAPI = require('TestRunner.API.Dialogs'),
        AssertionsAPI = require('TestRunner.API.Assertions'),

        Automation = require('Automation'),
        ActionBarrier = require('ActionBarrier'),
        ModalBackground = require('UI.ModalBackground'),
        CursorWidget = require('UI.Cursor'),
        AutomationIFrameBehavior = require('Automation.IFrameBehavior');

    //Const
    var PAGE_LOAD_TIMEOUT = 3000,
        ANIMATIONS_WAIT_DELAY = 200,
        CHECK_FILE_DOWNLOADING_DELAY = 500,
        IFRAME_EXISTENCE_WATCHING_INTERVAL = 1000;

    //Util
    function waitPageLoad(callback) {
        var internal$ = Hammerhead.$,
            loaded = false,
            callbackWrapper = function () {
                if (!loaded) {
                    loaded = true;
                    callback();
                }
            };

        internal$(window).load(callbackWrapper);
        internal$(document).ready(function () {
            //NOTE: an iFrame may be removed in this moment
            if (window && window.top)
                window.setTimeout(callbackWrapper, PAGE_LOAD_TIMEOUT);
        });
    }

    //Init
    var TestRunnerBase = this.exports = function () {
        var testRunner = this;

        this.eventEmitter = new Util.EventEmitter();
        this.testIterator = new TestIterator(pingIFrame);

        this.executingStepInIFrameWindow = null;
        this.stopped = false;
        this.listenNativeDialogs = false;
        this.isFileDownloadingIntervalID = null;

        this.assertionsAPI = new AssertionsAPI(function (err) {
            testRunner.testIterator.onAssertionFailed(err);
        });

        ActionsAPI.init(this.testIterator);

        this._initNativeDialogs();

        Automation.init();
        this._initBarrier();

        this._initApi();
        this._initIFrameBehavior();

        Hammerhead.on(Hammerhead.UNCAUGHT_JS_ERROR, function (err) {
            //NOTE: in this case we should to stop test iterator in iFrame
            if (err.inIFrame && !Settings.PLAYBACK)
                testRunner.testIterator.stop();
            else if (Settings.FAIL_ON_JS_ERRORS || Settings.RECORDING) {
                testRunner._onError({
                    code: SharedErrors.UNCAUGHT_JS_ERROR,
                    scriptErr: err.msg,
                    pageError: true,
                    pageUrl: err.pageUrl
                });
            }
        });

        testRunner.testIterator.on(TestIterator.ERROR_EVENT, function (e) {
            testRunner._onError(e);
        });

        testRunner.act._onJSError = function (err) {
            testRunner._onError({
                code: SharedErrors.UNCAUGHT_JS_ERROR,
                scriptErr: (err && err.message) || err
            });
        };

        testRunner.act._start = function (stepNames, testSteps, nextStep, skipPageWaiting) {
            //NOTE: start test execution only when all content is loaded or if loading
            //timeout is reached (whichever comes first).
            testRunner._prepareStepsExecuting(function () {
                delete testRunner.act._onJSError;
                delete testRunner.act._start;

                testRunner.eventEmitter.emit(testRunner.TEST_STARTED_EVENT, {
                    nextStep: nextStep
                });

                ModalBackground.hide();

                testRunner.testIterator.on(TestIterator.TEST_COMPLETE_EVENT, function (e) {
                    testRunner._onTestComplete(e);
                });

                testRunner.testIterator.on(TestIterator.NEXT_STEP_STARTED_EVENT, function (e) {
                    testRunner._onNextStepStarted(e);
                    testRunner._clearFileDownloadingInterval();
                });

                testRunner.testIterator.on(TestIterator.ACTION_TARGET_WAITING_STARTED_EVENT, function (e) {
                    testRunner._onActionTargetWaitingStarted(e);
                });

                testRunner.testIterator.on(TestIterator.ACTION_RUN_EVENT, function (e) {
                    testRunner._onActionRun(e);
                });

                testRunner.testIterator.on(TestIterator.ASSERTION_FAILED_EVENT, function (e) {
                    testRunner._onAssertionFailed(e);
                });

                testRunner.testIterator.on(TestIterator.SET_STEPS_SHARED_DATA_EVENT, function (e) {
                    testRunner._onSetStepsSharedData(e);
                });

                testRunner.testIterator.on(TestIterator.GET_STEPS_SHARED_DATA_EVENT, function (e) {
                    testRunner._onGetStepsSharedData(e);
                });
                testRunner.testIterator.on(TestIterator.EXPECT_INACTIVITY_EVENT, function (e) {
                    testRunner._onExpectInactivity(e);
                });

                testRunner.testIterator.on(TestIterator.TAKE_SCREENSHOT_EVENT, function (e) {
                    testRunner._onTakeScreenshot(e);
                });

                testRunner.testIterator.on(TestIterator.BEFORE_UNLOAD_EVENT_RAISED, function () {
                    testRunner._onBeforeUnload();
                });

                testRunner.testIterator.on(TestIterator.UNLOAD_EVENT_RAISED, function () {
                    testRunner._clearFileDownloadingInterval();
                });

                testRunner.listenNativeDialogs = true;

                testRunner.testIterator.start(stepNames, testSteps, DialogsAPI.resetHandlers,
                    DialogsAPI.checkExpectedDialogs, nextStep);
            }, skipPageWaiting);
        };
    };

    TestRunnerBase.prototype.run = function (stepNames, testSteps, nextStep) {
        this.testIterator.runSteps(stepNames, testSteps, DialogsAPI.resetHandlers,
            DialogsAPI.checkExpectedDialogs, nextStep);
    };

    TestRunnerBase.prototype._destroy = function () {
        DialogsAPI.destroy();

        this._destroyIFrameBehavior();

        Transport.stopInactivityMonitor();
    };

    TestRunnerBase.prototype._initBarrier = function () {
        ActionBarrier.init();
    };

    TestRunnerBase.prototype._initIFrameBehavior = function () {
        var testRunner = this;

        AutomationIFrameBehavior.init();

        function onMessage(e) {
            var message = e.message,
                msg = null;

            switch (message.cmd) {
                case TestRunnerBase.IFRAME_STEP_COMPLETED_CMD:
                    if (testRunner.testIterator.waitedIFrame === Util.getIFrameByWindow(e.source))
                        testRunner.testIterator.iFrameActionCallback();
                    else if (testRunner.executingStepInIFrameWindow === e.source)
                        testRunner._onIFrameStepExecuted();

                    testRunner._clearIFrameExistenceWatcherInterval();
                    break;

                case TestRunnerBase.IFRAME_ERROR_CMD:
                    if (message.err.stepNum === -1) {
                        message.err.stepNum = testRunner.testIterator.getCurrentStepNum();
                        message.err.stepName = testRunner.testIterator.getCurrentStep();
                    }
                    testRunner._clearIFrameExistenceWatcherInterval();
                    testRunner._onError(message.err);
                    break;

                case TestRunnerBase.IFRAME_FAILED_ASSERTION_CMD:
                    if (Settings.PLAYBACK)
                        testRunner.executingStepInIFrameWindow = null;

                    message.err.stepNum = testRunner.testIterator.state.step - 1;
                    testRunner._onAssertionFailed(message.err, true);
                    break;

                case TestRunnerBase.IFRAME_GET_SHARED_DATA_REQUEST_CMD:
                    msg = {
                        cmd: TestRunnerBase.IFRAME_GET_SHARED_DATA_RESPONSE_CMD,
                        sharedData: testRunner.testIterator.getSharedData()
                    };

                    MessageSandbox.sendServiceMsg(msg, e.source);
                    break;

                case TestRunnerBase.IFRAME_SET_SHARED_DATA_CMD:
                    testRunner.testIterator.setSharedData(message.sharedData);
                    break;

                case TestRunnerBase.IFRAME_EXPECT_INACTIVITY_CMD:
                    testRunner._onExpectInactivity({
                        duration: message.duration,
                        callback: function () {
                        }
                    });
                    break;

                case TestRunnerBase.IFRAME_NEXT_STEP_STARTED_CMD:
                    testRunner.executingStepInIFrameWindow = e.source;
                    testRunner._clearFileDownloadingInterval();

                    break;

                case TestRunnerBase.IFRAME_ACTION_TARGET_WAITING_STARTED_CMD:
                    testRunner.actionTargetWaitingStarted = true;
                    break;

                case TestRunnerBase.IFRAME_ACTION_RUN_CMD:
                    testRunner.actionTargetWaitingStarted = false;
                    break;

                case CrossDomainMessages.IFRAME_TEST_RUNNER_WAITING_STEP_COMPLETION_REQUEST_CMD:
                    if (testRunner.testIterator.waitedIFrame === Util.getIFrameByWindow(e.source) ||
                        testRunner.executingStepInIFrameWindow === e.source) {
                        msg = {
                            cmd: CrossDomainMessages.IFRAME_TEST_RUNNER_WAITING_STEP_COMPLETION_RESPONSE_CMD
                        };

                        MessageSandbox.sendServiceMsg(msg, e.source);
                    }
                    break;

                case TestRunnerBase.IFRAME_TAKE_SCREENSHOT_REQUEST_CMD:
                    testRunner._onTakeScreenshot({
                        isFailedStep: message.isFailedStep,
                        callback: function () {
                            msg = {
                                cmd: TestRunnerBase.IFRAME_TAKE_SCREENSHOT_RESPONSE_CMD
                            };

                            MessageSandbox.sendServiceMsg(msg, e.source);
                        }
                    });
                    break;

                case TestRunnerBase.IFRAME_NATIVE_DIALOGS_INFO_CHANGED_CMD:
                    testRunner._onDialogsInfoChanged(message.info);
                    break;

                case TestRunnerBase.IFRAME_BEFORE_UNLOAD_REQUEST_CMD:
                    testRunner._onBeforeUnload(true, function (res) {
                        msg = {
                            cmd: TestRunnerBase.IFRAME_BEFORE_UNLOAD_RESPONSE_CMD,
                            res: res
                        };
                        MessageSandbox.sendServiceMsg(msg, e.source);
                    });
                    break;
            }
        }

        MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);

        //NOTE: for test purposes
        testRunner._destroyIFrameBehavior = function () {
            AutomationIFrameBehavior.destroy();
            MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
        };
    };

    TestRunnerBase.prototype._prepareStepsExecuting = function (callback, skipPageWaiting) {
        function runCallback() {
            CursorWidget.init();
            callback();
        }

        if (skipPageWaiting)
            runCallback();
        else {
            waitPageLoad(function () {
                window.setTimeout(function () {
                    Transport.batchUpdate(function () {
                        jQuerySelectorExtensions.init();

                        ActionBarrier.waitPageInitialization(function () {
                            CursorWidget.init();

                            callback();
                        });
                    });
                }, ANIMATIONS_WAIT_DELAY);
            });
        }
    };

    TestRunnerBase.WAITING_FOR_ACTION_TARGET_MESSAGE = 'Waiting for the target element of the next action to appear';

    TestRunnerBase.prototype.TEST_STARTED_EVENT = 'testStarted';
    TestRunnerBase.prototype.TEST_COMPLETED_EVENT = 'testCompleted';
    TestRunnerBase.prototype.NEXT_STEP_STARTED_EVENT = 'nextStepStarted';
    TestRunnerBase.prototype.ACTION_TARGET_WAITING_STARTED_EVENT = 'actionTargetWaitingStarted';
    TestRunnerBase.prototype.ACTION_RUN_EVENT = 'actionRun';
    TestRunnerBase.prototype.TEST_FAILED_EVENT = 'testFailed';

    TestRunnerBase.SCREENSHOT_CREATING_STARTED_EVENT = 'screenshotCreatingStarted';
    TestRunnerBase.SCREENSHOT_CREATING_FINISHED_EVENT = 'screenshotCreatingFinished';

    TestRunnerBase.IFRAME_STEP_COMPLETED_CMD = 'iframeStepCompleted';
    TestRunnerBase.IFRAME_ERROR_CMD = 'iframeError';
    TestRunnerBase.IFRAME_FAILED_ASSERTION_CMD = 'iframeFailedAssertion';
    TestRunnerBase.IFRAME_GET_SHARED_DATA_REQUEST_CMD = 'getSharedDataRequest';
    TestRunnerBase.IFRAME_GET_SHARED_DATA_RESPONSE_CMD = 'getSharedDataResponse';
    TestRunnerBase.IFRAME_SET_SHARED_DATA_CMD = 'setSharedData';
    TestRunnerBase.IFRAME_EXPECT_INACTIVITY_CMD = 'expectInactivity';
    TestRunnerBase.IFRAME_NEXT_STEP_STARTED_CMD = 'nextStepStarted';
    TestRunnerBase.IFRAME_ACTION_TARGET_WAITING_STARTED_CMD = 'actionTargetWaitingStarted';
    TestRunnerBase.IFRAME_ACTION_RUN_CMD = 'actionRun';
    TestRunnerBase.IFRAME_TAKE_SCREENSHOT_REQUEST_CMD = 'takeScreenshotRequest';
    TestRunnerBase.IFRAME_TAKE_SCREENSHOT_RESPONSE_CMD = 'takeScreenshotResponse';
    TestRunnerBase.IFRAME_NATIVE_DIALOGS_INFO_CHANGED_CMD = 'nativeDialogsInfoChanged';
    TestRunnerBase.IFRAME_BEFORE_UNLOAD_REQUEST_CMD = 'iframeBeforeUnloadRequest';
    TestRunnerBase.IFRAME_BEFORE_UNLOAD_RESPONSE_CMD = 'iframeBeforeUnloadResponse';

    TestRunnerBase.prototype.on = function (event, handler) {
        this.eventEmitter.on(event, handler);
    };

    function pingIFrame(iframe, callback) {
        MessageSandbox.pingIFrame(iframe, CrossDomainMessages.IFRAME_TEST_RUNNER_PING_DISPATCHER_CMD, callback);
    }

    TestRunnerBase.prototype._runInIFrame = function (iframe, stepName, step, stepNum) {
        var testRunner = this;

        this.testIterator.state.inAsyncAction = true;

        var msg = {
            cmd: CrossDomainMessages.IFRAME_TEST_RUNNER_RUN_CMD,
            stepName: stepName,
            step: step.toString(),
            stepNum: stepNum
        };

        this._clearIFrameExistenceWatcherInterval();

        function iframeExistenceWatcher() {
            if (!iframe.parentNode) {
                testRunner._onIFrameStepExecuted();
                testRunner._clearIFrameExistenceWatcherInterval();
            }
        }

        pingIFrame(iframe, function (err) {
            if (err) {
                testRunner._onError({
                    code: SharedErrors.IN_IFRAME_TARGET_LOADING_TIMEOUT,
                    stepName: Settings.CURRENT_TEST_STEP_NAME
                });
            }
            else {
                testRunner.iframeExistenceWatcherInterval = window.setInterval(iframeExistenceWatcher, IFRAME_EXISTENCE_WATCHING_INTERVAL);
                MessageSandbox.sendServiceMsg(msg, iframe.contentWindow);
            }
        });
    };

    TestRunnerBase.prototype._ensureIFrame = function (arg) {
        if (!arg) {
            this._onError({
                code: SharedErrors.API_EMPTY_IFRAME_ARGUMENT,
                stepName: Settings.CURRENT_TEST_STEP_NAME
            });
            return null;
        }

        if (Util.isDomElement(arg)) {
            if (arg.tagName && arg.tagName.toLowerCase() === 'iframe')
                return arg;
            else {
                this._onError({
                    code: SharedErrors.API_IFRAME_ARGUMENT_IS_NOT_IFRAME,
                    stepName: Settings.CURRENT_TEST_STEP_NAME
                });
                return null;
            }
        }

        if (typeof arg === 'string')
            arg = $(arg);

        if (Util.isJQueryObj(arg)) {
            if (arg.length === 0) {
                this._onError({
                    code: SharedErrors.API_EMPTY_IFRAME_ARGUMENT,
                    stepName: Settings.CURRENT_TEST_STEP_NAME
                });
                return null;
            } else if (arg.length > 1) {
                this._onError({
                    code: SharedErrors.API_MULTIPLE_IFRAME_ARGUMENT,
                    stepName: Settings.CURRENT_TEST_STEP_NAME
                });
                return null;
            } else
                return this._ensureIFrame(arg[0]);
        }

        if (typeof arg === 'function')
            return this._ensureIFrame(arg());

        this._onError({
            code: SharedErrors.API_INCORRECT_IFRAME_ARGUMENT,
            stepName: Settings.CURRENT_TEST_STEP_NAME
        });
        return null;
    };

    //API
    TestRunnerBase.prototype._initApi = function () {
        var testRunner = this;

        this.act = ActionsAPI;

        this.ok = function () {
            testRunner.assertionsAPI.ok.apply(testRunner.assertionsAPI, arguments);
        };
        this.notOk = function () {
            testRunner.assertionsAPI.notOk.apply(testRunner.assertionsAPI, arguments);
        };
        this.eq = function () {
            testRunner.assertionsAPI.eq.apply(testRunner.assertionsAPI, arguments);
        };
        this.notEq = function () {
            testRunner.assertionsAPI.notEq.apply(testRunner.assertionsAPI, arguments);
        };
        this.handleAlert = DialogsAPI.handleAlert;
        this.handleConfirm = DialogsAPI.handleConfirm;
        this.handlePrompt = DialogsAPI.handlePrompt;
        this.handleBeforeUnload = DialogsAPI.handleBeforeUnload;
        this.inIFrame = function (iFrameGetter, step) {
            return function () {
                var stepNum = testRunner.testIterator.state.step,
                    iFrame = testRunner._ensureIFrame(iFrameGetter());

                if (iFrame)
                    testRunner._runInIFrame(iFrame, Settings.CURRENT_TEST_STEP_NAME, step, stepNum);
            };
        };
    };

    TestRunnerBase.prototype._initNativeDialogs = function () {
        //NOTE: this method should be synchronous because we should have this info before page scripts are executed
        var testRunner = this;

        if (Settings.NATIVE_DIALOGS_INFO)
            testRunner.listenNativeDialogs = true;

        DialogsAPI.init(Settings.NATIVE_DIALOGS_INFO);

        DialogsAPI.on(DialogsAPI.UNEXPECTED_DIALOG_ERROR_EVENT, function (e) {
            if (testRunner.listenNativeDialogs) {
                testRunner.testIterator.onError({
                    code: SharedErrors.API_UNEXPECTED_DIALOG,
                    stepName: testRunner.testIterator.getCurrentStep(),
                    dialog: e.dialog,
                    message: e.message
                });
            }
        });

        DialogsAPI.on(DialogsAPI.WAS_NOT_EXPECTED_DIALOG_ERROR_EVENT, function (e) {
            if (testRunner.listenNativeDialogs) {
                testRunner.testIterator.onError({
                    code: SharedErrors.API_EXPECTED_DIALOG_DOESNT_APPEAR,
                    stepName: testRunner.testIterator.getCurrentStep(),
                    dialog: e.dialog
                });
            }
        });

        DialogsAPI.on(DialogsAPI.DIALOGS_INFO_CHANGED_EVENT, function (e) {
            testRunner._onDialogsInfoChanged(e.info);
        });
    };
    //Handlers
    TestRunnerBase.prototype._onTestComplete = function (e) {
        this.eventEmitter.emit(this.TEST_COMPLETED_EVENT, {});
        e.callback();
    };

    TestRunnerBase.prototype._onNextStepStarted = function (e) {
        e.callback();
    };

    TestRunnerBase.prototype._onActionTargetWaitingStarted = function (e) {
        this.eventEmitter.emit(this.ACTION_TARGET_WAITING_STARTED_EVENT, e);
    };

    TestRunnerBase.prototype._onActionRun = function () {
        this.eventEmitter.emit(this.ACTION_RUN_EVENT, {});
    };

    TestRunnerBase.prototype._onError = function (err) {
        this.eventEmitter.emit(this.TEST_FAILED_EVENT, {
            stepNum: this.testIterator.state.step - 1,
            err: err
        });
    };

    TestRunnerBase.prototype._onAssertionFailed = function () {
    };

    TestRunnerBase.prototype._onSetStepsSharedData = function (e) {
        e.callback();
    };

    TestRunnerBase.prototype._onGetStepsSharedData = function (e) {
        e.callback();
    };

    TestRunnerBase.prototype._onExpectInactivity = function (e) {
        e.callback();
    };

    TestRunnerBase.prototype._onTakeScreenshot = function (e) {
        if (e && e.callback)
            e.callback();
    };

    TestRunnerBase.prototype._onIFrameStepExecuted = function () {
        this.executingStepInIFrameWindow = null;

        if (this.actionTargetWaitingStarted) {
            this.actionTargetWaitingStarted = false;
            this.testIterator.runLast();
        }
        else
            this.testIterator.runNext();
    };

    TestRunnerBase.prototype._onDialogsInfoChanged = function () {
    };

    TestRunnerBase.prototype.setGlobalWaitFor = function (event, timeout) {
        this.testIterator.setGlobalWaitFor(event, timeout);
    };

    TestRunnerBase.prototype._onBeforeUnload = function (fromIFrame, callback) {
        var testRunner = this;

        //NOTE: we should expect file downloading request only after before unload event (T216625)
        Transport.asyncServiceMsg({cmd: ServiceCommands.UNCHECK_FILE_DOWNLOADING_FLAG}, function () {

            //NOTE: we need check it to determinate file downloading
            testRunner.isFileDownloadingIntervalID = window.setInterval(function () {
                Transport.asyncServiceMsg({cmd: ServiceCommands.GET_AND_UNCHECK_FILE_DOWNLOADING_FLAG}, function (res) {
                    if (res) {
                        window.clearInterval(testRunner.isFileDownloadingIntervalID);
                        testRunner.isFileDownloadingIntervalID = null;

                        if (fromIFrame) {
                            callback(res);
                            return;
                        }

                        if (testRunner.testIterator.state.stepDelayTimeout) {
                            window.clearTimeout(testRunner.testIterator.state.stepDelayTimeout);
                            testRunner.testIterator.state.stepDelayTimeout = null;
                        }

                        testRunner.testIterator.state.pageUnloading = false;
                        testRunner.testIterator._runStep();
                    }
                });
            }, CHECK_FILE_DOWNLOADING_DELAY);
        });
    };

    TestRunnerBase.prototype._clearFileDownloadingInterval = function () {
        if (this.isFileDownloadingIntervalID) {
            window.clearInterval(this.isFileDownloadingIntervalID);
            this.isFileDownloadingIntervalID = null;
        }
    };

    TestRunnerBase.prototype._clearIFrameExistenceWatcherInterval = function () {
        if (this.iframeExistenceWatcherInterval !== -1) {
            window.clearInterval(this.iframeExistenceWatcherInterval);
            this.iframeExistenceWatcherInterval = -1;
        }
    };
});
TestCafeClient.define('Automation.Click.Playback', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        async = Hammerhead.async,
        Settings = require('Settings'),
        Util = Hammerhead.Util,
        NativeMethods = Hammerhead.NativeMethods,
        EventSandbox = Hammerhead.EventSandbox,
        EventSimulator = Hammerhead.EventSimulator,
        SharedErrors = require('Shared.Errors'),
        AutomationUtil = require('Automation.Util'),
        AutomationSettings = require('Automation.Settings'),
        CursorWidget = require('UI.Cursor'),

        SelectElementUi = require('UI.SelectElement'),
        MovePlaybackAutomation = require('Automation.Move.Playback');

    function clickOnSelectChildElement(childElement, clickOptions, actionCallback, errorCallback) {
        var isClickOnOption = childElement.tagName.toLowerCase() === 'option',
            select = Util.getSelectParent($(childElement));

        if (!select) {
            EventSimulator.click(childElement, clickOptions);
            actionCallback();
            return;
        }

        var $select = $(select),
            selectedIndex = $select[0].selectedIndex,
            isOptionListExpanded = SelectElementUi.isOptionListExpanded($select),
            childIndex = Util.getChildIndex($select, childElement),
            targetElement = null;

        if (!isOptionListExpanded) {
            var selectSizeValue = Util.getSelectElementSize($select);

            if ((!Settings.RECORDING || Settings.PLAYBACK) && selectSizeValue <= 1) {
                errorCallback({
                    code: SharedErrors.API_INVISIBLE_ACTION_ELEMENT,
                    element: Util.getElementDescription(childElement)
                });
                return;
            }

            targetElement = childElement;
        }
        else
            targetElement = SelectElementUi.getEmulatedChildElement(childIndex, !isClickOnOption);

        async.series({
                moveCursorToElement: function (callback) {
                    //NOTE: 'target' is option from emulated optionList or the point (x,y-coordinates) of real option element
                    var target = null;

                    if (isOptionListExpanded)
                        target = targetElement;
                    else {
                        SelectElementUi.scrollOptionListByChild(childElement);
                        target = SelectElementUi.getSelectChildCenter(childElement);
                    }

                    MovePlaybackAutomation.run(target, false, {}, function () {
                        window.setTimeout(callback, AutomationSettings.ACTION_STEP_DELAY);
                    });
                },

                click: function () {
                    var clickLeadChanges = isClickOnOption && !targetElement.disabled;

                    if (Util.getSelectElementSize($select) > 1) {
                        if (Util.isMozilla) {
                            EventSimulator.mousedown(targetElement, clickOptions);

                            if (clickLeadChanges)
                                $select[0].selectedIndex = childIndex;

                            EventSandbox.focus($select[0], function () {
                                window.setTimeout(function () {
                                    EventSimulator.mouseup(targetElement, clickOptions);

                                    if (isClickOnOption && $(childElement).index() !== selectedIndex)
                                        EventSimulator.change($select[0]);

                                    EventSimulator.click(targetElement, clickOptions);
                                    actionCallback();
                                }, Util.hasTouchEvents ? 0 : AutomationSettings.CLICK_STEP_DELAY);
                            }, false, true);
                        }
                        else if (Util.isIE) {
                            EventSimulator.mousedown($select[0], clickOptions);

                            EventSandbox.focus($select[0], function () {
                                window.setTimeout(function () {
                                    EventSimulator.mouseup($select[0], clickOptions);

                                    if (clickLeadChanges)
                                        $select[0].selectedIndex = childIndex;

                                    if (isClickOnOption && $(childElement).index() !== selectedIndex)
                                        EventSimulator.change($select[0]);

                                    EventSimulator.click($select[0], clickOptions);
                                    actionCallback();
                                }, Util.hasTouchEvents ? 0 : AutomationSettings.CLICK_STEP_DELAY);
                            }, false, true);
                        }
                        else {
                            //NOTE: after mousedown in Chrome document.activeElement = select.
                            //But we need to raise blur and change event for previous active element during focus raising.
                            //That's why we should change event order and raise focus before mousedown.
                            EventSandbox.focus($select[0], function () {
                                window.setTimeout(function () {
                                    EventSimulator.mousedown(targetElement, clickOptions);

                                    if (clickLeadChanges)
                                        $select[0].selectedIndex = childIndex;

                                    EventSimulator.mouseup(targetElement, clickOptions);

                                    EventSimulator.click(targetElement, clickOptions);
                                    actionCallback();
                                }, Util.hasTouchEvents ? 0 : AutomationSettings.CLICK_STEP_DELAY);
                            }, false, true);
                        }
                    }
                    else {
                        EventSimulator.click(targetElement, clickOptions);
                        actionCallback();

                    }
                }
            }
        );
    }

    exports.run = function (el, options, runCallback, errorCallback) {
        options = {
            ctrl: options.ctrl,
            alt: options.alt,
            shift: options.shift,
            meta: options.meta,
            offsetX: options.offsetX,
            offsetY: options.offsetY,
            caretPos: options.caretPos
        };

        if (el.tagName.toLowerCase() === 'option' || el.tagName.toLowerCase() === 'optgroup') {
            clickOnSelectChildElement(el, options, runCallback, errorCallback);

            return;
        }

        var isSvgElement = Util.isSvgElement(el),
            screenPoint = null,
            eventPoint = null,
            eventOptions = null,
            target = Util.isContainOffset(el, options.offsetX, options.offsetY) ?
                el : AutomationUtil.getMouseActionPoint(el, options, false),
            notPrevented = true,
            topElement = null,
            isInvisibleElement = false,
            currentTopElement = null,
            skipClickSimulation = false;

        if (options.offsetX)
            options.offsetX = Math.round(options.offsetX);
        if (options.offsetY)
            options.offsetY = Math.round(options.offsetY);

        async.series({
            moveCursorToElement: function (callback) {
                if (Settings.RECORDING && !Settings.PLAYBACK && !Util.isElementVisible(el)) {
                    topElement = el;

                    window.setTimeout(callback, AutomationSettings.ACTION_STEP_DELAY);
                    return;
                }

                MovePlaybackAutomation.run(target, false, options, function () {
                    if ((isSvgElement && Util.isOpera) || ($(el).is('tref')))
                        topElement = el; //NOTE: document.elementFromPoint can't find this element
                    else {
                        screenPoint = AutomationUtil.getMouseActionPoint(el, options, true);
                        eventPoint = AutomationUtil.getEventOptionCoordinates(el, screenPoint);

                        eventOptions = $.extend({
                            clientX: eventPoint.x,
                            clientY: eventPoint.y
                        }, options);

                        topElement = AutomationUtil.getElementUnderCursor(screenPoint.x, screenPoint.y, null, target);

                        if (!topElement) {
                            isInvisibleElement = true;
                            topElement = el;
                        }
                    }
                    window.setTimeout(callback, AutomationSettings.ACTION_STEP_DELAY);
                });
            },

            //NOTE: touch devices only
            touchstart: function (callback) {
                if (Util.hasTouchEvents)
                    EventSimulator.touchstart(topElement, eventOptions);
                callback();
            },

            //NOTE: touch devices only
            cursorTouchMouseDown: function (callback) {
                if (Util.hasTouchEvents)
                    CursorWidget.lMouseDown(callback);
                else
                    callback();
            },

            //NOTE: touch devices only
            touchend: function (callback) {
                if (Util.hasTouchEvents) {
                    EventSimulator.touchend(topElement, eventOptions);

                    window.setTimeout(callback, AutomationSettings.ACTION_STEP_DELAY);
                }
                else
                    callback();
            },

            cursorMouseDown: function (callback) {
                if (!Util.hasTouchEvents)
                    CursorWidget.lMouseDown(callback);
                else
                    callback();
            },

            mousedown: function (callback) {
                //NOTE: in webkit and ie raising mousedown event opens select element's dropdown,
                // therefore we should handle it and hide the dropdown (B236416)
                var needHandleMousedown = (Util.isWebKit || Util.isIE) && Util.isSelectElement(el),
                    wasPrevented = null,
                    blurRaised = false,
                    activeElement = Util.getActiveElement(),
                //in IE focus is not raised if element was focused before click, even if focus is lost during mousedown
                    needFocus = !(Util.isIE && activeElement === topElement),
                    mouseDownCallback = function () {
                        window.setTimeout(callback, AutomationSettings.ACTION_STEP_DELAY);
                    };

                if (needHandleMousedown) {
                    var onmousedown = function (e) {
                        wasPrevented = e.defaultPrevented;
                        Util.preventDefault(e);
                        NativeMethods.removeEventListener.call(el, 'mousedown', onmousedown, false);
                    };

                    NativeMethods.addEventListener.call(el, 'mousedown', onmousedown, false);
                }

                var onblur = function () {
                    blurRaised = true;
                    NativeMethods.removeEventListener.call(activeElement, 'blur', onblur, true);
                };
                NativeMethods.addEventListener.call(activeElement, 'blur', onblur, true);

                notPrevented = EventSimulator.mousedown(topElement, eventOptions);

                if (!isInvisibleElement && screenPoint) {
                    currentTopElement = AutomationUtil.getElementUnderCursor(screenPoint.x, screenPoint.y, null, target);

                    if (currentTopElement && currentTopElement !== topElement) {
                        skipClickSimulation = true;
                        topElement = currentTopElement;
                    }
                }

                //In some cases (B239273, B253520) mousedown may lead to active element changing. Browsers raise blur in this cases.
                //We simulate blur event if active element was changed after mousedown and blur event was not raised automatically
                if (Util.getActiveElement() !== activeElement && !blurRaised)
                    if (Util.isIE)
                    //All ways to blur element from client script raise blur event asynchronously in IE
                        window.setTimeout(function () {
                            if (!blurRaised)
                                EventSimulator.blur(activeElement);
                        }, 0);
                    else
                        EventSimulator.blur(activeElement);

                if (notPrevented === false) {
                    if (needHandleMousedown && !wasPrevented)
                        notPrevented = true;
                    else {
                        mouseDownCallback();
                        return;
                    }
                }

                //NOTE: For contentEditable elements we should call focus directly for action's element because
                //option 'caretPos' is indicated for this element and topElement may be a child of this element
                AutomationUtil.focusAndSetSelection(Util.isContentEditableElement(el) ? el : topElement, options, needFocus, mouseDownCallback);
            },

            cursorMouseUp: function (callback) {
                CursorWidget.mouseUp(callback);
            },

            mouseup: function (callback) {
                EventSimulator.mouseup(topElement, eventOptions);

                if (!isInvisibleElement && screenPoint)
                    currentTopElement = AutomationUtil.getElementUnderCursor(screenPoint.x, screenPoint.y, null, target);

                window.setTimeout(callback, AutomationSettings.ACTION_STEP_DELAY);
            },

            click: function () {
                var $el = $(topElement);

                if ((!Settings.RECORDING || Settings.PLAYBACK) && topElement.tagName.toLowerCase() === 'option') {
                    runCallback();
                    return;
                }

                if (topElement.tagName.toLowerCase() === 'option') {
                    var select = Util.getSelectParent($el),
                        $select = $(select);

                    if (select && (($.browser.webkit && Util.getSelectElementSize($select) <= 1) || (Util.isIE && Util.getSelectElementSize($select) > 1)))
                        EventSimulator.click($select[0], eventOptions);
                    else
                        EventSimulator.click($el[0], eventOptions);

                    if (select)
                        EventSimulator.change($select[0]);

                    runCallback();
                    return;
                }

                //NOTE: If the element under the cursor has changed after 'mousedown' event then we should not raise 'click' event
                if (!skipClickSimulation)
                    EventSimulator.click(topElement, eventOptions);

                AutomationUtil.focusInputByLabel(topElement);

                //NOTE: emulating click event on 'select' element doesn't expand dropdown with options (except chrome),
                // therefore we should emulate it.
                if ((!Settings.RECORDING || Settings.PLAYBACK) && Util.isSelectElement(topElement) && Util.getSelectElementSize($(topElement)) === 1 && notPrevented !== false) {
                    //if this select already have options list
                    if (SelectElementUi.isOptionListExpanded($el))
                        SelectElementUi.collapseOptionList();
                    else
                        SelectElementUi.expandOptionList(topElement);
                }

                runCallback();
            }
        });
    };
});

TestCafeClient.define('Automation.DblClick.Playback', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,

        SelectElementUi = require('UI.SelectElement'),
        async = Hammerhead.async,
        EventSimulator = Hammerhead.EventSimulator,
        NativeMethods = Hammerhead.NativeMethods,
        Settings = require('Settings'),
        CursorWidget = require('UI.Cursor'),
        AutomationUtil = require('Automation.Util'),
        AutomationSettings = require('Automation.Settings'),
        ClickPlaybackAutomation = require('Automation.Click.Playback');

    exports.run = function (el, options, actionCallback) {
        options = {
            ctrl: options.ctrl,
            alt: options.alt,
            shift: options.shift,
            meta: options.meta,
            offsetX: options.offsetX,
            offsetY: options.offsetY,
            caretPos: options.caretPos
        };

        var curElement = null,
            point = null,
            currentTopElement = null,
            skipClickSimulation = false;

        if (!Util.isContainOffset(el, options.offsetX, options.offsetY)) {
            point = AutomationUtil.getMouseActionPoint(el, options, true);
            curElement = CursorWidget.getElementUnderCursor(point.x, point.y);
        }

        if (!curElement)
            curElement = el;

        var isInvisibleElement = (Settings.RECORDING && !Settings.PLAYBACK) && !Util.isElementVisible(el),
            screenPoint = AutomationUtil.getMouseActionPoint(el, options, true),
            eventPoint = AutomationUtil.getEventOptionCoordinates(el, screenPoint),
            eventOptions = $.extend({
                clientX: eventPoint.x,
                clientY: eventPoint.y
            }, options);

        async.series({
            firstClick: function (callback) {
                ClickPlaybackAutomation.run(el, options, function () {
                    if (!isInvisibleElement) {
                        currentTopElement = AutomationUtil.getElementUnderCursor(screenPoint.x, screenPoint.y, null, el);
                        if (currentTopElement && currentTopElement !== curElement)
                            curElement = currentTopElement;
                    }
                    window.setTimeout(callback, AutomationSettings.CLICK_STEP_DELAY);
                });
            },

            secondClick: function (callback) {
                var notPrevented = true;
                async.series({
                    //NOTE: touch devices only
                    touchstart: function (callback) {
                        if (Util.hasTouchEvents)
                            EventSimulator.touchstart(curElement, eventOptions);
                        callback();
                    },

                    //NOTE: touch devices only
                    cursorTouchMouseDown: function (callback) {
                        if (Util.hasTouchEvents)
                            CursorWidget.lMouseDown(callback);
                        else
                            callback();
                    },

                    //NOTE: touch devices only
                    touchend: function (callback) {
                        if (Util.hasTouchEvents) {
                            EventSimulator.touchend(curElement, eventOptions);

                            window.setTimeout(callback, AutomationSettings.ACTION_STEP_DELAY);
                        }
                        else
                            callback();
                    },

                    cursorMouseDown: function (callback) {
                        if (!Util.hasTouchEvents)
                            CursorWidget.lMouseDown(callback);
                        else
                            callback();
                    },

                    mousedown: function (callback) {
                        //NOTE: in webkit and ie raising mousedown event opens select element's dropdown,
                        // therefore we should handle it and hide the dropdown (B236416)
                        var needHandleMousedown = (Util.isWebKit || Util.isIE) && Util.isSelectElement(curElement),
                            wasPrevented = null,
                            activeElement = Util.getActiveElement(),
                        //in IE focus is not raised if element was focused before click, even if focus is lost during mousedown
                            needFocus = !(Util.isIE && activeElement === curElement);

                        if (needHandleMousedown) {
                            var onmousedown = function (e) {
                                wasPrevented = e.defaultPrevented;
                                Util.preventDefault(e);
                                NativeMethods.removeEventListener.call(curElement, 'mousedown', onmousedown, false);
                            };

                            NativeMethods.addEventListener.call(curElement, 'mousedown', onmousedown, false);
                        }

                        notPrevented = EventSimulator.mousedown(curElement, eventOptions);

                        if (!isInvisibleElement) {
                            currentTopElement = AutomationUtil.getElementUnderCursor(screenPoint.x, screenPoint.y, null, el);

                            if (currentTopElement && currentTopElement !== curElement) {
                                skipClickSimulation = true;
                                curElement = currentTopElement;
                            }
                        }

                        if (notPrevented === false) {
                            if (needHandleMousedown && !wasPrevented)
                                notPrevented = true;
                            else {
                                callback();
                                return;
                            }
                        }

                        //NOTE: we should not call it after the second click because of the native browser behavior
                        if (!Util.isIE) {
                            //NOTE: For contentEditable elements we should call focus directly for action's element because
                            //option 'caretPos' is indicated for this element and topElement may be a child of this element
                            AutomationUtil.focusAndSetSelection(Util.isContentEditableElement(el) ? el : curElement, options, needFocus, callback);
                        }
                        else
                            callback();
                    },

                    cursorMouseUp: function (callback) {
                        CursorWidget.mouseUp(callback);
                    },

                    mouseup: function (callback) {
                        EventSimulator.mouseup(curElement, eventOptions);
                        callback();
                    },

                    click: function () {
                        if (curElement.tagName.toLowerCase() === 'option')
                            callback();
                        else {
                            //NOTE: If the element under the cursor has changed after 'mousedown' event then we should not raise 'click' event
                            if (!skipClickSimulation)
                                EventSimulator.click(curElement, eventOptions);

                            //NOTE: emulating click event on 'select' element doesn't expand dropdown with options (except chrome),
                            // therefore we should emulate it.
                            if ((!Settings.RECORDING || Settings.PLAYBACK) && Util.isSelectElement(curElement) && Util.getSelectElementSize($(curElement)) === 1 && notPrevented !== false) {
                                //if this select already have options list
                                if (SelectElementUi.isOptionListExpanded($(curElement)))
                                    SelectElementUi.collapseOptionList();
                                else
                                    SelectElementUi.expandOptionList(curElement);
                            }
                            callback();
                        }
                    }
                });
            },

            dblclick: function () {
                //NOTE: If the element under the cursor has changed after 'mousedown' event then we should not raise 'dblclick' event
                if (!skipClickSimulation)
                    EventSimulator.dblclick(curElement, eventOptions);
                actionCallback();
            }
        });


        /*exports.runToFinalize(el, options, function (currentElement, runToFinalizeOptions) {
         //NOTE: For contentEditable elements we should call finalize directly for action's element because
         //option 'caretPos' is indicated for this element and topElement may be a child of this element
         finalize(Util.isContentEditableElement(el) ? el : currentElement, options, actionCallback, runToFinalizeOptions);
         });*/
    };
});

TestCafeClient.define('Automation.Drag.Playback', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        async = Hammerhead.async,
        Util = Hammerhead.Util,
        EventSandbox = Hammerhead.EventSandbox,
        EventSimulator = Hammerhead.EventSimulator,
        Settings = require('Settings'),
        AutomationUtil = require('Automation.Util'),
        AutomationSettings = require('Automation.Settings'),
        CursorWidget = require('UI.Cursor'),
        ContentEditableHelper = Hammerhead.ContentEditableHelper,

        MovePlaybackAutomation = require('Automation.Move.Playback');

    exports.run = function (el, to, options, runCallback) {
        var target = Util.isContainOffset(el, options.offsetX, options.offsetY) ?
                el : AutomationUtil.getMouseActionPoint(el, options, false),

            screenPointFrom = null,
            eventPointFrom = null,
            eventOptionsStart = null,
            topElement = null,
            skipDragEmulation = Settings.RECORDING && !Settings.PLAYBACK && !Util.isElementVisible(el),
            oldOffset = null,
            currentDocument = Util.findDocument(el),
            pointTo = null,
            startPosition = null,
            screenPointTo = null,
            eventPointTo = null,
            eventOptionsEnd = null;

        if (options.offsetX)
            options.offsetX = Math.round(options.offsetX);
        if (options.offsetY)
            options.offsetY = Math.round(options.offsetY);

        if (skipDragEmulation) {
            runCallback(el);
            return;
        }

        async.series({
            moveCursorToElement: function (callback) {
                MovePlaybackAutomation.run(target, false, options, function () {
                    startPosition = AutomationUtil.getMouseActionPoint(el, options, false);
                    screenPointFrom = Util.offsetToClientCoords(startPosition);
                    eventPointFrom = AutomationUtil.getEventOptionCoordinates(el, screenPointFrom);

                    eventOptionsStart = $.extend({
                        clientX: eventPointFrom.x,
                        clientY: eventPointFrom.y
                    }, options);

                    if (Util.isDomElement(to))
                        pointTo = Util.findCenter(to);
                    else
                        pointTo = AutomationUtil.getDragEndPoint(startPosition, to, currentDocument);

                    topElement = CursorWidget.getElementUnderCursor(screenPointFrom.x, screenPointFrom.y);

                    if (!topElement) {
                        runCallback(el);
                        return;
                    }

                    window.setTimeout(callback, AutomationSettings.DRAG_ACTION_STEP_DELAY);
                });
            },

            cursorMouseDown: function (callback) {
                CursorWidget.lMouseDown(callback);
            },

            take: function (callback) {
                if (Util.hasTouchEvents)
                    EventSimulator.touchstart(topElement, eventOptionsStart);
                else
                    EventSimulator.mousedown(topElement, eventOptionsStart);

                //NOTE: For contentEditable elements we should call focus directly for action's element
                EventSandbox.focus(Util.isContentEditableElement(el) ? ContentEditableHelper.findContentEditableParent(el) : topElement, function () {
                    window.setTimeout(callback, AutomationSettings.DRAG_ACTION_STEP_DELAY);
                }, false, true);
            },

            drag: function (callback) {
                oldOffset = {
                    x: options.offsetX,
                    y: options.offsetY
                };

                delete options.offsetX;
                delete options.offsetY;

                MovePlaybackAutomation.run(Util.isDomElement(to) ? to : pointTo, true, options, function () {
                    options.offsetX = oldOffset.x;
                    options.offsetY = oldOffset.y;

                    window.setTimeout(callback, AutomationSettings.DRAG_ACTION_STEP_DELAY);
                }, currentDocument);
            },


            cursorMouseUp: function (callback) {
                if (pointTo)
                    screenPointTo = Util.offsetToClientCoords(pointTo);
                else {
                    var offsetPos = Util.getOffsetPosition(el);

                    screenPointTo = Util.offsetToClientCoords({
                        x: offsetPos.left,
                        y: offsetPos.top
                    });
                }

                eventPointTo = AutomationUtil.getEventOptionCoordinates(el, screenPointTo);

                if (Util.isElementInIframe(el)) {
                    var currentIFrame = Util.getIFrameByElement(el);
                    if (currentIFrame) {
                        var screenPointToInIFrame = {
                            x: screenPointTo.x - $(currentIFrame.contentWindow).scrollLeft(),
                            y: screenPointTo.y - $(currentIFrame.contentWindow).scrollTop()
                        };

                        topElement = CursorWidget.getElementUnderCursor(screenPointToInIFrame.x, screenPointToInIFrame.y);
                    }
                }
                else
                    topElement = CursorWidget.getElementUnderCursor(screenPointTo.x, screenPointTo.y);

                if (!topElement) {
                    runCallback();
                    return;
                }

                eventOptionsEnd = $.extend({
                    clientX: eventPointTo.x,
                    clientY: eventPointTo.y
                }, options);

                CursorWidget.mouseUp(callback);
            },

            mouseUp: function (callback) {
                if (Util.hasTouchEvents)
                    EventSimulator.touchend(topElement, eventOptionsEnd);
                else
                    EventSimulator.mouseup(topElement, eventOptionsEnd);

                callback();
            },

            click: function () {
                //B231323
                if (CursorWidget.getElementUnderCursor(screenPointTo.x, screenPointTo.y) === topElement)
                    EventSimulator.click(topElement, eventOptionsEnd);

                runCallback();
            }
        });
    };
});

TestCafeClient.define('Automation.Hover.Playback', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        Util = Hammerhead.Util,
        Settings = require('Settings'),

        AutomationSettings = require('Automation.Settings'),
        MovePlaybackAutomation = require('Automation.Move.Playback');

    exports.run = function (element, options, callback) {
        if (Settings.RECORDING && !Settings.PLAYBACK && !Util.isElementVisible(element)) {
            window.setTimeout(callback, AutomationSettings.ACTION_STEP_DELAY);
            return;
        }

        if (options.offsetX)
            options.offsetX = Math.round(options.offsetX);
        if (options.offsetY)
            options.offsetY = Math.round(options.offsetY);

        MovePlaybackAutomation.run(element, false, options, callback);
    };
});

TestCafeClient.define('Automation.Press.KeyPressSimulator', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        async = Hammerhead.async,
        Util = Hammerhead.Util,
        NativeMethods = Hammerhead.NativeMethods,
        EventSandbox = Hammerhead.EventSandbox,
        EventSimulator = Hammerhead.EventSimulator,
        TextSelection = Hammerhead.TextSelection,
        TypeCharPlaybackAutomation = require('Automation.TypeChar.Playback');

    //consts
    var KEY_PRESS_DELAY = 80;

    //utils
    var keyHelper = function (key) {
        var isChar = key.length === 1 || key === 'space',
            sanitizedKey = isChar ? key : key.toLowerCase(),
            beforeKeydownActiveElement = null,
            beforeKeypressActiveElement = null;

        if (Util.KEYS_MAPS.MODIFIERS_MAP[sanitizedKey])
            sanitizedKey = Util.KEYS_MAPS.MODIFIERS_MAP[sanitizedKey];

        var keyCode = null,
            modifierKeyCode = Util.KEYS_MAPS.MODIFIERS[sanitizedKey],
            specialKeyCode = Util.KEYS_MAPS.SPECIAL_KEYS[sanitizedKey];

        if (isChar && key !== 'space')
            keyCode = Util.getKeyCodeByChar(sanitizedKey);
        else if (modifierKeyCode)
            keyCode = modifierKeyCode;
        else if (specialKeyCode)
            keyCode = specialKeyCode;

        return {
            down: function (modifiersState) {
                var activeElement = Util.getActiveElement();
                beforeKeydownActiveElement = activeElement;

                if (modifierKeyCode)
                    modifiersState[sanitizedKey] = true;
                return EventSimulator.keydown(activeElement, $.extend({ keyCode: keyCode }, modifiersState));
            },

            press: function (modifiersState) {
                var activeElement = Util.getActiveElement();

                if (!(isChar || specialKeyCode))
                    return true;

                function getChar(key) {
                    if (key === 'space')
                        return ' ';

                    if (modifiersState.shift) {
                        if (Util.isLetter(key))
                            return Util.changeLetterCase(key);

                        if (Util.KEYS_MAPS.REVERSED_SHIFT_MAP[key])
                            return Util.KEYS_MAPS.REVERSED_SHIFT_MAP[key];
                    }
                    return key;
                }

                var character = isChar ? getChar(sanitizedKey) : null,
                    charCode = specialKeyCode || character.charCodeAt(0);

                if (Util.isWebKit && activeElement !== beforeKeydownActiveElement && Util.isElementInIframe(activeElement) !== Util.isElementInIframe(beforeKeydownActiveElement))
                    return true;

                beforeKeypressActiveElement = activeElement;
                var raiseDefault = EventSimulator.keypress(
                    activeElement,
                    $.extend({ keyCode: charCode, charCode: charCode }, modifiersState)
                );

                activeElement = Util.getActiveElement();

                var caretPos = Util.isInputWithoutSelectionPropertiesInMozilla(activeElement) ? activeElement.value.length : null;

                if (raiseDefault) {
                    if (character && !(modifiersState.ctrl || modifiersState.alt)) {
                        //T210448 - Unnecessary typing occurs if element was changed after keydown/keypress event
                        try {
                            if (beforeKeypressActiveElement === activeElement ||
                                (!(Util.isMozilla && !Util.isEditableElement(beforeKeypressActiveElement)) && !(Util.isWebKit && Util.isElementInIframe(activeElement) !== Util.isElementInIframe(beforeKeypressActiveElement) && !Util.isEditableElement(beforeKeypressActiveElement)))) {
                                var elementForTyping = activeElement;

                                if (!Util.isIE && activeElement !== beforeKeypressActiveElement && Util.isEditableElement(beforeKeypressActiveElement) && Util.isEditableElement(activeElement))
                                    elementForTyping = beforeKeypressActiveElement;

                                TypeCharPlaybackAutomation.run(elementForTyping, character, caretPos);
                            }
                        }
                        catch (err) {
                        }
                    }

                    if (sanitizedKey === 'enter' && activeElement.tagName &&
                        activeElement.tagName.toLowerCase() === 'input' && /button|submit|reset/.test(activeElement.type)) {
                        activeElement.click();
                    }
                }

                return raiseDefault;
            },

            up: function (modifiersState) {
                if (modifierKeyCode)
                    modifiersState[sanitizedKey] = false;

                var raiseDefault = EventSimulator.keyup(Util.getActiveElement(), $.extend({ keyCode: keyCode }, modifiersState)),

                    activeElement = Util.getActiveElement();

                if (raiseDefault && sanitizedKey === 'space' && activeElement.tagName &&
                    activeElement.tagName.toLowerCase() === 'input' && /button|submit|reset|radio|checkbox/.test(activeElement.type)) {
                    activeElement.click();
                }

                return raiseDefault;
            },

            getKey: function () {
                return sanitizedKey;
            }
        };
    };

    function getLineIndentInTextarea(textarea) {
        var textareaValue = textarea.value,
            inverseSelection = TextSelection.hasInverseSelection(textarea),
            cursorPosition = inverseSelection ?
                TextSelection.getSelectionStart(textarea) :
                TextSelection.getSelectionEnd(textarea);

        if (!textareaValue || !cursorPosition)
            return 0;

        return Util.getTextareaIndentInLine(textarea, cursorPosition);
    }

    //api
    var supportedShortcutHandlers = (function () {
        //utils
        var curTextareaElement = null,
            curTextareaCursorIndent = null;

        function onTextAreaBlur() {
            curTextareaElement = null;
            curTextareaCursorIndent = null;
            NativeMethods.removeEventListener.call(this, 'blur', onTextAreaBlur, true);
        }

        function updateTextAreaIndent(element) {
            if (element.tagName.toLowerCase() === 'textarea') {
                if (curTextareaElement !== element) {
                    NativeMethods.addEventListener.call(element, 'blur', onTextAreaBlur, true);
                    curTextareaElement = element;
                }

                curTextareaCursorIndent = getLineIndentInTextarea(element);
            }
        }

        function moveTextAreaCursorUp(element, withSelection) {
            var textareaValue = element.value;

            if (textareaValue) {
                var hasInverseSelection = TextSelection.hasInverseSelection(element),
                    start = TextSelection.getSelectionStart(element),
                    end = TextSelection.getSelectionEnd(element),
                    partBeforeSelection = textareaValue.substring(0, hasInverseSelection ? start : end),
                    topIndex = partBeforeSelection.lastIndexOf('\n'),
                    top = partBeforeSelection.substring(0, topIndex);

                if (curTextareaCursorIndent === null || curTextareaElement !== element)
                    updateTextAreaIndent(element);

                var newPosition = Math.min(top.lastIndexOf('\n') + 1 + curTextareaCursorIndent, top.length);

                moveTextAreaCursor(element, start, end, hasInverseSelection, newPosition, withSelection);
            }
        }

        function moveTextAreaCursorDown(element, withSelection) {
            var textareaValue = element.value;

            if (textareaValue) {
                var hasInverseSelection = TextSelection.hasInverseSelection(element),
                    start = TextSelection.getSelectionStart(element),
                    end = TextSelection.getSelectionEnd(element),
                    last = textareaValue.substring(hasInverseSelection ? start : end),
                    nextIndex = last.indexOf('\n') === -1 ? last.length : last.indexOf('\n') + 1,
                    bottom = last.substring(nextIndex),
                    newPosition = (hasInverseSelection ? start : end) + nextIndex,
                    maxIndent = bottom.indexOf('\n') === -1 ? bottom.length : bottom.indexOf('\n');

                if (curTextareaCursorIndent === null || curTextareaElement !== element)
                    updateTextAreaIndent(element);

                if (curTextareaCursorIndent >= maxIndent)
                    newPosition += maxIndent;
                else
                    newPosition += curTextareaCursorIndent;

                moveTextAreaCursor(element, start, end, hasInverseSelection, newPosition, withSelection);
            }
        }

        function moveTextAreaCursor(element, start, end, hasInverseSelection, newPosition, withSelection) {
            var newStart = null,
                newEnd = null,
                inverse = null;

            if (withSelection) {
                if (start === end) {
                    if (newPosition < start) {
                        newStart = newPosition;
                        newEnd = start;
                        inverse = true;
                    }
                    else {
                        newStart = start;
                        newEnd = newPosition;
                    }
                }
                else {
                    if (!hasInverseSelection) {
                        if (newPosition < start) {
                            newStart = newPosition;
                            newEnd = start;
                            inverse = true;
                        }
                        else {
                            newStart = start;
                            newEnd = newPosition;
                        }
                    }
                    else {
                        if (newPosition > end) {
                            newStart = end;
                            newEnd = newPosition;
                        }
                        else {
                            newStart = newPosition;
                            newEnd = end;
                            inverse = true;
                        }
                    }
                }
            }
            else
                newEnd = newStart = newPosition;

            TextSelection.select(element, newStart, newEnd, inverse);
        }

        function setElementValue(element, value) {
            element.value = value;
            EventSimulator.input(element);
        }

        //shortcuts
        function selectAll(element, callback) {
            if (Util.isEditableElement(element))
                TextSelection.select(element);

            callback();
        }

        function backspace(element, callback) {
            if (Util.isTextEditableElementAndEditingAllowed(element)) {
                var startSelection = TextSelection.getSelectionStart(element),
                    endSelection = TextSelection.getSelectionEnd(element),

                    value = element.value.replace(/\r\n/g, '\n');


                if (endSelection === startSelection) {
                    if (startSelection > 0) {
                        setElementValue(element, value.substring(0, startSelection - 1) + value.substring(endSelection, value.length));
                        TextSelection.select(element, startSelection - 1, startSelection - 1);
                    }
                }
                else {
                    setElementValue(element, value.substring(0, startSelection) + value.substring(endSelection, value.length));
                    TextSelection.select(element, startSelection, startSelection);
                }
            }
            else if (Util.isContentEditableElement(element))
                TextSelection.deleteSelectionContents(element);

            callback();
        }

        function del(element, callback) {
            if (Util.isTextEditableElementAndEditingAllowed(element)) {
                var startSelection = TextSelection.getSelectionStart(element),
                    endSelection = TextSelection.getSelectionEnd(element),

                    value = element.value.replace(/\r\n/g, '\n');

                if (endSelection === startSelection) {
                    if (startSelection < value.length) {
                        setElementValue(element, value.substring(0, startSelection) + value.substring(endSelection + 1, value.length));
                        TextSelection.select(element, startSelection, startSelection);
                    }
                }
                else {
                    setElementValue(element, value.substring(0, startSelection) + value.substring(endSelection, value.length));
                    TextSelection.select(element, startSelection, startSelection);
                }
            }
            else if (Util.isContentEditableElement(element))
                TextSelection.deleteSelectionContents(element);

            callback();
        }

        function left(element, callback) {
            var startSelection = null,
                endSelection = null;

            if (Util.isTextEditableElement(element)) {
                startSelection = TextSelection.getSelectionStart(element);
                endSelection = TextSelection.getSelectionEnd(element);

                var newPosition = startSelection ?
                    startSelection === endSelection ? startSelection - 1 : startSelection :
                    0;

                TextSelection.select(element, newPosition, newPosition);
                updateTextAreaIndent(element);
            }
            else if (Util.isContentEditableElement(element)) {
                startSelection = TextSelection.getSelectionStart(element);
                endSelection = TextSelection.getSelectionEnd(element);

                //NOTE: we only remove selection
                if (startSelection !== endSelection) {
                    var selection = TextSelection.getSelectionByElement(element),
                        inverseSelection = TextSelection.hasInverseSelectionContentEditable(element),
                        startNode = inverseSelection ? selection.focusNode : selection.anchorNode,
                        startOffset = inverseSelection ? selection.focusOffset : selection.anchorOffset;

                    TextSelection.selectByNodesAndOffsets(startNode, startOffset, startNode, startOffset, true, false);
                }
            }

            callback();
        }

        function right(element, callback) {
            var startSelection = null,
                endSelection = null;

            if (Util.isTextEditableElement(element)) {
                startSelection = TextSelection.getSelectionStart(element);
                endSelection = TextSelection.getSelectionEnd(element);

                var newPosition = startSelection === element.value.length ?
                    startSelection :
                    startSelection === endSelection ? startSelection + 1 : endSelection;

                TextSelection.select(element, newPosition, newPosition);
                updateTextAreaIndent(element);
            }
            else if (Util.isContentEditableElement(element)) {
                startSelection = TextSelection.getSelectionStart(element);
                endSelection = TextSelection.getSelectionEnd(element);

                //NOTE: we only remove selection
                if (startSelection !== endSelection) {
                    var selection = TextSelection.getSelectionByElement(element),
                        inverseSelection = TextSelection.hasInverseSelectionContentEditable(element),
                        endNode = inverseSelection ? selection.anchorNode : selection.focusNode,
                        endOffset = inverseSelection ? selection.anchorOffset : selection.focusOffset;

                    TextSelection.selectByNodesAndOffsets(endNode, endOffset, endNode, endOffset, true, false);
                }
            }

            callback();
        }

        function up(element, callback) {
            if (Util.isWebKit && element.tagName && element.tagName.toLowerCase() === 'input') {
                home(element, callback);
                return;
            }

            if (element.tagName && element.tagName.toLowerCase() === 'textarea')
                moveTextAreaCursorUp(element, false);

            callback();
        }

        function down(element, callback) {
            if (Util.isWebKit && element.tagName && element.tagName.toLowerCase() === 'input') {
                end(element, callback);
                return;
            }

            if (element.tagName && element.tagName.toLowerCase() === 'textarea') {
                moveTextAreaCursorDown(element, false);
            }

            callback();
        }

        function home(element, callback, withSelection) {
            if (Util.isTextEditableElement(element)) {
                var elementValue = element.value,
                    selectionStartPosition = TextSelection.getSelectionStart(element),
                    selectionEndPosition = TextSelection.getSelectionEnd(element),
                    inverseSelection = TextSelection.hasInverseSelection(element),

                    isSingleLineSelection = element.tagName.toLocaleLowerCase() !== 'textarea' ? true :
                        Util.getTextareaLineNumberByPosition(element, selectionStartPosition) === Util.getTextareaLineNumberByPosition(element, selectionEndPosition),

                    referencePosition = null;

                if (isSingleLineSelection)
                    referencePosition = inverseSelection ? selectionEndPosition : selectionStartPosition;
                else
                    referencePosition = inverseSelection ? selectionStartPosition : selectionEndPosition;

                var partBefore = elementValue.substring(0, referencePosition),
                    newPosition = partBefore.lastIndexOf('\n') === -1 ? 0 : partBefore.lastIndexOf('\n') + 1;

                if (isSingleLineSelection)
                    TextSelection.select(element, newPosition, withSelection ? referencePosition : newPosition, withSelection);
                else
                    TextSelection.select(element, inverseSelection ? newPosition : selectionStartPosition, inverseSelection ? selectionEndPosition : newPosition, inverseSelection);
            }

            callback();
        }

        function end(element, callback, withSelection) {
            if (Util.isTextEditableElement(element)) {
                var elementValue = element.value,
                    selectionStartPosition = TextSelection.getSelectionStart(element),
                    selectionEndPosition = TextSelection.getSelectionEnd(element),
                    inverseSelection = TextSelection.hasInverseSelection(element),

                    isSingleLineSelection = element.tagName.toLocaleLowerCase() !== 'textarea' ? true :
                        Util.getTextareaLineNumberByPosition(element, selectionStartPosition) === Util.getTextareaLineNumberByPosition(element, selectionEndPosition),

                    referencePosition = null;

                if (isSingleLineSelection)
                    referencePosition = inverseSelection ? selectionEndPosition : selectionStartPosition;
                else
                    referencePosition = inverseSelection ? selectionStartPosition : selectionEndPosition;

                var partAfter = elementValue.substring(referencePosition),
                    newPosition = referencePosition;

                newPosition += partAfter.indexOf('\n') === -1 ? partAfter.length : partAfter.indexOf('\n');

                if (isSingleLineSelection)
                    TextSelection.select(element, withSelection ? referencePosition : newPosition, newPosition);
                else
                    TextSelection.select(element, inverseSelection ? newPosition : selectionStartPosition, inverseSelection ? selectionEndPosition : newPosition, inverseSelection);
            }
            callback();
        }

        function shiftUp(element, callback) {
            if (Util.isWebKit && element.tagName && element.tagName.toLowerCase() === 'input') {
                shiftHome(element, callback);
                return;
            }

            if (element.tagName && element.tagName.toLowerCase() === 'textarea')
                moveTextAreaCursorUp(element, true);

            callback();
        }

        function shiftDown(element, callback) {
            if (Util.isWebKit && element.tagName && element.tagName.toLowerCase() === 'input') {
                shiftEnd(element, callback);
                return;
            }

            if (element.tagName && element.tagName.toLowerCase() === 'textarea')
                moveTextAreaCursorDown(element, true);

            callback();
        }

        function shiftLeft(element, callback) {
            if (Util.isTextEditableElement(element)) {
                var start = TextSelection.getSelectionStart(element),
                    end = TextSelection.getSelectionEnd(element);

                if (start === end || TextSelection.hasInverseSelection(element))
                    TextSelection.select(element, Math.max(start - 1, 0), end, true);
                else
                    TextSelection.select(element, start, Math.max(end - 1, 0), end - 1 < start);

                updateTextAreaIndent(element);
            }

            callback();
        }

        function shiftRight(element, callback) {
            if (Util.isTextEditableElement(element)) {
                var start = TextSelection.getSelectionStart(element),
                    end = TextSelection.getSelectionEnd(element);

                if (start === end || !TextSelection.hasInverseSelection(element))
                    TextSelection.select(element, start, Math.min(end + 1, element.value.length));
                else
                    TextSelection.select(element, Math.min(start + 1, element.value.length), end, start + 1 < end);

                updateTextAreaIndent(element);
            }

            callback();
        }

        function shiftHome(element, callback) {
            home(element, callback, true);
        }

        function shiftEnd(element, callback) {
            end(element, callback, true);
        }

        function enter(element, callback) {
            //submit form on enter pressed
            if (/input/i.test(element.tagName)) {
                if (!Util.isIE)
                    EventSandbox.processElementChanging(element);

                var $form = $(element).parents('form:first');
                if ($form.length) {

                    //if user presses enter when form input is focused, and the form has a submit button,
                    //  browser sends click event to the submit button
                    var $submitButton = $form.find('input[type=submit]:enabled,button[type=submit]:enabled');
                    if (!$submitButton.length)
                    //if button type is not declared, it becomes submit button by default
                        $submitButton = $form.find('button:enabled').filter(function () {
                            return this.type === 'submit';
                        });
                    if ($submitButton.length)
                        EventSimulator.click($submitButton[0]);

                    else {
                        //the form is also submitted on enter press if there is only one input of the following types on it
                        //  and this input is focused (http://www.w3.org/TR/html5/forms.html#implicit-submission)
                        var textInputTagNameRegExp = Util.isWebKit ? /^(text|search|url|number|tel|password|number|email)$/i :
                            /^(text|search|url|number|tel|password|number|email|date|time)$/i;

                        if (textInputTagNameRegExp.test(element.type)) {
                            var $textInputs = $form.find('input').filter(function () {
                                return textInputTagNameRegExp.test(this.type);
                            });

                            if ($textInputs.length === 1 && $textInputs[0] === element && (!element.validity || element.validity.valid)) {
                                if (EventSimulator.submit($form[0]))
                                    $form[0].submit();
                            }
                        }
                    }
                }
            }
            else if (element.tagName && element.tagName.toLowerCase() === 'textarea') {
                var startSelection = TextSelection.getSelectionStart(element),
                    elementValue = element.value,
                    newPosition = TextSelection.getSelectionStart(element) + 1;

                setElementValue(element, elementValue.substring(0, startSelection) + String.fromCharCode(10) + elementValue.substring(startSelection));
                TextSelection.select(element, newPosition, newPosition);
            }
            //S173120
            else if (element.tagName && element.tagName.toLowerCase() === 'a')
                EventSimulator.click(element);

            callback();
        }

        function focusNextElement(element, callback) {
            var nextElement = Util.getNextFocusableElement(element);

            EventSandbox.focus(nextElement, function () {
                if (Util.isTextEditableInput(nextElement))
                    TextSelection.select(nextElement);

                callback();
            });
        }

        function focusPrevElement(element, callback) {
            var prevElement = Util.getNextFocusableElement(element, true);

            EventSandbox.focus(prevElement, function () {
                if (Util.isTextEditableInput(prevElement))
                    TextSelection.select(prevElement);

                callback();
            });
        }

        return {
            'ctrl+a': selectAll,
            'backspace': backspace,
            'delete': del,
            'left': left,
            'right': right,
            'up': up,
            'down': down,
            'shift+left': shiftLeft,
            'shift+right': shiftRight,
            'shift+up': shiftUp,
            'shift+down': shiftDown,
            'shift+home': shiftHome,
            'shift+end': shiftEnd,
            'home': home,
            'end': end,
            'enter': enter,
            'tab': focusNextElement,
            'shift+tab': focusPrevElement
        };
    })();

    //api
    exports.press = function (keysString, actionCallback) {
        var shortcuts = Util.getShortcutsByKeyCombination(supportedShortcutHandlers, keysString.toLowerCase()),
            keysCombinationHandlers = {},
            processedString = '',
            notProcessedString = keysString,

            i = 0;

        for (i = 0; i < shortcuts.length; i++) {
            var shortcut = shortcuts[i].toLowerCase(),
                position = notProcessedString.indexOf(shortcut),
                length = shortcut.length;

            processedString += notProcessedString.substring(0, position + length);

            keysCombinationHandlers[processedString] = Util.getShortcutHandlerByKeyCombination(supportedShortcutHandlers, shortcut);

            notProcessedString = notProcessedString.substring(position + length);
        }

        var modifiersState = { ctrl: false, alt: false, shift: false, meta: false },
            keys = Util.getArrayByKeyCombination(keysString);

        //NOTE: check 'shift' modifier in keys
        for (i = 0; i < keys.length; i++) {
            var key = keys[i];

            if (key.toLowerCase() === 'shift') {
                var nextKey = keys[i + 1];

                if (!nextKey)
                    continue;

                if (Util.KEYS_MAPS.SHIFT_MAP[nextKey])
                    keys[i + 1] = Util.KEYS_MAPS.SHIFT_MAP[nextKey];
            }

            if (Util.KEYS_MAPS.SHIFT_MAP[key] && (!keys[i - 1] || keys[i - 1].toLowerCase() !== 'shift')) {
                keys[i] = Util.KEYS_MAPS.SHIFT_MAP[key];
                keys.splice(i, 0, 'shift');
                i++;
            }
        }

        var keysHelpers = $.map(keys, function (key) {
            return keyHelper(key);
        });

        //press keys
        var pressedKeyHelpers = [],
            currentCombination = '';

        async.series({
            keydown: function (seriesCallback) {
                async.forEachSeries(
                    keysHelpers,
                    function (helper, helperCallback) {
                        var preventDefault = !helper.down(modifiersState),
                            key = helper.getKey();

                        pressedKeyHelpers.push(helper);
                        currentCombination += (currentCombination ? '+' : '') + key;

                        var callback = function () {
                            window.setTimeout(helperCallback, KEY_PRESS_DELAY);
                        };

                        if (preventDefault)
                            callback();
                        else {
                            var currentShortcutHandler = keysCombinationHandlers[currentCombination];

                            if (!currentShortcutHandler || Util.isMozilla || key === 'enter')  //B254435
                                preventDefault = !helper.press(modifiersState);

                            if (!preventDefault && currentShortcutHandler)
                                currentShortcutHandler(Util.getActiveElement(), callback);
                            else
                                callback();
                        }
                    },
                    function () {
                        seriesCallback();
                    }
                );
            },

            keyup: function () {
                async.whilst(
                    function () {
                        return pressedKeyHelpers.length;
                    },
                    function (callback) {
                        pressedKeyHelpers.pop().up(modifiersState);
                        setTimeout(callback, KEY_PRESS_DELAY);
                    },
                    function () {
                        actionCallback();
                    }
                );
            }
        });
    };
});
TestCafeClient.define('Automation.Move.Playback', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        async = Hammerhead.async,
        Util = Hammerhead.Util,
        EventSimulator = Hammerhead.EventSimulator,
        MessageSandbox = Hammerhead.MessageSandbox,
        CrossDomainMessages = require('Base.CrossDomainMessages'),
        AutomationUtil = require('Automation.Util'),
        AutomationSettings = require('Automation.Settings'),
        ScrollPlaybackAutomation = require('Automation.Scroll.Playback'),
        CursorWidget = require('UI.Cursor');


    exports.run = function (to, inDragging, options, actionCallback, currentDocument, skipEvents, inSelect) {
        currentDocument = currentDocument || document;

        var targetPoint = Util.isDomElement(to) ?
                AutomationUtil.getMouseActionPoint(to, options, false) :
            {
                x: Math.floor(to.x),
                y: Math.floor(to.y)
            },

            isMovingInIFrame = currentDocument !== document,
            targetScreenPoint = null,
            startX = null,
            startY = null,
            dragElement = null,

        // moving settings
            distanceX = null,
            distanceY = null,

            startTime = null,
            endTime = null,
            movingTime = null,

            lastOverElement = null,//B235842

            currentCursorPosition = CursorWidget.getPosition(),

            $window = $(window);

        // moving step
        function nextStep(movingStepCallback) {
            async.series({
                setPosition: function (callback) {
                    if (Util.hasTouchEvents && !inDragging) {
                        currentCursorPosition = targetScreenPoint;
                        CursorWidget.move(currentCursorPosition, movingStepCallback);
                        return;
                    }

                    if (!startTime) {
                        startTime = Util.dateNow();
                        endTime = startTime + movingTime;
                    }

                    var currentTime = Math.min(Util.dateNow(), endTime),
                        progress = (currentTime - startTime) / (endTime - startTime);

                    currentCursorPosition = {
                        x: Math.round(startX + (distanceX * progress)),
                        y: Math.round(startY + (distanceY * progress))
                    };

                    //NOTE: mousemove event can't be simulated on the point when cursor was at the start. Therefore we increases
                    // a minimal distance 1 px.
                    if (currentCursorPosition.x === startX && currentCursorPosition.y === startY) {
                        if (inSelect) {
                            movingStepCallback();
                            return;
                        }

                        if (distanceX !== 0)
                            currentCursorPosition.x = currentCursorPosition.x + (distanceX > 0 ? 1 : -1);
                        else if (distanceY !== 0)
                            currentCursorPosition.y = currentCursorPosition.y + (distanceY > 0 ? 1 : -1);

                    }

                    CursorWidget.move(currentCursorPosition, callback);
                },
                emulateEvents: function () {
                    if (!skipEvents) {
                        // moving events
                        var currentElement = CursorWidget.getElementUnderCursor(currentCursorPosition.x, currentCursorPosition.y),
                            eventPoint = currentCursorPosition;

                        if (inDragging && !dragElement)
                            dragElement = currentElement;

                        if (currentElement)
                            eventPoint = AutomationUtil.getEventOptionCoordinates(currentElement, currentCursorPosition);

                        var eventOptions = $.extend({
                            clientX: eventPoint.x,
                            clientY: eventPoint.y,
                            button: 0,
                            which: $.browser.webkit ? (inDragging ? Util.WHICH_PARAMETER.LEFT_BUTTON : Util.WHICH_PARAMETER.NO_BUTTON) : 1,
                            buttons: inDragging ? Util.BUTTONS_PARAMETER.LEFT : Util.BUTTONS_PARAMETER.NO_BUTTON
                        }, options);

                        var currentElementChanged = true;

                        try {
                            //NOTE: when lastOverElement was in an iframe that removed, ie raises exception when we try to
                            // compare it with current element
                            currentElementChanged = currentElement !== lastOverElement;
                        }
                        catch (e) {
                            lastOverElement = null;
                            currentElementChanged = true;
                        }

                        if (currentElementChanged && lastOverElement)
                            EventSimulator.mouseout(lastOverElement, $.extend({relatedTarget: currentElement}, eventOptions));

                        var eventName = Util.hasTouchEvents ? 'touchmove' : 'mousemove',
                            el = Util.hasTouchEvents ? dragElement : currentElement;

                        //NOTE: only in IE a 'mousemove' event is raised before a 'mouseover' one (B236966)
                        if (Util.isIE && currentElement)
                            EventSimulator[eventName](el, eventOptions);

                        if (currentElementChanged) {
                            if (currentElement)
                                EventSimulator.mouseover(currentElement, $.extend({relatedTarget: lastOverElement}, eventOptions));
                            lastOverElement = currentElement;
                        }

                        if (!Util.isIE && currentElement)
                            EventSimulator[eventName](el, eventOptions);

                        //NOTE: we need add extra 'mousemove' if element was changed
                        // because sometimes client script require several 'mousemove' events for element (T246904)
                        if (currentElementChanged && currentElement)
                            EventSimulator[eventName](el, eventOptions);

                    }
                    movingStepCallback();
                }
            });
        }

        async.series({
            scrollToTarget: function (callback) {
                var elementOffset = Util.isDomElement(to) ? Util.getOffsetPosition(to) : null;
                ScrollPlaybackAutomation.run(Util.isDomElement(to) ? to : targetPoint, options, currentDocument, function () {
                    if (Util.isDomElement(to)) {
                        var newElementOffset = Util.getOffsetPosition(to),
                            elementScroll = Util.getElementScroll($(to));

                        if (to !== document.documentElement) {
                            targetPoint.x += newElementOffset.left - elementOffset.left;
                            targetPoint.y += newElementOffset.top - elementOffset.top;
                        }

                        if (!/html/i.test(to.tagName) && Util.hasScroll(to, currentDocument)) {
                            targetPoint.x -= elementScroll.left;
                            targetPoint.y -= elementScroll.top;
                        }
                    }
                    targetScreenPoint = Util.offsetToClientCoords(targetPoint);
                    callback();
                });
            },

            setCursor: function (callback) {
                if (targetPoint.x < 0 || targetScreenPoint.x > $window.width() ||
                    targetScreenPoint.y < 0 || targetScreenPoint.y > $window.height) {
                    actionCallback();
                    return;
                }

                var windowTopResponse = null;

                if (window.top === window.self) {
                    var curCursorPosition = CursorWidget.getPosition(),
                        currentElement = curCursorPosition ?
                            CursorWidget.getElementUnderCursor(curCursorPosition.x, curCursorPosition.y) : null;

                    if (!currentElement || !(currentElement.tagName && currentElement.tagName.toLowerCase() === 'iframe')) {
                        CursorWidget.ensureCursorPosition(targetScreenPoint, false, callback);
                        return;
                    }

                    var pageCursorPosition = Util.clientToOffsetCoord(curCursorPosition),
                    //NOTE: after scroll in top window cursor position in iframe could be changed (if cursor was above iframe)
                        fixedPositionForIFrame = Util.getFixedPositionForIFrame(pageCursorPosition, currentElement.contentWindow);

                    if (fixedPositionForIFrame.x <= 0 || fixedPositionForIFrame.y <= 0)
                        CursorWidget.ensureCursorPosition(targetScreenPoint, false, callback);

                    MessageSandbox.pingIFrame(currentElement, CrossDomainMessages.MOVE_CURSOR_IN_IFRAME_PING, function (err) {
                        if (!err) {
                            //NOTE: move over iframe then move above top document
                            windowTopResponse = function (e) {
                                if (e.message.cmd === CrossDomainMessages.MOVE_FROM_IFRAME_RESPONSE_CMD) {
                                    MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);

                                    if (!e.message.point)
                                        CursorWidget.ensureCursorPosition(targetScreenPoint, false, callback);
                                    else if (CursorWidget.getPosition()) {
                                        CursorWidget.setPosition(Util.getFixedPosition(e.message.point, currentElement.contentWindow, true));
                                        window.setTimeout(callback, 0);
                                    }
                                    else
                                        CursorWidget.ensureCursorPosition(Util.getFixedPosition(e.message.point, currentElement.contentWindow, true), true, callback);
                                }
                            };

                            MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);


                            MessageSandbox.sendServiceMsg({
                                cmd: CrossDomainMessages.MOVE_FROM_IFRAME_REQUEST_CMD,
                                rectangle: Util.getIFrameCoordinates(currentElement.contentWindow),
                                startPoint: Util.clientToOffsetCoord(targetScreenPoint),
                                endPoint: pageCursorPosition,
                                //NOTE: after scroll in top window cursor position in iframe could be changed (if cursor was above iframe)
                                cursorPosition: Util.getFixedPositionForIFrame(pageCursorPosition, currentElement.contentWindow)
                            }, currentElement.contentWindow);
                        }
                        else {
                            CursorWidget.ensureCursorPosition(targetScreenPoint, false, callback);
                            return;
                        }
                    }, true);
                }
                else {
                    //NOTE: move over top document than move above iframe
                    windowTopResponse = function (e) {
                        if (e.message.cmd === CrossDomainMessages.MOVE_TO_IFRAME_RESPONSE_CMD) {
                            MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);

                            if (!e.message.point || (e.message.point.x === targetScreenPoint.x && e.message.point.y === targetScreenPoint.y))
                                CursorWidget.ensureCursorPosition(targetScreenPoint, false, callback);
                            else if (CursorWidget.getPosition()) {
                                CursorWidget.setPosition(e.message.point);
                                window.setTimeout(callback, 0);
                            }
                            else
                                CursorWidget.ensureCursorPosition(e.message.point, true, callback);
                        }
                    };

                    MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);

                    MessageSandbox.sendServiceMsg({
                        cmd: CrossDomainMessages.MOVE_TO_IFRAME_REQUEST_CMD,
                        point: targetScreenPoint
                    }, window.top);
                }
            },

            moveToTarget: function (callback) {
                currentCursorPosition = CursorWidget.getPosition();

                if (!currentCursorPosition) {
                    actionCallback();
                    return;
                }

                startX = currentCursorPosition.x;
                startY = currentCursorPosition.y;
                distanceX = targetScreenPoint.x - startX;
                distanceY = targetScreenPoint.y - startY;

                if (isMovingInIFrame) {
                    startX -= $(currentDocument).scrollLeft();
                    startY -= $(currentDocument).scrollTop();
                }

                movingTime = Math.max(Math.abs(distanceX), Math.abs(distanceY)) / (inDragging ? AutomationSettings.MOVING_SPEED_IN_DRAGGING : AutomationSettings.MOVING_SPEED);

                if (inDragging)
                    movingTime = Math.max(movingTime, AutomationSettings.MINIMUM_MOVING_TIME);

                async.whilst(
                    //is cursor in the target
                    function () {
                        if (isMovingInIFrame)
                            return (currentCursorPosition.x + $(currentDocument).scrollLeft()) !== targetScreenPoint.x ||
                                (currentCursorPosition.y + $(currentDocument).scrollTop()) !== targetScreenPoint.y;

                        return currentCursorPosition.x !== targetScreenPoint.x || currentCursorPosition.y !== targetScreenPoint.y;
                    },

                    //moving step
                    function (movingCallback) {
                        window.setTimeout(function () {
                            nextStep(movingCallback);
                        }, 0);
                    },

                    //save cursor position
                    function (err) {
                        if (err)
                            return;
                        callback();
                    }
                );
            },


            callback: function () {
                actionCallback();
            }
        });
    };
});
TestCafeClient.define('Automation.Press.Playback', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        async = Hammerhead.async,
        Util = Hammerhead.Util,
        Settings = require('Settings'),
        KeyPressSimulator = require('Automation.Press.KeyPressSimulator'),
        AutomationUtil = require('Automation.Util'),
        SelectElementUi = require('UI.SelectElement');

    exports.run = function (keys, actionCallback) {
        var parsedKeys = Util.parseKeysString(keys),
            commands = parsedKeys.commands;

        async.forEachSeries(
            commands,
            function (command, callback) {
                //NOTE: in Mozilla prentDefault for 'keydown' and 'keypress' event in select element
                // does not affect on the appointment of the new selectedIndex
                //so we should process switching between options only on playback anf after change action
                if (Util.isSelectElement(Util.getActiveElement())) {
                    if (!/enter|tab/.test(command) || ((!Settings.RECORDING || Settings.PLAYBACK) && /enter|tab/.test(command)))
                        SelectElementUi.switchOptionsByKeys(command);
                }

                KeyPressSimulator.press(command, function () {
                    window.setTimeout(callback, AutomationUtil.ACTION_STEP_DELAY);
                });
            },
            function () {
                actionCallback();
            }
        );
    };
});

TestCafeClient.define('Automation.RClick.Playback', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        async = Hammerhead.async,
        Util = Hammerhead.Util,
        EventSimulator = Hammerhead.EventSimulator,
        Settings = require('Settings'),
        AutomationUtil = require('Automation.Util'),
        AutomationSettings = require('Automation.Settings'),
        CursorWidget = require('UI.Cursor'),

        MovePlaybackAutomation = require('Automation.Move.Playback');

    exports.run = function (el, options, actionCallback) {
        options = {
            ctrl: options.ctrl,
            alt: options.alt,
            shift: options.shift,
            meta: options.meta,
            offsetX: options.offsetX,
            offsetY: options.offsetY,
            caretPos: options.caretPos
        };

        var isSvgElement = Util.isSvgElement(el),
            target = Util.isContainOffset(el, options.offsetX, options.offsetY) ?
                el : AutomationUtil.getMouseActionPoint(el, options, false),

            notPrevented = true,
            screenPoint = null,
            eventPoint = null,
            eventOptions = null,
            topElement = null,
            isInvisibleElement = false,
            currentTopElement = null;

        if (options.offsetX)
            options.offsetX = Math.round(options.offsetX);
        if (options.offsetY)
            options.offsetY = Math.round(options.offsetY);

        async.series({
            moveCursorToElement: function (callback) {
                if (Settings.RECORDING && !Settings.PLAYBACK && !Util.isElementVisible(el)) {
                    topElement = el;

                    window.setTimeout(callback, AutomationSettings.ACTION_STEP_DELAY);
                    return;
                }

                MovePlaybackAutomation.run(target, false, options, function () {
                    if ((isSvgElement && Util.isOpera) || ($(el).is('tref')))
                        topElement = el; //NOTE: document.elementFromPoint can't find this element
                    else {
                        screenPoint = AutomationUtil.getMouseActionPoint(el, options, true);
                        eventPoint = AutomationUtil.getEventOptionCoordinates(el, screenPoint);

                        eventOptions = $.extend({
                            clientX: eventPoint.x,
                            clientY: eventPoint.y,
                            button: Util.BUTTON.RIGHT,
                            which: Util.WHICH_PARAMETER.RIGHT_BUTTON,
                            buttons: Util.BUTTONS_PARAMETER.RIGHT_BUTTON
                        }, options);

                        topElement = AutomationUtil.getElementUnderCursor(screenPoint.x, screenPoint.y, null, target);

                        if (!topElement) {
                            isInvisibleElement = true;
                            topElement = el;
                        }
                    }
                    window.setTimeout(callback, AutomationSettings.ACTION_STEP_DELAY);
                });
            },

            cursorMouseDown: function (callback) {
                CursorWidget.rMouseDown(callback);
            },

            mousedown: function (callback) {
                var activeElement = Util.getActiveElement(),
                //in IE focus is not raised if element was focused before click, even if focus is lost during mousedown
                    needFocus = !(Util.isIE && activeElement === topElement);

                notPrevented = EventSimulator.mousedown(topElement, eventOptions);

                if (!isInvisibleElement && screenPoint) {
                    currentTopElement = AutomationUtil.getElementUnderCursor(screenPoint.x, screenPoint.y, null, target);

                    if (currentTopElement)
                        topElement = currentTopElement;
                }

                if (notPrevented === false) {
                    callback();
                    return;
                }

                //NOTE: For contentEditable elements we should call focus directly for action's element because
                //option 'caretPos' is indicated this element and topElement may be a child of this element
                AutomationUtil.focusAndSetSelection(Util.isContentEditableElement(el) ? el : topElement, options, needFocus, callback);
            },

            cursorMouseUp: function (callback) {
                CursorWidget.mouseUp(callback);
            },

            mouseup: function (callback) {
                EventSimulator.mouseup(topElement, eventOptions);

                if (!isInvisibleElement && screenPoint) {
                    currentTopElement = CursorWidget.getElementUnderCursor(screenPoint.x, screenPoint.y, null, target);

                    if (currentTopElement)
                        topElement = currentTopElement;
                }
                window.setTimeout(callback, AutomationSettings.ACTION_STEP_DELAY);
            },

            contextmenu: function () {
                EventSimulator.contextmenu(topElement, eventOptions);
                AutomationUtil.focusInputByLabel(topElement);

                actionCallback();
            }
        });
    };
});

TestCafeClient.define('Automation.Scroll.Playback', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        async = Hammerhead.async,
        Util = Hammerhead.Util,
        MessageSandbox = Hammerhead.MessageSandbox,
        CrossDomainMessages = require('Base.CrossDomainMessages');

    var MAX_SCROLL_MARGIN = 50,
        MIN_SCROLL_STEP = 10,
        SCROLL_SPEED = 1,
        SCROLL_DELAY = 10;

    function getScrollOption($currentScrollable, target, offsetX, offsetY) {
        var targetDimensions = Util.getClientDimensions(target),
            scrollableDimensions = Util.getClientDimensions($currentScrollable[0]),

            scrollTop = null,
            scrollLeft = null,
            maxLeftScrollMargin = Math.min(MAX_SCROLL_MARGIN, Math.floor(scrollableDimensions.width / 2)),
            maxTopScrollMargin = Math.min(MAX_SCROLL_MARGIN, Math.floor(scrollableDimensions.height / 2)),

            isScrollDown = -1,
            isScrollRight = -1;

        var relation = {
            top: targetDimensions.top - (scrollableDimensions.top + scrollableDimensions.border.top),
            bottom: scrollableDimensions.bottom - scrollableDimensions.border.bottom - scrollableDimensions.scrollbar.bottom - targetDimensions.bottom,
            left: targetDimensions.left - (scrollableDimensions.left + scrollableDimensions.border.left),
            right: scrollableDimensions.right - scrollableDimensions.border.right - scrollableDimensions.scrollbar.right - targetDimensions.right
        };

        // vertical scroll
        if (relation.top < 0)
            scrollTop = Math.round(scrollableDimensions.scroll.top + relation.top - maxTopScrollMargin);
        else if (relation.top > 0 && relation.bottom < 0) {
            scrollTop = Math.round(scrollableDimensions.scroll.top + Math.min(relation.top, -relation.bottom) + maxTopScrollMargin);
            isScrollDown = 1;
        }

        // horizontal scroll
        if (relation.left < 0)
            scrollLeft = Math.round(scrollableDimensions.scroll.left + relation.left - maxLeftScrollMargin);
        else if (relation.left > 0 && relation.right < 0) {
            scrollLeft = Math.round(scrollableDimensions.scroll.left + Math.min(relation.left, -relation.right) + maxLeftScrollMargin);
            isScrollRight = 1;
        }

        //NOTE: we should check: can we show the full element
        var targetElementWidth = Math.abs(targetDimensions.right - targetDimensions.left),
            targetElementHeight = Math.abs(targetDimensions.bottom - targetDimensions.top);

        if (scrollableDimensions.width <= targetElementWidth && offsetX >= scrollableDimensions.width - (scrollableDimensions.border.left + scrollableDimensions.border.right))
            scrollLeft = (scrollLeft === null ? offsetX : scrollLeft + offsetX - isScrollRight * maxLeftScrollMargin) - maxLeftScrollMargin;

        if (scrollableDimensions.height <= targetElementHeight && offsetY >= scrollableDimensions.height - (scrollableDimensions.border.top + scrollableDimensions.border.bottom))
            scrollTop = (scrollTop === null ? offsetY : scrollTop + offsetY - isScrollDown * maxTopScrollMargin) - maxTopScrollMargin;

        if (scrollLeft !== null || scrollTop !== null) {
            return {
                top: scrollTop,
                left: scrollLeft
            };
        }

        return null;
    }

    function scrollElement($el, left, top, scrollCallback) {
        var leftScrollStep = null,
            topScrollStep = null,

            elementScroll = Util.getElementScroll($el),
            startLeftScroll = elementScroll.left,
            startTopScroll = elementScroll.top,

            scrollLeftDirection = 0,
            scrollTopDirection = 0,
            currentScrollLeft = null,
            currentScrollTop = null,

            lastScrollLeft = null,
            lastScrollTop = null,

            requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame,
            scrollingStep = null,
            startScrollingStamp = null;

        function getScrollDirection(newScrollValue, isLeft) {
            if (newScrollValue === null)
                return 0;
            if (newScrollValue > (isLeft ? startLeftScroll : startTopScroll))
                return 1;
            return -1;
        }

        function assignScrollValues() {
            $el.scrollLeft(currentScrollLeft);
            $el.scrollTop(currentScrollTop);

            lastScrollLeft = currentScrollLeft;
            lastScrollTop = currentScrollTop;
        }

        scrollLeftDirection = getScrollDirection(left, true);
        scrollTopDirection = getScrollDirection(top, false);

        //we assign this minimum possible scroll step to avoid too slow action
        leftScrollStep = Math.max(Math.abs(left - startLeftScroll) / SCROLL_SPEED, MIN_SCROLL_STEP);
        topScrollStep = Math.max(Math.abs(top - startTopScroll) / SCROLL_SPEED, MIN_SCROLL_STEP);

        async.whilst(
            function () {
                if (!scrollLeftDirection && !scrollTopDirection)
                    return false;

                currentScrollLeft = Math.round(Util.getElementScroll($el).left + scrollLeftDirection * leftScrollStep);
                currentScrollLeft = scrollLeftDirection === 1 ? Math.min(currentScrollLeft, left) : Math.max(currentScrollLeft, left);

                currentScrollTop = Math.round(Util.getElementScroll($el).top + scrollTopDirection * topScrollStep);
                currentScrollTop = scrollTopDirection === 1 ? Math.min(currentScrollTop, top) : Math.max(currentScrollTop, top);

                return currentScrollLeft !== lastScrollLeft || currentScrollTop !== lastScrollTop;
            },

            function (callback) {
                //NOTE: for IOS > 6 (B254728)
                if (Util.isSafari && requestAnimationFrame) {
                    scrollingStep = function (timeStamp) {
                        if (!startScrollingStamp)
                            startScrollingStamp = timeStamp;

                        assignScrollValues();

                        if (timeStamp - startScrollingStamp >= SCROLL_SPEED)
                            callback();
                        else
                            requestAnimationFrame(scrollingStep);
                    };

                    requestAnimationFrame(scrollingStep);
                }
                else {
                    assignScrollValues();
                    window.setTimeout(function () {
                        callback();
                    }, SCROLL_DELAY);
                }
            },

            function () {
                scrollCallback();
            }
        );
    }

    exports.run = function (to, actionOptions, currentDocument, actionCallback) {
        var afterScrollDelay = Util.isTouchDevice && Util.isMozilla ? 200 : 0,
            isDomElement = Util.isDomElement(to),
            isHtmlElement = isDomElement && /html/i.test(to.tagName),
            scrollableParents = [],
            pointTo = null,

            $target = null,
            targetRect = null,
            targetWidth = null,
            targetHeight = null,
            offsetX = null,
            offsetY = null,

            maxLeftScrollMargin = null,
            maxTopScrollMargin = null,


            ownScroll = null,
            newOwnScrollLeft = null,
            newOwnScrollTop = null,

            currentOffsetX = 0,
            currentOffsetY = 0,
            windowTopResponse = null;

        function considerWindowTopScroll(msg, callback) {
            windowTopResponse = function (e) {
                if (e.message.cmd === CrossDomainMessages.SCROLL_TOP_WINDOW_RESPONSE_CMD) {
                    MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);
                    windowTopResponse = null;

                    callback();
                }
            };

            MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);

            MessageSandbox.sendServiceMsg(msg, window.top);
        }

        async.series({
            scrollElement: function (scrollElementCallback) {
                if (!isDomElement) {
                    scrollElementCallback();
                    return;
                }

                $target = $(to);
                targetRect = $target[0].getBoundingClientRect();
                targetWidth = isHtmlElement ? $target[0].clientWidth : targetRect.width;
                targetHeight = isHtmlElement ? $target[0].clientHeight : targetRect.height;
                offsetX = actionOptions && typeof actionOptions.offsetX !== 'undefined' ? actionOptions.offsetX : Math.round(targetWidth / 2);
                offsetY = actionOptions && typeof actionOptions.offsetY !== 'undefined' ? actionOptions.offsetY : Math.round(targetHeight / 2);
                maxLeftScrollMargin = Math.min(MAX_SCROLL_MARGIN, Math.floor(targetWidth / 2));
                maxTopScrollMargin = Math.min(MAX_SCROLL_MARGIN, Math.floor(targetHeight / 2));
                ownScroll = Util.getElementScroll($target);

                if (!Util.hasScroll(to, currentDocument)) {
                    scrollElementCallback();
                    return;
                }

                if (offsetX >= ownScroll.left + targetWidth)
                    newOwnScrollLeft = offsetX - maxLeftScrollMargin;
                else if (offsetX <= ownScroll.left)
                    newOwnScrollLeft = offsetX - maxLeftScrollMargin;

                if (offsetY >= ownScroll.top + targetHeight)
                    newOwnScrollTop = offsetY - maxTopScrollMargin;
                else if (offsetY <= ownScroll.top)
                    newOwnScrollTop = offsetY - maxTopScrollMargin;

                async.series({
                    scrollBody: function (callback) {
                        if (isHtmlElement)
                            scrollElement($target.find('body'), newOwnScrollLeft, newOwnScrollTop, callback);
                        else
                            callback();
                    },
                    ownScroll: function (callback) {
                        scrollElement($target, newOwnScrollLeft, newOwnScrollTop, callback);
                    },
                    callback: function () {
                        scrollElementCallback();
                    }
                });
            },

            scrollElementParents: function (scrollParentsCallback) {
                scrollableParents = isDomElement ? Util.getScrollableParents(to, currentDocument) : [document.documentElement];

                if (!scrollableParents.length) {
                    scrollParentsCallback();
                    return;
                }

                var currentTarget = pointTo ? pointTo : to;

                currentOffsetX = $target ? offsetX - $target.scrollLeft() : offsetX;
                currentOffsetY = $target ? offsetY - $target.scrollTop() : offsetY;


                async.forEachSeries(scrollableParents,
                    function (el, callback) {
                        var $el = $(el),
                            scrollOption = getScrollOption($el, currentTarget, Math.max(0, currentOffsetX), Math.max(0, currentOffsetY));

                        function parentScrollCallback() {
                            var newTargetDimensions = Util.getClientDimensions(currentTarget),
                                newScrollableDimensions = Util.getClientDimensions($el[0]);

                            currentOffsetX = newTargetDimensions.left - newScrollableDimensions.left + newScrollableDimensions.border.left + offsetX;
                            currentOffsetY = newTargetDimensions.top - newScrollableDimensions.top + newScrollableDimensions.border.top + offsetY;

                            currentTarget = el;
                            callback();
                        }

                        if (!scrollOption) {
                            parentScrollCallback();
                            return;
                        }

                        async.series({
                            scrollBody: function (callback) {
                                if (/html/i.test(el.tagName))
                                    scrollElement($el.find('body'), scrollOption.left, scrollOption.top, callback);
                                else
                                    callback();
                            },
                            ownScroll: function () {
                                scrollElement($el, scrollOption.left, scrollOption.top, parentScrollCallback);
                            }
                        });
                    },

                    function () {
                        scrollParentsCallback();
                    });
            },

            callback: function () {
                window.setTimeout(function () {
                    if (window.top === window.self) {
                        actionCallback();
                        return;
                    }

                    if (isDomElement) {
                        var msg = {
                            cmd: CrossDomainMessages.SCROLL_TOP_WINDOW_REQUEST_CMD,
                            options: {
                                offsetX: Math.max(0, currentOffsetX),
                                offsetY: Math.max(0, currentOffsetY)
                            }
                        };

                        considerWindowTopScroll(msg, actionCallback);
                    }
                    else {
                        windowTopResponse = function (e) {
                            if (e.message.cmd === CrossDomainMessages.GET_IFRAME_POSITION_DATA_RESPONSE_CMD) {
                                MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);
                                windowTopResponse = null;

                                var documentScroll = Util.getElementScroll($(document)),

                                    msg = {
                                        cmd: CrossDomainMessages.SCROLL_TOP_WINDOW_REQUEST_CMD,
                                        point: {
                                            x: to.x - documentScroll.left + e.message.scroll.left,
                                            y: to.y - documentScroll.top + e.message.scroll.top
                                        }
                                    };

                                considerWindowTopScroll(msg, actionCallback);
                            }
                        };

                        MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);

                        MessageSandbox.sendServiceMsg({cmd: CrossDomainMessages.GET_IFRAME_POSITION_DATA_REQUEST_CMD}, window.top);
                    }
                }, afterScrollDelay);
            }
        });
    };
});
TestCafeClient.define('Automation.Select.Playback', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        async = Hammerhead.async,
        Util = Hammerhead.Util,
        EventSandbox = Hammerhead.EventSandbox,
        EventSimulator = Hammerhead.EventSimulator,
        NativeMethods = Hammerhead.NativeMethods,
        Settings = require('Settings'),
        ContentEditableHelper = Hammerhead.ContentEditableHelper,
        CursorWidget = require('UI.Cursor'),
        TextSelection = Hammerhead.TextSelection,

        AutomationSettings = require('Automation.Settings'),
        AutomationUtil = require('Automation.Util'),
        AutomationSelectUtil = require('Automation.Select.Util'),
        ScrollPlaybackAutomation = require('Automation.Scroll.Playback'),
        MovePlaybackAutomation = require('Automation.Move.Playback');

    exports.run = function (el, options, runCallback) {
        var isTextarea = el.tagName.toLowerCase() === 'textarea',
            isTextEditable = Util.isTextEditableElement(el),
            isContentEditable = Util.isContentEditableElement(el),
            topElement = null,
            currentTopElement = null,

            startPosition = null,
            endPosition = null,

            pointFrom = null,
            pointTo = null,
            screenPointTo = null,

            screenPointFrom = null,
            eventPointTo = null,
            eventPointFrom = null,
            eventOptionsStart = null,
            eventOptionsEnd = null,
            notPrevented = true,
            point = null,

        //NOTE: options to get right selection position to mouse movement
            correctOptions = null;

        //determination of selection positions by arguments
        var processedOptions = AutomationSelectUtil.getProcessedOptions(el, options);

        startPosition = processedOptions.startPosition;
        endPosition = processedOptions.endPosition;

        if (Settings.RECORDING && !Settings.PLAYBACK && !Util.isElementVisible(el)) {
            topElement = el;

            window.setTimeout(runCallback, AutomationSettings.ACTION_STEP_DELAY);
            return;
        }

        async.series({
            scrollToElement: function (callback) {
                ScrollPlaybackAutomation.run(el, {}, null, function () {
                        AutomationSelectUtil.getCorrectOptions(el, function (opt) {
                            correctOptions = opt;
                            callback();
                        });
                    }
                );
            },

            moveToStart: function (callback) {
                if ((isTextEditable && el.value.length > 0) ||
                    (isContentEditable && ContentEditableHelper.getContentEditableValue(el).length)) {
                    pointFrom = AutomationSelectUtil.getSelectPositionCoordinates(el, startPosition, endPosition, true, correctOptions);
                    pointTo = AutomationSelectUtil.getSelectPositionCoordinates(el, startPosition, endPosition, false, correctOptions);
                }
                else {
                    pointFrom = Util.findCenter(el);
                    pointTo = pointFrom;
                }

                AutomationSelectUtil.scrollElementByPoint(el, pointFrom);

                point = AutomationSelectUtil.updatePointByScrollElement(el, pointFrom);

                MovePlaybackAutomation.run(point, false, options, function () {
                    screenPointFrom = Util.offsetToClientCoords(point);
                    eventPointFrom = AutomationUtil.getEventOptionCoordinates(el, screenPointFrom);

                    eventOptionsStart = $.extend({
                        clientX: eventPointFrom.x,
                        clientY: eventPointFrom.y
                    }, options);

                    topElement = CursorWidget.getElementUnderCursor(screenPointFrom.x, screenPointFrom.y);

                    if (!topElement) {
                        runCallback();
                        return;
                    }

                    isTextEditable = Util.isTextEditableElement(topElement);
                    isTextarea = topElement.tagName.toLowerCase() === 'textarea';

                    window.setTimeout(callback, AutomationSettings.DRAG_ACTION_STEP_DELAY);
                });
            },

            cursorMousseDown: function (callback) {
                CursorWidget.lMouseDown(callback);
            },

            mousedown: function (callback) {
                //NOTE: in webkit and ie raising mousedown event opens select element's dropdown,
                // therefore we should handle it and hide the dropdown (B236416)
                var needHandleMousedown = ($.browser.webkit || Util.isIE) && Util.isSelectElement(el),
                    wasPrevented = null;

                if (needHandleMousedown) {
                    var onmousedown = function (e) {
                        wasPrevented = e.defaultPrevented;
                        Util.preventDefault(e);
                        NativeMethods.removeEventListener.call(el, 'mousedown', onmousedown, false);
                    };

                    NativeMethods.addEventListener.call(el, 'mousedown', onmousedown, false);
                }

                if (Util.hasTouchEvents)
                    notPrevented = EventSimulator.touchstart(topElement, eventOptionsStart);
                else
                    notPrevented = EventSimulator.mousedown(topElement, eventOptionsStart);

                currentTopElement = CursorWidget.getElementUnderCursor(screenPointFrom.x, screenPointFrom.y);

                if (currentTopElement)
                    topElement = currentTopElement;

                if (notPrevented === false) {
                    if (needHandleMousedown && !wasPrevented)
                        notPrevented = true;
                    else {
                        callback();
                        return;
                    }
                }

                //NOTE: For contentEditable elements we should call focus directly for action's element because
                //option 'caretPos' is indicated for this element and topElement may be a child of this element
                if (isContentEditable)
                    topElement = el;

                EventSandbox.focus(isContentEditable ? ContentEditableHelper.findContentEditableParent(topElement) : topElement, function () {
                    pointTo = AutomationSelectUtil.getSelectPositionCoordinates(topElement, startPosition, endPosition, false, correctOptions);

                    if (isContentEditable && !pointTo) {
                        pointTo = AutomationSelectUtil.getSelectionLastVisiblePosition(el, startPosition, endPosition, correctOptions) ||
                            Util.findCenter(el);
                    }

                    AutomationSelectUtil.scrollElementByPoint(topElement, pointTo);
                    pointTo = AutomationSelectUtil.updatePointByScrollElement(topElement, pointTo);

                    MovePlaybackAutomation.run(pointTo, false, options, function () {
                        callback();
                    });
                }, false, true);
            },

            getCorrectOptions: function (callback) {
                if ((isTextEditable && topElement.value.length > 0) || (isContentEditable && ContentEditableHelper.getContentEditableValue(topElement).length)) {
                    if (pointTo) {
                        point = pointTo;
                        callback();
                        return;
                    }

                    AutomationSelectUtil.getCorrectOptions(topElement, function (opt) {
                        point = AutomationSelectUtil.getSelectPositionCoordinates(topElement, startPosition, endPosition, false, opt);
                        callback();
                    });
                }
                else
                    callback();
            },

            setFinalSelection: function (callback) {
                if (!point)
                    point = Util.findCenter(topElement);

                AutomationSelectUtil.scrollElementByPoint(topElement, point);
                point = AutomationSelectUtil.updatePointByScrollElement(topElement, point);

                screenPointTo = Util.offsetToClientCoords(point);
                eventPointTo = AutomationUtil.getEventOptionCoordinates(topElement, screenPointTo);

                eventOptionsEnd = $.extend({
                    clientX: eventPointTo.x,
                    clientY: eventPointTo.y
                }, options);

                if ((isTextEditable || isContentEditable) && notPrevented !== false) {
                    //NOTE: The same cursor position may correspond to different nodes
                    //only if we know which nodes should be selected in result we should select it directly
                    if (isContentEditable && options.startNode && options.endNode)
                        AutomationSelectUtil.selectContentEditableByOptions(el, startPosition, endPosition, options);
                    else
                        TextSelection.select(topElement, startPosition, endPosition);
                }
                callback();
            },

            cursorMouseUp: function (callback) {
                CursorWidget.mouseUp(callback);
            },

            mouseup: function () {
                if (Util.hasTouchEvents)
                    EventSimulator.touchend(topElement, eventOptionsEnd);
                else
                    EventSimulator.mouseup(topElement, eventOptionsEnd);
                runCallback();
            }
        });
    };
});

TestCafeClient.define('Automation.Select.Util', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        MessageSandbox = Hammerhead.MessageSandbox,
        TextSelection = Hammerhead.TextSelection,
        ContentEditableHelper = Hammerhead.ContentEditableHelper,
        CrossDomainMessages = require('Base.CrossDomainMessages');

    exports.getSelectPositionCoordinates = function (el, start, end, isStartPos, correctOptions) {
        var backward = start > end,
            selectionStart = TextSelection.getPositionCoordinates(el, start, correctOptions),
            selectionEnd = TextSelection.getPositionCoordinates(el, end, correctOptions),
            point = null;

        if (!isStartPos && start !== end) {
            //NOTE: we do not set pointTo immediately because we take as pointTo last visible point
            // in selectionPath after calculating it
            return selectionEnd ? {x: selectionEnd.left,
                y: !backward ? selectionEnd.bottom : selectionEnd.top} : null;
        }

        //NOTE: if selection starting from invisible symbol
        if (!selectionStart)
            return Util.findCenter(el);

        if (start !== end)
            point = {x: selectionStart.left, y: !backward ? selectionStart.top : selectionStart.bottom};
        else
            point = {x: selectionStart.left, y: selectionStart.top + (selectionStart.bottom - selectionStart.top) / 2};

        return point;
    };

    exports.scrollElementByPoint = function (element, point) {
        var isTextarea = element.tagName.toLowerCase() === 'textarea';

        if (!Util.isEditableElement(element))
            return;

        var elementOffset = Util.getOffsetPosition(element),
            elementBorders = Util.getBordersWidth($(element)),
            elementScroll = Util.getElementScroll($(element)),

            iFrame = Util.getIFrameByElement(element),
            iFrameScroll = iFrame ? Util.getElementScroll($(iFrame.contentWindow.document)) : null;

        //NOTE: we don't need to scroll input elements in Mozilla,
        // because it happens automatically on selection setting
        // but we can't know input elements' scroll value in Mozilla
        // Bug https://bugzilla.mozilla.org/show_bug.cgi?id=293186
        if ((Util.isMozilla || Util.isIE11) && !isTextarea)
            return;

        var ownOffsetX = point.x - (elementOffset.left + elementBorders.left + (isTextarea && iFrame ? iFrameScroll.left : 0)),
            ownOffsetY = point.y - (elementOffset.top + elementBorders.top + (isTextarea && iFrame ? iFrameScroll.top : 0)),
            scrollValue = null;


        if (isTextarea) {
            if (ownOffsetY < elementScroll.top)
                scrollValue = ownOffsetY;
            else if (ownOffsetY > element.clientHeight + elementScroll.top)
                scrollValue = ownOffsetY - element.clientHeight;

            if (scrollValue !== null)
                $(element).scrollTop(Math.round(scrollValue));
        }
        else {
            if (ownOffsetX < elementScroll.left)
                scrollValue = ownOffsetX;
            else if (ownOffsetX > element.clientWidth + elementScroll.left)
                scrollValue = ownOffsetX - element.clientWidth;

            if (scrollValue !== null)
                $(element).scrollLeft(Math.round(scrollValue));
        }
    };

    exports.updatePointByScrollElement = function (element, point) {
        var isTextEditable = Util.isTextEditableElement(element),
            isTextarea = element.tagName.toLowerCase() === 'textarea';

        if (!(isTextEditable || Util.isContentEditableElement(element)))
            return;

        var left = point.x,
            top = point.y,
            elementOffset = Util.getOffsetPosition(element),
            elementBorders = Util.getBordersWidth($(element)),
            elementScroll = Util.getElementScroll($(element)),
            iFrameScroll = Util.isElementInIframe(element) ? Util.getElementScroll($(Util.findDocument(element))) : null;

        //NOTE: we doesn't need to scroll input elements in Mozilla,
        // because it happens automatically on selection setting
        //but we can't know input elements' scroll value in Mozilla
        // Bug https://bugzilla.mozilla.org/show_bug.cgi?id=293186
        if (isTextEditable && (Util.isMozilla || Util.isIE11) && !isTextarea) {
            return {
                x: Math.min(left, elementOffset.left + elementBorders.left + element.clientWidth) - (iFrameScroll ? iFrameScroll.left : 0),
                y: top - (iFrameScroll ? iFrameScroll.top : 0)
            };
        }

        return {
            x: left - elementScroll.left - (iFrameScroll ? iFrameScroll.left : 0),
            y: top - elementScroll.top - (iFrameScroll ? iFrameScroll.top : 0)
        };
    };

    exports.getProcessedOptions = function (element, options) {
        var isTextarea = element.tagName.toLowerCase() === 'textarea',
            isTextEditable = Util.isTextEditableElement(element),
            isContentEditable = Util.isContentEditableElement(element),

        //results for any elements
            startPosition = null,
            endPosition = null,

        //results for textarea elements
            linesArray = [],
            startPos = null,
            endPos = null,
            startLine = null,
            endLine = null,
            startLineIndex = null,
            endLineIndex = null;

        if (isTextarea)
            linesArray = element.value.length ? element.value.split('\n') : [];

        if (isTextEditable) {
            if (!element.value.length)
                startPosition = endPosition = 0;
            else if (typeof options.offset !== 'undefined' || $.isEmptyObject(options)) {
                startPosition = 0;

                if (typeof options.offset === 'undefined')
                    endPosition = element.value.length;
                else if (options.offset >= 0)
                    endPosition = Math.min(options.offset, element.value.length);
                else {
                    endPosition = Math.max(0, element.value.length + options.offset);
                    startPosition = element.value.length;
                }
            }
            else if (typeof options.startLine === 'undefined' || !isTextarea) {
                startPosition = Math.min(options.startPos, element.value.length);
                endPosition = Math.min(options.endPos, element.value.length);
            }
            else {
                if (options.startLine >= linesArray.length) {
                    startLineIndex = element.value.length;
                    startLine = linesArray.length - 1;
                }
                else {
                    startLine = options.startLine;
                    startLineIndex = Util.getTextareaPositionByLineAndOffset(element, startLine, 0);
                }

                if (options.endLine >= linesArray.length) {
                    endLineIndex = element.value.length;
                    endLine = linesArray.length - 1;
                }
                else {
                    endLine = options.endLine;
                    endLineIndex = Util.getTextareaPositionByLineAndOffset(element, endLine, 0);
                }

                startPos = Math.min(options.startPos, linesArray[startLine].length);
                startPosition = startLineIndex + startPos;

                if (typeof options.endPos === 'undefined') {
                    endPos = linesArray[endLine].length;
                    endPosition = endLineIndex + endPos;
                }
                else {
                    endPos = Math.min(options.endPos, linesArray[endLine].length);
                    endPosition = endLineIndex + endPos;
                }
            }
        }
        else if (isContentEditable) {
            if (!ContentEditableHelper.getContentEditableValue(element).length)
                startPosition = endPosition = 0;
            if (typeof options.startNode !== 'undefined' && typeof options.endNode !== 'undefined') {
                startPosition = ContentEditableHelper.getFirstVisiblePosition(options.startNode);
                startPosition = ContentEditableHelper.calculatePositionByNodeAndOffset(element, options.startNode, startPosition);
                endPosition = ContentEditableHelper.getLastVisiblePosition(options.endNode);
                endPosition = ContentEditableHelper.calculatePositionByNodeAndOffset(element, options.endNode, endPosition);
                //NOTE: we should revert selection if startNode is actually endNode
                if (startPosition > endPosition) {
                    startPosition = ContentEditableHelper.getLastVisiblePosition(options.startNode);
                    startPosition = ContentEditableHelper.calculatePositionByNodeAndOffset(element, options.startNode, startPosition);
                    endPosition = ContentEditableHelper.getFirstVisiblePosition(options.endNode);
                    endPosition = ContentEditableHelper.calculatePositionByNodeAndOffset(element, options.endNode, endPosition);
                }
            }
            else if (typeof options.offset !== 'undefined' || $.isEmptyObject(options)) {
                startPosition = ContentEditableHelper.getFirstVisiblePosition(element);
                if (typeof options.offset === 'undefined')
                    endPosition = ContentEditableHelper.getLastVisiblePosition(element);
                else if (options.offset >= 0)
                    endPosition = Math.min(options.offset, ContentEditableHelper.getLastVisiblePosition(element));
                else {
                    endPosition = Math.max(0, ContentEditableHelper.getLastVisiblePosition(element) + options.offset);
                    startPosition = ContentEditableHelper.getLastVisiblePosition(element);
                }
            }
            else {
                startPosition = Math.min(options.startPos, ContentEditableHelper.getLastVisiblePosition(element));
                endPosition = Math.min(options.endPos, ContentEditableHelper.getLastVisiblePosition(element));
            }
        }

        //NOTE: we need calculate startLine, endLine, endPos to optimize selection path
        if (isTextarea && typeof options.endLine === 'undefined' && element.value.length) {
            startLine = Util.getTextareaLineNumberByPosition(element, startPosition);
            startPos = Util.getTextareaIndentInLine(element, startPosition);
            endLine = Util.getTextareaLineNumberByPosition(element, endPosition);
            endPos = Util.getTextareaIndentInLine(element, endPosition);
        }

        return{
            startPosition: startPosition,
            endPosition: endPosition,
            startLine: startLine,
            endLine: endLine,
            startPos: startPos,
            endPos: endPos
        };
    };

    function getPointByPosition(el, pos, correctOptions) {
        var selectionCoord = TextSelection.getPositionCoordinates(el, pos, correctOptions);

        //NOTE: For position corresponding to the invisible character in contentEditable element
        // method 'getPositionCoordinates' can return empty point
        if (!selectionCoord)
            return;

        var point = {
                x: selectionCoord.left,
                y: selectionCoord.top + (selectionCoord.bottom - selectionCoord.top) / 2
            },
            elementScroll = Util.getElementScroll($(el));

        if (Util.isIE) {
            point.x += elementScroll.left;
            point.y += elementScroll.top;
        }
        return point;
    }

    function getMidpointXCoordinate(y, pointStart, pointEnd) {
        return pointStart.x + ((y - pointStart.y) * (pointEnd.x - pointStart.x)) / (pointEnd.y - pointStart.y);
    }

    function getOptimizedSelectionPath(path, processedOptions, startPoint, positionCorrect, pointForCorrectionPath) {
        var isRightDirection = processedOptions.endPos > processedOptions.startPos,
            backward = processedOptions.startPosition > processedOptions.endPosition,
            currentStart = processedOptions.startPos === 0 && backward ? 2 : 1,
            optimizedPath = [
                {position: processedOptions.startPosition, point: startPoint}
            ],
            realIndex = null,
            realPositionX = null;

        optimizedPath = optimizedPath.concat($.extend(true, [], path));

        function findNextIndexWithRealPoint(afterIndex, moreThen) {
            var lastPart = optimizedPath.slice(afterIndex + 1),
                index = afterIndex + 1;

            if (!lastPart.length)
                return afterIndex;

            $.each(lastPart, function (i, value) {
                    if (isRightDirection) {
                        if (value.point.x > moreThen) {
                            index += i;
                            return false;
                        }
                    }
                    else if (value.point.x >=
                        getMidpointXCoordinate(lastPart[i].point.y, optimizedPath[0].point, pointForCorrectionPath === null ?
                            optimizedPath[optimizedPath.length - 1 ].point :
                            pointForCorrectionPath)) {
                        index += i;
                        return false;
                    }
                }
            );
            return index;
        }

        var i = 0,
            j = 0;

        if (isRightDirection) {
            for (i = currentStart; i < optimizedPath.length; i++) {
                if (optimizedPath[i].point.x < optimizedPath[i - 1].point.x) {
                    realIndex = findNextIndexWithRealPoint(i, optimizedPath[i - 1].point.x);

                    for (j = i; j < realIndex; j++)
                        optimizedPath[j].point.x = getMidpointXCoordinate(optimizedPath[j].point.y, optimizedPath[i - 1].point, optimizedPath[realIndex].point);

                    i = realIndex;
                }
            }
        }
        else {
            for (i = currentStart; i < optimizedPath.length; i++) {
                //NOTE: if left of the line that connects pointFrom and pointTo
                if (optimizedPath[i].position === (positionCorrect === null ? optimizedPath[optimizedPath.length - 1].position : positionCorrect))
                    break;
                else {
                    realPositionX = getMidpointXCoordinate(optimizedPath[i].point.y, optimizedPath[0].point, pointForCorrectionPath === null ?
                        optimizedPath[optimizedPath.length - 1].point :
                        pointForCorrectionPath);

                    if (optimizedPath[i].point.x < realPositionX) {
                        realIndex = findNextIndexWithRealPoint(i);

                        for (j = i; j < realIndex; j++)
                            optimizedPath[j].point.x = getMidpointXCoordinate(optimizedPath[j].point.y, optimizedPath[i - 1].point, optimizedPath[realIndex].point);

                        i = realIndex;
                    }
                }
            }
        }

        return optimizedPath;
    }

    exports.getSelectionPath = function (el, processedOptions, startPoint, endPoint, correctOptions) {
        var isTextarea = el.tagName.toLowerCase() === 'textarea',

            startPosition = processedOptions.startPosition,
            endPosition = processedOptions.endPosition,
            backward = startPosition > endPosition,
            linesArray = [],
            startPos = null,
            endPos = null,
            startLine = null,
            endLine = null,

            current = startPosition,
            currentLine = null,
            currentPos = null,

            isSelectionRegion = false,
            selectionPath = [],

            endPointCorrect = null,
            positionCorrect = null,
            pointForCorrectionPath = null;

        function setCorrectPoint(pos) {
            if (isSelectionRegion && pointForCorrectionPath === null) {
                positionCorrect = pos;
                pointForCorrectionPath = getPointByPosition(el, pos, correctOptions);
            }
        }

        function pushPosition(pos) {
            if (pos === endPosition) {
                selectionPath.push({
                    position: endPosition,
                    point: endPoint
                });
            }
            else
                selectionPath.push({
                    position: pos,
                    point: getPointByPosition(el, pos, correctOptions)
                });
        }

        if (isTextarea) {
            linesArray = el.value.length ? el.value.split('\n') : [];
            startPos = processedOptions.startPos;
            endPos = processedOptions.endPos;
            startLine = processedOptions.startLine;
            endLine = processedOptions.endLine;
        }

        if (!isTextarea || startLine === endLine) {
            while (current !== endPosition) {
                current = backward ? current - 1 : current + 1;
                pushPosition(current);
            }
        }
        else {
            currentLine = Util.getTextareaLineNumberByPosition(el, current);
            currentPos = Util.getTextareaIndentInLine(el, current);

            while (current !== endPosition) {
                if (currentLine !== endLine) {
                    if (!isSelectionRegion)
                        isSelectionRegion = Math.abs(startPosition - endPosition) !== 1;

                    currentLine = backward ? currentLine - 1 : currentLine + 1;

                    if (currentPos !== endPos) {
                        //NOTE:logic to optimize the mouse movements (during transitions between lines)
                        if (currentLine === endLine && (endPos === 0 || endPos === linesArray[currentLine].length)) {
                            if (selectionPath[selectionPath.length - 1] &&
                                (!(backward && Util.getTextareaIndentInLine(el, selectionPath[selectionPath.length - 1].position) < endPos))) {
                                setCorrectPoint(selectionPath[selectionPath.length - 1] ? selectionPath[selectionPath.length - 1].position : null);
                            }
                            currentPos = endPos;
                        }
                        else if (!(currentLine !== endLine && (endPos === 0 || (endPos === linesArray[endLine].length && startPos !== 0))))
                            currentPos = currentPos > endPos ? currentPos - 1 : currentPos + 1;
                    }
                    //HACK: we can't optimize mouse movements between startPos = endPos = 0 if selection will go on
                    //first symbol in the string.
                    else if (!Util.isIE && currentLine !== endLine && endPos === 0)
                        currentPos = backward ? 1 : currentPos + 1;

                    current = Util.getTextareaPositionByLineAndOffset(el, currentLine, Math.min(currentPos, linesArray[currentLine].length));
                }
                else {
                    current = current > endPosition ? current - 1 : current + 1;
                    setCorrectPoint(current);
                }
                pushPosition(current);
            }
        }

        selectionPath.push({
            position: endPosition,
            point: endPoint || endPointCorrect
        });

        return !isSelectionRegion ? selectionPath :
            getOptimizedSelectionPath(selectionPath, processedOptions, startPoint, positionCorrect, pointForCorrectionPath);
    };

    exports.getSelectionLastVisiblePosition = function (el, startPos, endPos, correctOptions) {
        var backward = startPos > endPos,
            currentPos = endPos + (backward ? 1 : -1),
            currentPoint = null;

        while (currentPos !== startPos) {
            currentPos = backward ? currentPos + 1 : currentPos - 1;
            currentPoint = getPointByPosition(el, currentPos, correctOptions);
            if (currentPoint)
                break;
        }
        return currentPoint;
    };

    exports.selectContentEditableByOptions = function (el, startPosition, endPosition, options) {
        var backward = startPosition > endPosition,
            startSelectionObject = ContentEditableHelper.calculateNodeAndOffsetByPosition(el, startPosition),
            endSelectionObject = ContentEditableHelper.calculateNodeAndOffsetByPosition(el, endPosition),
            startOffset = null,
            endOffset = null;

        //NOTE: If the calculated position does not match options we should recalculate it
        if ((options.startNode !== startSelectionObject.node && !Util.isElementContainsNode(options.startNode, startSelectionObject.node)) ||
            (options.endNode !== endSelectionObject.node && !Util.isElementContainsNode(options.endNode, endSelectionObject.node))) {

            if (backward) {
                startOffset = ContentEditableHelper.getLastVisiblePosition(options.startNode);
                endOffset = ContentEditableHelper.getFirstVisiblePosition(options.endNode);
            }
            else {
                startOffset = ContentEditableHelper.getFirstVisiblePosition(options.startNode);
                endOffset = ContentEditableHelper.getLastVisiblePosition(options.endNode);
            }

            //NOTE: We should recalculate it because may be necessary select startNode or endNode child nodes
            startSelectionObject = ContentEditableHelper.calculateNodeAndOffsetByPosition(options.startNode, startOffset);
            endSelectionObject = ContentEditableHelper.calculateNodeAndOffsetByPosition(options.endNode, endOffset);

            TextSelection.selectByNodesAndOffsets(startSelectionObject.node, startSelectionObject.offset, endSelectionObject.node, endSelectionObject.offset, true, backward);
        }
        else
            TextSelection.select(el, startPosition, endPosition);
    };

    exports.getCorrectOptions = function (el, callback) {
        var elementRect = el.getBoundingClientRect(),
            elementHeight = el.scrollHeight || elementRect.height,
            isInIFrame = Util.isElementInIframe(el),
            iFrame = Util.getIFrameByElement(el),
            windowTopResponse = null,

            options = {
                isTextarea: el.tagName.toLowerCase() === 'textarea',
                isContentEditable: Util.isContentEditableElement(el),
                elementBorders: Util.getBordersWidth($(el)),
                elementRect: elementRect,
                //NOTE: strange behavior in Chrome - for some element (e.g. for font tag) scrollHeight is 0,
                //so we get getBoundingClientRect
                elementHeight: elementHeight,
                elementOffset: Util.getOffsetPosition(el),
                isInIFrame: isInIFrame,
                isInProcessedIFrame: window.top !== window.self,
                iFrame: iFrame,
                documentScroll: Util.getElementScroll($(document)),
                iFrameDocumentScroll: isInIFrame ? Util.getElementScroll($(Util.findDocument(el))) : {left: 0, top: 0}
            };

        if (isInIFrame) {
            options.iFrame = Util.getIFrameByElement(el);
            options.iFrameOffset = Util.getOffsetPosition(iFrame);
            options.iFrameBorders = Util.getBordersWidth($(iFrame));
            options.iFrameMargin = Util.getElementMargin($(iFrame));
            options.iFramePadding = Util.getElementPadding($(iFrame));
        }

        if (Util.isIE && Util.browserVersion < 11 && options.isInProcessedIFrame) {
            windowTopResponse = function (e) {
                if (e.message.cmd === CrossDomainMessages.GET_IFRAME_POSITION_DATA_RESPONSE_CMD) {
                    MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);
                    windowTopResponse = null;

                    options.windowTopScroll = e.message.scroll;
                    options.crossDomainIFrameOffset = e.message.iFrameOffset;   //TODO: rename property
                    options.crossDomainIFrameBorders = e.message.iFrameBorders;
                    options.crossDomainIFramePadding = e.message.iFramePadding;
                    callback(options);
                }
            };

            MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, windowTopResponse);
            MessageSandbox.sendServiceMsg({cmd: CrossDomainMessages.GET_IFRAME_POSITION_DATA_REQUEST_CMD}, window.top);
        }
        else {
            callback(options);
        }
    };
});
TestCafeClient.define('Automation.Type.Playback', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        async = Hammerhead.async,
        Util = Hammerhead.Util,
        EventSandbox = Hammerhead.EventSandbox,
        EventSimulator = Hammerhead.EventSimulator,
        Settings = require('Settings'),
        TextSelection = Hammerhead.TextSelection,
        ContentEditableHelper = Hammerhead.ContentEditableHelper,

        AutomationSettings = require('Automation.Settings'),
        TypeCharPlaybackAutomation = require('Automation.TypeChar.Playback'),
        ClickPlaybackAutomation = require('Automation.Click.Playback');

    function findTextEditableChild(el) {
        var isContentEditable = Util.isContentEditableElement(el);

        if (!Util.isTextEditableElement(el) && !isContentEditable) {
            var $innerInputElement = $(el).find('*').filter(function () {
                return Util.isTextEditableElementAndEditingAllowed(this);
            });

            if ($innerInputElement.length)
                return $innerInputElement[0];
        }

        return el;
    }

    exports.run = function (el, text, options, actionCallback) {
        text = text.toString();

        var length = text.length,
            curElement = null,
            elementForTyping = null,
            currPos = 0,
            isTextEditable = null,
            isInputWithoutSelectionProperties = null,
            isContentEditable = Util.isContentEditableElement(el),
            notPrevented = true;

        if (options.offsetX)
            options.offsetX = Math.round(options.offsetX);
        if (options.offsetY)
            options.offsetY = Math.round(options.offsetY);

        curElement = findTextEditableChild(el);
        isTextEditable = Util.isTextEditableElementAndEditingAllowed(curElement);
        isInputWithoutSelectionProperties = Util.isInputWithoutSelectionPropertiesInMozilla(curElement); //T133144

        if (Settings.RECORDING && !Settings.PLAYBACK && !Util.isElementVisible(curElement)) {
            actionCallback();
            return;
        }

        async.series({
            click: function (seriaCallback) {
                if (Util.getActiveElement() !== curElement)
                    ClickPlaybackAutomation.run(curElement, options, function () {
                        window.setTimeout(seriaCallback, AutomationSettings.ACTION_STEP_DELAY);
                    });
                else {
                    if (isTextEditable)
                        EventSandbox.watchElementEditing(curElement);

                    if (isTextEditable || isContentEditable) {
                        if (!isNaN(parseInt(options.caretPos)) && options.caretPos !== TextSelection.getSelectionStart(curElement))
                            TextSelection.select(curElement, options.caretPos, options.caretPos);
                    }
                    seriaCallback();
                }
            },

            clearText: function (seriaCallback) {
                if ((!isContentEditable && Util.getActiveElement() !== curElement) ||
                    (isContentEditable && Util.getActiveElement() !== ContentEditableHelper.findContentEditableParent(curElement))) {
                    actionCallback();
                    return;
                }

                curElement = isContentEditable ? el : Util.getActiveElement();

                if (options.replace) {
                    if (isInputWithoutSelectionProperties)
                        curElement.value = '';
                    else if (isTextEditable) {
                        TextSelection.select(curElement);
                        TypeCharPlaybackAutomation.run(curElement, '');
                    }
                    else if (isContentEditable)
                        TextSelection.deleteSelectionContents(curElement, true);
                }

                seriaCallback();
            },

            type: function () {
                var caretPosition = null;

                if (isInputWithoutSelectionProperties)
                    caretPosition = isNaN(parseInt(options.caretPos)) ? el.value.length : options.caretPos;

                async.whilst(
                    //are not all symbols typed
                    function () {
                        return currPos < length;
                    },

                    //typing symbol
                    function (typingCallback) {
                        var keyCode = Util.getKeyCodeByChar(text.charAt(currPos)),
                            charCode = text.charCodeAt(currPos);

                        async.series({
                            startTypeSymbol: function (seriaCallback) {
                                notPrevented = EventSimulator.keydown(curElement, $.extend(options, { keyCode: keyCode }));
                                delete options['keyCode'];

                                if (notPrevented !== false) {
                                    //T162478: Wrong typing and keys pressing in editor
                                    if (!isContentEditable && curElement !== Util.getActiveElement()) {
                                        curElement = Util.getActiveElement();
                                        curElement = findTextEditableChild(curElement);
                                        isTextEditable = Util.isTextEditableElementAndEditingAllowed(curElement);
                                        isInputWithoutSelectionProperties = Util.isInputWithoutSelectionPropertiesInMozilla(curElement);
                                    }

                                    //Element for typing can change last time only after keydown event
                                    elementForTyping = curElement;

                                    notPrevented = EventSimulator.keypress(curElement, $.extend(options, { keyCode: charCode, charCode: charCode }));
                                    delete options['charCode'];

                                    //T162478: Wrong typing and keys pressing in editor
                                    if (!isContentEditable && curElement !== Util.getActiveElement()) {
                                        curElement = Util.getActiveElement();
                                        curElement = findTextEditableChild(curElement);
                                    }

                                    if (notPrevented === false)
                                    //change event must not be raised after prevented keypress even if element value was changed (B253816)
                                        EventSandbox.restartWatchingElementEditing(elementForTyping);
                                    else {
                                        var currentChar = text.charAt(currPos),
                                            prevChar = currPos === 0 ? null : text.charAt(currPos - 1);

                                        if (!(isInputWithoutSelectionProperties && currentChar === '.')) {
                                            if (prevChar && ((isInputWithoutSelectionProperties && /(\.|-)/.test(prevChar)) ||
                                                (!(Util.isIE && Util.browserVersion === 9) && $(elementForTyping).is('input[type=number]') && prevChar === '-')))
                                                TypeCharPlaybackAutomation.run(elementForTyping, prevChar + currentChar, caretPosition + currPos - 1);
                                            else
                                                TypeCharPlaybackAutomation.run(elementForTyping, currentChar, caretPosition + currPos);
                                        }
                                    }
                                }

                                window.setTimeout(seriaCallback, AutomationSettings.ACTION_STEP_DELAY);
                            },

                            endTypeSymbol: function () {
                                EventSimulator.keyup(curElement, $.extend(options, { keyCode: keyCode }));
                                delete options['keyCode'];
                                currPos++;

                                typingCallback();
                            }
                        });
                    },

                    //callback
                    function () {
                        actionCallback();
                    });
            }
        });
    };
});

TestCafeClient.define('Automation.TypeChar.Playback', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        EventSimulator = Hammerhead.EventSimulator,
        TextSelection = Hammerhead.TextSelection,
        ContentEditableHelper = Hammerhead.ContentEditableHelper;

    function getCorrectElementSelection(element) {
        var currentSelection = TextSelection.getSelectionByElement(element),
            inverseSelection = TextSelection.hasInverseSelectionContentEditable(element);

        if (TextSelection.hasElementContainsSelection(element))
            currentSelection = ContentEditableHelper.getSelection(element, currentSelection, inverseSelection);
        else {
            //NOTE: if we type text in element which don't contains selection
            // we think selectionStart and selectionEnd positions are null in this element.
            //So we calculate the necessary start and end nodes and offsets
            var startSelectionPosition = ContentEditableHelper.calculateNodeAndOffsetByPosition(element, 0),
                endSelectionPosition = ContentEditableHelper.calculateNodeAndOffsetByPosition(element, 0);

            currentSelection = {};
            currentSelection.startNode = startSelectionPosition.node;
            currentSelection.startOffset = startSelectionPosition.offset;
            currentSelection.endNode = endSelectionPosition.node;
            currentSelection.endOffset = endSelectionPosition.offset;
        }
        return currentSelection;
    }

    function typeCharToContentEditable(element, characters) {
        var chars = characters === ' ' ? String.fromCharCode(160) : characters,
            currentSelection = getCorrectElementSelection(element),
            startNode = currentSelection.startNode,
            startOffset = currentSelection.startOffset,
            endNode = currentSelection.endNode,
            endOffset = currentSelection.endOffset;

        if (!startNode || !Util.isContentEditableElement(startNode) || !endNode || !Util.isContentEditableElement(endNode))
            return;

        var firstNonWhitespaceSymbolIndex = ContentEditableHelper.getFirstNonWhitespaceSymbolIndex(startNode.nodeValue),
            lastNonWhitespaceSymbolIndex = ContentEditableHelper.getLastNonWhitespaceSymbolIndex(startNode.nodeValue),
            startNodeParent = startNode.parentNode,
            needDeleteSelectedContent = !Util.isTheSameNode(startNode, endNode),
            inverseSelection = null,

            correctedStartNode = null,
            correctedStartOffset = null,
            correctedEndOffset = null,
            newCaretPos = null,

            oldStartNodeValue = null;

        if (needDeleteSelectedContent) {
            TextSelection.deleteSelectionContents(element);

            //NOTE: After deleting selection contents we should refresh stored startNode
            //because contentEditable element's content could change and we can not find parentElements of nodes
            if ($.browser.webkit || !(startNode.parentNode && startNode.parentElement)) {
                currentSelection = getCorrectElementSelection(element);
                inverseSelection = TextSelection.hasInverseSelectionContentEditable(element);
                startNode = inverseSelection ? currentSelection.endNode : currentSelection.startNode;
                startOffset = inverseSelection ? currentSelection.endOffset : currentSelection.startOffset;

                if (!startNode || !Util.isContentEditableElement(startNode))
                    return;
            }
            endOffset = startOffset;
        }

        //NOTE: We can type only in text nodes(except if selected node is 'br' node, then we use special behavior)
        if (!Util.isRenderedNode(startNode))
            return;

        if (startNode.nodeType === 1) {
            correctedStartNode = document.createTextNode(chars);
            if (startNode.tagName.toLowerCase() === 'br')
                startNodeParent.insertBefore(correctedStartNode, startNode);
            else
                startNode.appendChild(correctedStartNode);
            newCaretPos = chars.length;
            TextSelection.selectByNodesAndOffsets(correctedStartNode, newCaretPos, correctedStartNode, newCaretPos);
            return;
        }

        if (startOffset < firstNonWhitespaceSymbolIndex && startOffset !== 0) {
            correctedStartOffset = firstNonWhitespaceSymbolIndex;
            correctedEndOffset = endOffset + (firstNonWhitespaceSymbolIndex - startOffset);
        }
        else if (endOffset > lastNonWhitespaceSymbolIndex && endOffset !== startNode.nodeValue.length) {
            correctedStartOffset = startNode.nodeValue.length;
            correctedEndOffset = endOffset + (startNode.nodeValue.length - startOffset);
        }
        else {
            correctedStartOffset = startOffset;
            correctedEndOffset = endOffset;
        }

        correctedStartNode = correctedStartNode || startNode;
        oldStartNodeValue = correctedStartNode.nodeValue;
        correctedStartNode.nodeValue = oldStartNodeValue.substring(0, correctedStartOffset) + chars +
            oldStartNodeValue.substring(correctedEndOffset, oldStartNodeValue.length);
        newCaretPos = correctedStartOffset + chars.length;
        TextSelection.selectByNodesAndOffsets(correctedStartNode, newCaretPos, correctedStartNode, newCaretPos);
    }

    exports.run = function (element, characters, caretPos) {
        if (Util.isContentEditableElement(element)) {
            typeCharToContentEditable(element, characters);
            return;
        }

        if (!Util.isTextEditableElementAndEditingAllowed(element))
            return;

        var startSelection = TextSelection.getSelectionStart(element),
            endSelection = TextSelection.getSelectionEnd(element),

        //NOTE: attribute 'maxlength' doesn't work in all browsers. In IE still don't support input with type 'number'
            isNumberInput = $(element).is('input[type=number]'),
            elementMaxLength = !Util.isIE && isNumberInput ?
                null : parseInt($(element).attr('maxLength')),

            value = element.value;

        if (elementMaxLength === null || isNaN(elementMaxLength) || elementMaxLength > value.length) {
            if (isNumberInput) {
                if (Util.isIOS && value[value.length - 1] === '.') {    //B254013
                    startSelection += 1;
                    endSelection += 1;
                }
                else if (Util.isInputWithoutSelectionPropertiesInMozilla(element)) //T133144
                    startSelection = endSelection = caretPos;
            }

            element.value = value.substring(0, startSelection) + characters + value.substring(endSelection, value.length);

            TextSelection.select(element, startSelection + characters.length, startSelection + characters.length);
        }

        //NOTE: B253410, T138385 (we should simulate 'input' event after type char in 'type' and 'press' action)
        EventSimulator.input(element);
    };
});
TestCafeClient.define('Base.jQueryExtensions.Selectors', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$;

    exports.create = function($) {
        var REGEXP_START_SUBSTR = ':/',
            REGEXP_END_SUBSTR = '/',
            ATTR_REGEXP_METHOD_NAME = 'attrRegExp',
            CONTAINS_EXCLUDE_CHILDREN_METHOD_NAME = 'containsExcludeChildren',
            textElementTagsRegExp = /^i$|^b$|^big$|^small$|^em$|^strong$|^dfn$|^code$|^samp$|^kbd$|^var$|^cite$|^abbr$|^acronym$|^sub$|^sup$|span$|^bdo$|^address$|^div$|^a$|^object$|^p$|^h\d$|^pre$|^q$|^ins$|^del$|^dt$|^dd$|^li$|^label$|^option$|^textarea$|^fieldset$|^legend$|^button$|^caption$|^td$|^th$|^title$/;

        function init() {
            $.expr[':'][CONTAINS_EXCLUDE_CHILDREN_METHOD_NAME] = function (obj, index, meta) {
                /* obj - is a current DOM element
                 index - the current loop index in stack
                 meta - meta data about your selector where meta[3] is argument
                 stack - stack of all elements to loop

                 Return true to include current element
                 Return false to explude current element
                 */
                if (!meta[3])
                    return false;
                var textExcludeChildren = getOwnTextForSelector(obj);
                return !!(textExcludeChildren && textExcludeChildren.indexOf(meta[3]) >= 0);
            };

            $.expr[':'][ATTR_REGEXP_METHOD_NAME] = function (obj, index, meta) {
                var argument = meta[3],
                    attrName,
                    regExpString;
                if (!argument)
                    return false;
                if (argument.indexOf(REGEXP_START_SUBSTR) > 0 &&
                    argument.lastIndexOf(REGEXP_END_SUBSTR) === argument.length - REGEXP_END_SUBSTR.length &&
                    argument.indexOf(REGEXP_START_SUBSTR) < argument.length - REGEXP_END_SUBSTR.length - REGEXP_START_SUBSTR.length) {
                    attrName = argument.substr(0, argument.indexOf(REGEXP_START_SUBSTR));
                    regExpString = argument.substring(argument.indexOf(REGEXP_START_SUBSTR) + REGEXP_START_SUBSTR.length, argument.lastIndexOf(REGEXP_END_SUBSTR));
                    return new RegExp(regExpString).test(obj.getAttribute(attrName));
                }
                else return false;
            };
        }

        function getOwnTextForSelector(element) {
            if (!element || !textElementTagsRegExp.test(element.tagName.toLowerCase()))
                return '';

            var text = '';

            for (var i = 0; i < element.childNodes.length; i++) {
                if (element.childNodes[i].nodeType === 3 && element.childNodes[i].data)
                    text += element.childNodes[i].data;
            }

            if (text) {
                //\xC0-\xFF - latin letters
                text = $.trim(text.replace(/[^a-z0-9а-я \xC0-\xFF]+/gi, ''));
                text = text.replace(/\s+/g, ' ');
                if (/\S/.test(text))
                    return text;
            }

            return '';
        }

        exports.REGEXP_START_SUBSTR = REGEXP_START_SUBSTR;
        exports.REGEXP_END_SUBSTR = REGEXP_END_SUBSTR;
        exports.ATTR_REGEXP_METHOD_NAME = ATTR_REGEXP_METHOD_NAME;
        exports.CONTAINS_OWN_TEXT_METHOD_NAME = CONTAINS_EXCLUDE_CHILDREN_METHOD_NAME;
        exports.getOwnTextForSelector = getOwnTextForSelector;
        exports.init = init;

        return $;
    };

    exports.create($);
});
TestCafeClient.define('Base.jQueryExtensions.DataMethodProxy', function (require, exports) {
    // NOTE: Supporting $.data(elem, key) calling in test scenarios:
    // jQuery objects data is not shared between different instances of jQuery.
    // In the TestCafe scripts we use a local jQuery instance. Therefore we should make a proxy between
    // local instance of jQuery and tested page's instance of jQuery (if it exists)

    exports.setup = function (testCafeJQuery) {
        testCafeJQuery.fn._data = testCafeJQuery.fn.data;

        if (testCafeJQuery !== window.jQuery) {
            (function (undefined) {
                testCafeJQuery.fn.data = function () {
                    var elem = this[0],
                        rootJQuery = window.jQuery,
                        key = arguments[0],
                        value = arguments[1];

                    if (arguments.length === 2)
                        return this._data(key, value);

                    if (!rootJQuery || typeof rootJQuery(elem).data !== 'function')
                        return this._data(key);

                    if (!elem)
                        return this._data(key);

                    var res = this._data(key);

                    if (key === undefined)
                        return testCafeJQuery.extend(res, rootJQuery(elem).data());

                    if (res !== undefined)
                        return res;

                    var rootJQueryObject = rootJQuery(elem);

                    return rootJQueryObject.length ? rootJQueryObject.data(key) : undefined;
                };
            })();
        }
    };
});

TestCafeClient.define('ActionBarrier', function (require, exports) {
    var XhrBarrier = require('ActionBarrier.Xhr');

    //API

    //NOTE: actionSynchronizer provides XHRRequest auto-wait functionality via barrier mechanism.
    //Usually barriers are used for thread synchronization in operating systems
    //(see: http://en.wikipedia.org/wiki/Barrier_(computer_science)). But idea was adopted for
    //action/requests operations background.
    exports.init = function () {
        XhrBarrier.init();
    };

    exports.waitPageInitialization = function (callback) {
        XhrBarrier.waitPageInitialRequests(callback);
    };

    //NOTE: run action, wait for xhrWatch and iframeWatch response
    exports.waitActionSideEffectsCompletion = function (action, callback) {
        XhrBarrier.startBarrier(callback);

        action.call(window, function () {
            XhrBarrier.waitBarrier();
        });
    };
});
TestCafeClient.define('ActionBarrier.Xhr', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        Util = Hammerhead.Util,
        SharedErrors = require('Shared.Errors');

    //Const
    var INITIAL_REQUESTS_COLLECTION_DELAY = 300,
        ADDITIONAL_REQUESTS_COLLECTION_DELAY = 100,
        WAIT_PAGE_INITIAL_REQUESTS_DELAY = 50,
        PAGE_INITIALIZATION_CALLBACK_DELAY = 100;

    exports.BARRIER_TIMEOUT = 3000;
    exports.XHR_BARRIER_ERROR = 'error';
    exports.GLOBAL_START_XHR_BARRIER = 'tc-gsxb-d1417385';
    exports.GLOBAL_WAIT_XHR_BARRIER = 'tc-gwxb-d1417385';

    //Globals
    var barrierCtx = null,
        pageInitialReqsComplete = null,
        eventEmitter = new Util.EventEmitter();

    exports.events = eventEmitter;

    function initBarrierCtx(callback) {
        barrierCtx = {
            passed: false,
            collectingReqs: true,
            requests: [],
            reqCount: 0,

            callback: function () {
                if (!barrierCtx.passed) {
                    barrierCtx.passed = true;

                    if (barrierCtx.watchdog)
                        window.clearTimeout(barrierCtx.watchdog);

                    callback.apply(window, arguments);
                }
            },
            watchdog: null
        };
    }

    function onRequestsCollected() {
        barrierCtx.collectingReqs = false;

        if (barrierCtx.reqCount) {
            barrierCtx.watchdog = window.setTimeout(function () {
                eventEmitter.emit(exports.XHR_BARRIER_ERROR, {code: SharedErrors.XHR_REQUEST_TIMEOUT});
                barrierCtx.callback();
            }, exports.BARRIER_TIMEOUT);
        } else
            barrierCtx.callback();
    }

    function removeXhrFromQueue(xhr) {
        for (var i = 0; i < barrierCtx.requests.length; i++) {
            if (xhr === barrierCtx.requests[i]) {
                barrierCtx.requests.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    //API
    exports.init = function () {
        pageInitialReqsComplete = false;

        //NOTE: init barrier ctx and collect all page initial requests
        initBarrierCtx(function () {
            pageInitialReqsComplete = true;
        });

        Hammerhead.on(Hammerhead.XHR_SEND, function (e) {
            if (barrierCtx) {
                barrierCtx.reqCount++;
                barrierCtx.requests.push(e.xhr);
            }
        });

        Hammerhead.on(Hammerhead.XHR_ERROR, function (e) {
            //NOTE: previously this error used in possible fail causes, which are R.I.P. now.
            //So we just through errot to the console for the debugging purposes. In IE9 console.log
            //is defined only if dev tools are open.
            if (window.console && window.console.log)
                window.console.log('TestCafe encountered XHR error on page: ' + e.err);
            exports.events.emit(exports.XHR_BARRIER_ERROR, e.err);
        });

        Hammerhead.on(Hammerhead.XHR_COMPLETED, function (e) {
            //NOTE: let last real xhr-handler finish it's job and try to obtain any additional requests
            //if they were initiated by this handler
            window.setTimeout(function () {
                if (removeXhrFromQueue(e.xhr))
                    barrierCtx.reqCount--;

                if (!barrierCtx.collectingReqs && !barrierCtx.reqCount)
                    barrierCtx.callback();

            }, ADDITIONAL_REQUESTS_COLLECTION_DELAY);
        });
    };

    exports.waitPageInitialRequests = function (callback) {
        onRequestsCollected();

        var wait = function () {
            if (pageInitialReqsComplete)
                window.setTimeout(callback, PAGE_INITIALIZATION_CALLBACK_DELAY);
            else
                window.setTimeout(wait, WAIT_PAGE_INITIAL_REQUESTS_DELAY);
        };

        wait();
    };

    exports.startBarrier = function (callback) {
        initBarrierCtx(callback);
    };

    exports.waitBarrier = function () {
        //NOTE: collect initial XHR requests set, then wait for the requests to finish
        window.setTimeout(onRequestsCollected, INITIAL_REQUESTS_COLLECTION_DELAY);
    };

    window[exports.GLOBAL_START_XHR_BARRIER] = exports.startBarrier;
    window[exports.GLOBAL_WAIT_XHR_BARRIER] = exports.waitBarrier;
});



TestCafeClient.define('TestRunner.APIv2', function (require, exports) {
    var Select = require('TestRunner.APIv2.Select');

    exports.REPRODUCE_SELECTION_CHAIN_FUNC_KEY = Select.REPRODUCE_SELECTION_CHAIN_FUNC_KEY;

    exports.create = function (sandboxedJQuery) {
        return {
            select: new Select.SelectOperator(sandboxedJQuery)
        };
    };
});
TestCafeClient.define('TestRunner.APIv2.Select', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        Util = Hammerhead.Util;

    //Const
    //------------------------------------------------------------------------------------------------
    exports.REPRODUCE_SELECTION_CHAIN_FUNC_KEY = '__#TC_REPRODUCE_SELECTION_CHAIN_FUNC_KEY';


    //Selector token types
    //------------------------------------------------------------------------------------------------
    var START_TOKEN = 0,
        FILTER_TOKEN = 1,
        DESCENDANTS_SEARCH_TOKEN = 2,
        JQUERY_OBJECT_TOKEN = 3,
        INDEX_TOKEN = 4;


    //Convert selecting tokens sequence into reusable selecting function
    //------------------------------------------------------------------------------------------------
    function createSelectingFunc($, tokens) {
        return function () {
            var $result = null;

            for (var i = 0; i < tokens.length; i++) {
                var type = tokens[i].type,
                    selector = tokens[i].selector,
                    fnSelector = typeof selector === 'function';

                if (type === START_TOKEN)
                    $result = fnSelector ? $('*').filter(selector) : $(selector);

                else if (type === FILTER_TOKEN)
                    $result = $result.filter(selector);

                else if (type === DESCENDANTS_SEARCH_TOKEN)
                    $result = fnSelector ? $result.find('*').filter(selector) : $result.find(selector);

                else if (type === JQUERY_OBJECT_TOKEN)
                    $result = selector;

                else if (type === INDEX_TOKEN)
                    $result = $result.eq(selector);
            }

            return $result;
        };
    }

    //Selectors
    //------------------------------------------------------------------------------------------------
    var Selectors = function (hostOperator) {
        this.hostOperator = hostOperator;
    };

    Selectors.prototype.id = function (id) {
        if (typeof id === 'string')
            return this.hostOperator.$('#' + id);

        if (id instanceof RegExp)
            return this.attr('id', id);

        return this.hostOperator.$('');
    };

    Selectors.prototype.tag = function (tagName) {
        return this.hostOperator.$(tagName);
    };

    Selectors.prototype.class = function (className) {
        return this.hostOperator.$('.' + className);
    };

    Selectors.prototype.text = function (text) {
        var isRegExp = text instanceof RegExp;

        if (typeof text !== 'string' && !isRegExp)
            return this.hostOperator.$('');

        //NOTE: this is different from ':containsExcludeChildren'. Now we can don't care about escaping the string
        //and we can pass regexp.
        return this.hostOperator.$(function () {
            var element = this,
                elementText = '',
                tn = element.tagName.toLowerCase();

            if (tn === 'script' || tn === 'style')
                return false;

            for (var i = 0; i < element.childNodes.length; i++) {
                if (element.childNodes[i].nodeType === 3 && element.childNodes[i].data)
                    elementText += element.childNodes[i].data;
            }

            if (isRegExp)
                return text.test(elementText);
            else
                return elementText.indexOf(text) > -1;
        });
    };

    Selectors.prototype.attr = function (name, value) {
        if (typeof name !== 'string')
            return this.hostOperator.$('');

        if (typeof value === 'string')
            return this.hostOperator.$('[' + name + '=\'' + value + '\']');

        if (value instanceof RegExp) {
            return this.hostOperator.$(function () {
                return this.hasAttribute(name) && value.test(this.getAttribute(name));
            });
        }

        return this.hostOperator.$('[' + name + ']');
    };

    Selectors.prototype.name = function (value) {
        if (typeof value !== 'string' && !(value instanceof RegExp))
            return this.hostOperator.$('');

        return this.attr('name', value);
    };


    //Base class for all operators
    //------------------------------------------------------------------------------------------------
    var OperatorBase = function (jQuery, chainTokens, $cachedSelection) {
        this.chainTokens = chainTokens || [];
        this.jQuery = jQuery;
        this.allowCacheForAndOperator = true;
        this.$cachedSelection = $cachedSelection;
    };

    //Pure virtual
    OperatorBase.prototype._addSelectorToTokenSequence = null;

    OperatorBase.prototype.$ = function (selector) {
        var $result = null;

        //NOTE: slice token sequence, so mutations in this operator will not affect parent operators
        //and current operator (previous chain parts can be reused).
        var tokens = this.chainTokens.slice(0);
        this._addSelectorToTokenSequence(selector, tokens);

        //NOTE: now let's create function which will be able to reproduce whole selection chain.
        //It will be used later by actions API to wait for element to appear.
        var reproduceSelectionChainFunc = createSelectingFunc(this.jQuery, tokens);

        //NOTE: now let's get result of the current operator. If we have cached previous result we will
        //create selecting function using it, so we will not reproduce whole chain and just apply latest
        //operator to the cached result.
        if (this.$cachedSelection) {
            tokens = [
                {type: JQUERY_OBJECT_TOKEN, selector: this.$cachedSelection}
            ];

            this._addSelectorToTokenSequence(selector, tokens);
            $result = createSelectingFunc(this.jQuery, tokens)();
        }

        else
            $result = reproduceSelectionChainFunc();

        //NOTE: since we have already selected something we should append 'in' and 'and' operators to result
        $result.in = new InOperator(this.jQuery, tokens, $result);
        $result.and = new AndOperator(this.jQuery, tokens, this.allowCacheForAndOperator && $result);
        $result[exports.REPRODUCE_SELECTION_CHAIN_FUNC_KEY] = reproduceSelectionChainFunc;

        return $result;
    };


    //Base class for indexable operators
    //------------------------------------------------------------------------------------------------
    var IndexableOperatorBase = function (jQuery, chainTokens, $cachedSelection) {
        OperatorBase.call(this, jQuery, chainTokens, $cachedSelection);
    };

    Util.inherit(IndexableOperatorBase, OperatorBase);

    //TODO define it on 'in' and 'select' operators prototype
  /*  Object.defineProperties(IndexableOperatorBase.prototype, {
        //NOTE: just a shortcut for .nth(0)
        first: {
            enumerable: true,

            get: function () {
                return this.nth(0);
            }
        }
    });*/

    IndexableOperatorBase.prototype.nth = function (index) {
        var tokens = this.chainTokens.slice(0);

        //NOTE: indexing token should be first, since we haven't applied general selector, whitch will add START_TOKEN:
        //select.first -> [INDEX_TOKEN]
        //select.first.by.id() -> [START_TOKEN, INDEX_TOKEN] - index token pushed forward by start
        //Same goes for 'in' operator.
        tokens.splice(0, 0, {
            type: INDEX_TOKEN,
            selector: index
        });

        //NOTE: recreate yourself with applied indexer, so chain before indexer can be reused.
        var indexedOp = new this.constructor(this.jQuery, tokens, null);

        //NOTE: Also, disable cache for 'and' operator:

        //var R1 = select.nth(3).by.class('yo') -> $('.yo').eq(3);
        //var R2 = R1.and.class('beep') -> $('.yo').eq(3).filter('.beep') - WRONG!

        //Correct expression should be:

        //var R2 = $('.yo').filter('.beep').eq(3)

        //So, we should rebuild chain to achieve this.
        indexedOp.allowCacheForAndOperator = false;

        return indexedOp;
    };


    //Select
    //------------------------------------------------------------------------------------------------
    var SelectOperator = exports.SelectOperator = function (jQuery) {
        IndexableOperatorBase.call(this, jQuery);

        //NOTE: normally you should use .by, but we will make things more relaxing, to make user care less about words
        this.by = this.with = new Selectors(this);
    };

    Util.inherit(SelectOperator, IndexableOperatorBase);

    SelectOperator.prototype._addSelectorToTokenSequence = function (selector, tokens) {
        tokens.splice(0, 0, {
            type: START_TOKEN,
            selector: selector
        });
    };


    //In
    //------------------------------------------------------------------------------------------------
    var InOperator = function (jQuery, chainTokens, $cachedSelection) {
        IndexableOperatorBase.call(this, jQuery, chainTokens, $cachedSelection);

        //NOTE: 'and' operator can't use cache after 'in' operator:

        //var R1 = select.by.class('yo') -> $('.yo')
        //var R2 = R1.in.with.class('beep') -> $('.beep').find($('.yo'))
        //var R3 = R2.and.with.tag('div') -> $('div').filter($('.beep').find($('.yo'))) - WRONG!

        //The expression above expects parent selection [$('div')] to contain result of previous
        //parent selection [$('.beep').find($('.yo'))] at the same level of hierarchy, which obviously
        //will not work. The correct expression should be:

        //var R3 = $('div').filter($('.beep')).find($('.yo'))

        //But we can't achieve it without rebuilding whole chain, so caching should be disabled.
        this.allowCacheForAndOperator = false;

        //NOTE: normally you should use .by, but we will make things more relaxing, to make user care less about words
        this.with = this.by = new Selectors(this);
    };

    Util.inherit(InOperator, IndexableOperatorBase);

    InOperator.prototype._addSelectorToTokenSequence = function (selector, tokens) {
        //NOTE: 'in' operator means that we filtering selection parent. So we need to reorder tokens
        //since we need to select parent first in jQuery. So first non-indexing token becomes DESCENDANTS_SEARCH_TOKEN
        //while 'in'-operator selector becomes new 'start'.
        for (var i = 0; i < tokens.length; i++) {
            if (tokens[i].type !== INDEX_TOKEN) {
                tokens[i].type = DESCENDANTS_SEARCH_TOKEN;
                break;
            }
        }

        tokens.splice(0, 0, {
            type: START_TOKEN,
            selector: selector
        });
    };


    //Add
    //------------------------------------------------------------------------------------------------
    var AndOperator = function (jQuery, chainTokens, $cachedSelection) {
        //NOTE: 'and' operator doesn't have intermediate pronoun (like 'by' or 'with'), so it's a director
        //descendant of Selectors. However we will add .by and .with, to make user care less about words
        Selectors.call(this, this);
        OperatorBase.call(this, jQuery, chainTokens, $cachedSelection);

        this.with = this.by = this;
    };

    Util.inherit(AndOperator, OperatorBase);
    Util.inherit(AndOperator, Selectors);

    AndOperator.prototype._addSelectorToTokenSequence = function (selector, tokens) {
        //NOTE: 'and' operator should be applied to the latest 'select'-operator or 'in'-operator
        //result. Since both results are always in the current 'start' we should insert token
        //as the second in the sequence.
        tokens.splice(1, 0, {
            type: FILTER_TOKEN,
            selector: selector
        });
    };

});

TestCafeClient.define('TestRunner.IFrameTestRunner', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        Util = Hammerhead.Util,
        MessageSandbox = Hammerhead.MessageSandbox,
        jQuerySelectorExtensions = require('Base.jQueryExtensions.Selectors'),
        DialogsAPI = require('TestRunner.API.Dialogs'),

        TestRunnerBase = require('TestRunner.TestRunnerBase'),
        Settings = require('Settings');

    var IFrameTestRunner = this.exports = function (startedCallback) {
        TestRunnerBase.apply(this, [startedCallback]);
    };

    Util.inherit(IFrameTestRunner, TestRunnerBase);

    IFrameTestRunner.prototype._initPageLoadBarrier = function () {
    };

    IFrameTestRunner.prototype._prepareStepsExecuting = function (callback) {
        jQuerySelectorExtensions.init();
        callback();
    };

    IFrameTestRunner.prototype._onTestComplete = function (e) {
        var completeMsg = {
            cmd: TestRunnerBase.IFRAME_STEP_COMPLETED_CMD
        };

        this._onSetStepsSharedData({
            stepsSharedData: this.testIterator.getSharedData(),
            callback: function () {
                MessageSandbox.sendServiceMsg(completeMsg, window.top);
                e.callback();
            }
        });
    };

    IFrameTestRunner.prototype._onNextStepStarted = function (e) {
        var msg = {
            cmd: TestRunnerBase.IFRAME_NEXT_STEP_STARTED_CMD
        };

        MessageSandbox.sendServiceMsg(msg, window.top);
        e.callback();
    };

    IFrameTestRunner.prototype._onActionTargetWaitingStarted = function () {
        MessageSandbox.sendServiceMsg({ cmd: TestRunnerBase.IFRAME_ACTION_TARGET_WAITING_STARTED_CMD }, window.top);
    };

    IFrameTestRunner.prototype._onActionRun = function () {
        MessageSandbox.sendServiceMsg({ cmd: TestRunnerBase.IFRAME_ACTION_RUN_CMD }, window.top);
    };

    IFrameTestRunner.prototype._onError = function (err) {

        if (!Settings.PLAYBACK || err.dialog)
            this.testIterator.stop();

        var msg = {
            cmd: TestRunnerBase.IFRAME_ERROR_CMD,
            err: err
        };

        MessageSandbox.sendServiceMsg(msg, window.top);
    };

    IFrameTestRunner.prototype._onAssertionFailed = function (e) {
        var msg = {
            cmd: TestRunnerBase.IFRAME_FAILED_ASSERTION_CMD,
            err: e
        };

        this.testIterator.state.needScreeshot = true;

        MessageSandbox.sendServiceMsg(msg, window.top);

        if (Settings.PLAYBACK)
            this.testIterator.stop();
    };

    IFrameTestRunner.prototype._onSetStepsSharedData = function (e) {
        var msg = {
            cmd: TestRunnerBase.IFRAME_SET_SHARED_DATA_CMD,
            sharedData: e.stepsSharedData
        };

        MessageSandbox.sendServiceMsg(msg, window.top);
        e.callback();
    };

    IFrameTestRunner.prototype._onGetStepsSharedData = function (e) {
        var msg = {
            cmd: TestRunnerBase.IFRAME_GET_SHARED_DATA_REQUEST_CMD
        };

        MessageSandbox.sendServiceMsg(msg, window.top);

        function onMessage(response) {
            if (response.message.cmd === TestRunnerBase.IFRAME_GET_SHARED_DATA_RESPONSE_CMD) {
                MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
                e.callback(response.message.sharedData);
            }
        }

        MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
    };

    IFrameTestRunner.prototype._onExpectInactivity = function (e) {
        var msg = {
            cmd: TestRunnerBase.IFRAME_EXPECT_INACTIVITY_CMD,
            duration: e.duration
        };

        MessageSandbox.sendServiceMsg(msg, window.top);
        e.callback();
    };

    IFrameTestRunner.prototype._onTakeScreenshot = function (e) {
        var msg = {
            cmd: TestRunnerBase.IFRAME_TAKE_SCREENSHOT_REQUEST_CMD,
            isFailedStep: e.isFailedStep
        };

        MessageSandbox.sendServiceMsg(msg, window.top);

        function onMessage(response) {
            if (response.message.cmd === TestRunnerBase.IFRAME_TAKE_SCREENSHOT_RESPONSE_CMD) {
                MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
                if (e && e.callback)
                    e.callback();
            }
        }

        MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
    };

    IFrameTestRunner.prototype.onStepCompleted = function () {
        DialogsAPI.checkExpectedDialogs();
    };

    IFrameTestRunner.prototype._onDialogsInfoChanged = function (info) {
        var msg = {
            cmd: TestRunnerBase.IFRAME_NATIVE_DIALOGS_INFO_CHANGED_CMD,
            info: info
        };

        MessageSandbox.sendServiceMsg(msg, window.top);
    };

    IFrameTestRunner.prototype._onBeforeUnload = function () {
        var iFrameTestRunner = this,
            msg = {
                cmd: TestRunnerBase.IFRAME_BEFORE_UNLOAD_REQUEST_CMD
            };

        function onMessage(response) {
            if (response.message.cmd === TestRunnerBase.IFRAME_BEFORE_UNLOAD_RESPONSE_CMD) {

                MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);

                if (response.message.res) {
                    if (iFrameTestRunner.testIterator.state.stepDelayTimeout) {
                        window.clearTimeout(iFrameTestRunner.testIterator.state.stepDelayTimeout);
                        iFrameTestRunner.testIterator.state.stepDelayTimeout = null;
                    }

                    iFrameTestRunner.testIterator.state.pageUnloading = false;
                    iFrameTestRunner.testIterator._runStep();
                }
            }
        }

        MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);

        MessageSandbox.sendServiceMsg(msg, window.top);
    };
});

TestCafeClient.define('TestRunner.API.Actions', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        async = Hammerhead.async,
        Util = Hammerhead.Util,
        JSProcessor = Hammerhead.JSProcessor,
        SharedErrors = require('Shared.Errors'),
        SharedConst = require('Shared.Const'),
        Settings = require('Settings'),
        SourceIndexTracker = require('TestRunner.SourceIndexTracker'),
        ContentEditableHelper = Hammerhead.ContentEditableHelper,
        Automation = require('Automation'),
        ClickPlaybackAutomation = require('Automation.Click.Playback'),
        RClickPlaybackAutomation = require('Automation.RClick.Playback'),
        DblClickPlaybackAutomation = require('Automation.DblClick.Playback'),
        DragPlaybackAutomation = require('Automation.Drag.Playback'),
        SelectPlaybackAutomation = require('Automation.Select.Playback'),
        TypePlaybackAutomation = require('Automation.Type.Playback'),
        PressPlaybackAutomation = require('Automation.Press.Playback'),
        HoverPlaybackAutomation = require('Automation.Hover.Playback');

    //NOTE: published for tests purposes only
    exports.ELEMENT_AVAILABILITY_WAITING_TIMEOUT = 10000;

    var ELEMENT_AVAILABILITY_WAITING_DELAY = 200,
        WAIT_FOR_DEFAULT_TIMEOUT = 10000,
        CHECK_CONDITION_INTERVAL = 50;

    //Global
    var testIterator = null;

    function failWithError(code, additionalParams) {
        var err = {
            code: code,
            stepName: Settings.CURRENT_TEST_STEP_NAME,
            __sourceIndex: SourceIndexTracker.currentIndex
        };

        if (additionalParams) {
            Util.forEachKey(additionalParams, function (param) {
                err[param] = additionalParams[param];
            });
        }

        testIterator.onError(err);
    }

    function ensureElementsExist(item, actionName, callback) {
        var success = false;

        var ensureExists = function () {
            var array = null;

            if (typeof item === 'function') {
                var res = item();

                array = Util.ensureArray(res);

                if (res && !(Util.isJQueryObj(res) && !res.length) && array.length) {
                    callback(array);
                    return true;
                }
            }
            else if (typeof item === 'string') {
                array = Util.parseActionArgument(item, actionName);

                if (array && array.length) {
                    callback(array);
                    return true;
                }
            }

            return false;
        };

        if (ensureExists())
            return;

        var interval = window.setInterval(function () {
            if (ensureExists()) {
                success = true;
                window.clearInterval(interval);
            }
        }, ELEMENT_AVAILABILITY_WAITING_DELAY);

        window.setTimeout(function () {
            if (!success) {
                window.clearInterval(interval);
                failWithError(SharedErrors.API_EMPTY_FIRST_ARGUMENT, {action: actionName});
            }
        }, exports.ELEMENT_AVAILABILITY_WAITING_TIMEOUT);
    }

    function ensureElementVisibility(element, actionName, callback) {
        var success = false;

        if (Util.isElementVisible(element) || element.tagName.toLowerCase() === 'option' ||
            element.tagName.toLowerCase() === 'optgroup') {
            callback();
            return;
        }

        var interval = window.setInterval(function () {
            if (Util.isElementVisible(element)) {
                success = true;
                window.clearInterval(interval);
                callback();
            }
        }, ELEMENT_AVAILABILITY_WAITING_DELAY);

        window.setTimeout(function () {
            if (!success) {
                window.clearInterval(interval);

                failWithError(SharedErrors.API_INVISIBLE_ACTION_ELEMENT, {
                    element: Util.getElementDescription(element),
                    action: actionName
                });
            }
        }, exports.ELEMENT_AVAILABILITY_WAITING_TIMEOUT);
    }

    function actionArgumentsIterator(actionName) {
        var runAction = null;

        var iterate = function (item, iterationCallback) {
            if ($.isArray(item))
                extractArgs(item, iterationCallback);
            else if (typeof item === 'function') {
                ensureElementsExist(item, actionName, function (elementsArray) {
                    extractArgs(elementsArray, iterationCallback);
                });
            }
            else if (typeof item === 'string') {
                ensureElementsExist(item, actionName, function (elementsArray) {
                    runAction(elementsArray, iterationCallback);
                });
            }
            else {
                var elementsArray = Util.parseActionArgument(item, actionName);
                if (!elementsArray || elementsArray.length < 1)
                    failWithError(SharedErrors.API_EMPTY_FIRST_ARGUMENT, {action: actionName});
                else
                    runAction(elementsArray, iterationCallback);
            }
        };

        var extractArgs = function (items, callback) {
            if (!items.length) {
                failWithError(SharedErrors.API_EMPTY_FIRST_ARGUMENT, {action: actionName});
            }
            else {
                async.forEachSeries(
                    items,
                    function (item, seriaCallback) {
                        iterate(item, seriaCallback);
                    },
                    function () {
                        callback();
                    }
                );
            }
        };

        return {
            run: function (items, actionRunner, callback) {
                onTargetWaitingStarted();
                runAction = actionRunner;
                extractArgs(items, callback);
            }
        };
    }

    function pressActionArgumentsIterator() {
        return {
            run: function (items, actionRunner, callback) {
                actionRunner(items, callback);
            }
        };
    }

    function onTargetWaitingStarted(isWaitAction) {
        testIterator.onActionTargetWaitingStarted({
            maxTimeout: exports.ELEMENT_AVAILABILITY_WAITING_TIMEOUT,
            isWaitAction: isWaitAction
        });
    }

    function onTargetWaitingFinished() {
        testIterator.onActionRun();
    }

    exports.init = function (iterator) {
        testIterator = iterator;
    };

    exports.click = function (what, options) {
        var actionStarted = false,
            elements = Util.ensureArray(what);

        testIterator.asyncActionSeries(
            elements,
            actionArgumentsIterator('click').run,
            function (element, callback, iframe) {
                ensureElementVisibility(element, 'click', function () {
                    function onerror(err) {
                        failWithError(err.code, {
                            element: err.element,
                            action: 'click'
                        });
                    }

                    if (!actionStarted) {
                        actionStarted = true;
                        onTargetWaitingFinished();
                    }

                    if (iframe)
                        iframe.contentWindow[Automation.AUTOMATION_RUNNERS].click.playback.run(element, options ||
                        {}, callback, onerror);
                    else
                        ClickPlaybackAutomation.run(element, options || {}, callback, onerror);
                });
            });
    };

    exports.rclick = function (what, options) {
        var actionStarted = false,
            elements = Util.ensureArray(what);

        testIterator.asyncActionSeries(
            elements,
            actionArgumentsIterator('rclick').run,
            function (element, callback, iframe) {
                ensureElementVisibility(element, 'rclick', function () {
                    if (!actionStarted) {
                        actionStarted = true;
                        onTargetWaitingFinished();
                    }

                    if (iframe)
                        iframe.contentWindow[Automation.AUTOMATION_RUNNERS].rclick.playback.run(element, options ||
                        {}, callback);
                    else
                        RClickPlaybackAutomation.run(element, options || {}, callback);
                });
            });
    };

    exports.dblclick = function (what, options) {
        var actionStarted = false,
            elements = Util.ensureArray(what);

        testIterator.asyncActionSeries(
            elements,
            actionArgumentsIterator('dblclick').run,
            function (element, callback, iframe) {
                ensureElementVisibility(element, 'dblclick', function () {
                    if (!actionStarted) {
                        actionStarted = true;
                        onTargetWaitingFinished();
                    }

                    if (iframe)
                        iframe.contentWindow[Automation.AUTOMATION_RUNNERS].dblclick.playback.run(element, options ||
                        {}, callback);
                    else
                        DblClickPlaybackAutomation.run(element, options || {}, callback);
                });
            });
    };

    exports.drag = function (what) {
        var actionStarted = false,
            args = arguments,
            elements = Util.ensureArray(what);

        var secondArgIsCoord = !(isNaN(parseInt(args[1])));

        var to = args.length > 2 && secondArgIsCoord ? {dragOffsetX: args[1], dragOffsetY: args[2]} : args[1];

        if (!to) {
            failWithError(SharedErrors.API_INCORRECT_DRAGGING_SECOND_ARGUMENT);
            return;
        }
        if (Util.isJQueryObj(to)) {
            if (to.length < 1) {
                failWithError(SharedErrors.API_INCORRECT_DRAGGING_SECOND_ARGUMENT);
                return;
            }
            else
                to = to[0];
        }
        else if (!Util.isDomElement(to) && (isNaN(parseInt(to.dragOffsetX)) || isNaN(parseInt(to.dragOffsetY)))) {
            failWithError(SharedErrors.API_INCORRECT_DRAGGING_SECOND_ARGUMENT);
            return;
        }

        var options = secondArgIsCoord ? args[3] : args[2];

        testIterator.asyncActionSeries(
            elements,
            actionArgumentsIterator('drag').run,
            function (element, callback, iframe) {
                ensureElementVisibility(element, 'drag', function () {
                    if (!actionStarted) {
                        actionStarted = true;
                        onTargetWaitingFinished();
                    }

                    if (iframe)
                        iframe.contentWindow[Automation.AUTOMATION_RUNNERS].drag.playback.run(element, to, options ||
                        {}, callback);
                    else
                        DragPlaybackAutomation.run(element, to, options || {}, callback);
                });
            });
    };

    exports.select = function () {
        var actionStarted = false,
            elements = Util.ensureArray(arguments[0]),
            args = $.makeArray(arguments).slice(1),
            secondArg = null,
            options = {},
            error = false,
            commonParent = null;

        if (!arguments[0])
            failWithError(SharedErrors.API_INCORRECT_SELECT_ACTION_ARGUMENTS);

        if (args.length === 1) {
            //NOTE: second action argument is jquery object
            if (Util.isJQueryObj(args[0])) {
                if (args[0].length < 1) {
                    failWithError(SharedErrors.API_INCORRECT_SELECT_ACTION_ARGUMENTS);
                    return;
                }
                else
                    secondArg = args[0][0];
            }
            else
                secondArg = args[0];
        }

        //NOTE: second action argument is dom element or node
        if (args.length === 1 && (Util.isDomElement(secondArg) || Util.isTextNode(secondArg))) {
            if (Util.isNotVisibleNode(secondArg))
                error = true;
            else {
                options.startNode = Util.isJQueryObj(elements[0]) ? elements[0][0] : elements[0];
                options.endNode = secondArg;

                if (!Util.isContentEditableElement(options.startNode) || !Util.isContentEditableElement(options.endNode))
                    error = true;
                else {
                    //NOTE: We should find element for perform select action
                    commonParent = ContentEditableHelper.getNearestCommonAncestor(options.startNode, options.endNode);
                    if (!commonParent)
                        error = true;
                    else if (Util.isTextNode(commonParent)) {
                        if (!commonParent.parentElement)
                            error = true;
                        else
                            elements = [commonParent.parentElement];
                    }
                    else
                        elements = [commonParent];
                }
            }
        }
        else {
            $.each(args, function (index, value) {
                if (isNaN(parseInt(value)) || (args.length > 1 && value < 0)) {
                    error = true;
                    return false;
                }
            });
        }

        if (error) {
            failWithError(SharedErrors.API_INCORRECT_SELECT_ACTION_ARGUMENTS);
            return;
        }

        testIterator.asyncActionSeries(
            elements,
            actionArgumentsIterator('select').run,
            function (element, callback, iframe) {
                if (args.length === 1 && !options.startNode)
                    options = {offset: args[0]};
                else if (args.length === 2 || (args.length > 2 && element.tagName.toLowerCase() !== 'textarea'))
                    options = {
                        startPos: args[0],
                        endPos: args[1]
                    };
                else if (args.length > 2)
                    options = {
                        startLine: args[0],
                        startPos: args[1],
                        endLine: args[2],
                        endPos: args[3]
                    };

                ensureElementVisibility(element, 'select', function () {
                    if (!actionStarted) {
                        actionStarted = true;
                        onTargetWaitingFinished();
                    }

                    if (iframe)
                        iframe.contentWindow[Automation.AUTOMATION_RUNNERS].select.playback.run(element, options, callback);
                    else
                        SelectPlaybackAutomation.run(element, options, callback);
                });
            });
    };

    exports.type = function (what, text, options) {
        if (!text) {
            failWithError(SharedErrors.API_EMPTY_TYPE_ACTION_ARGUMENT);
            return;
        }

        var actionStarted = false,
            elements = Util.ensureArray(what);

        testIterator.asyncActionSeries(
            elements,
            actionArgumentsIterator('type').run,
            function (element, callback, iframe) {
                ensureElementVisibility(element, 'type', function () {
                    if (!actionStarted) {
                        actionStarted = true;
                        onTargetWaitingFinished();
                    }

                    if (iframe)
                        iframe.contentWindow[Automation.AUTOMATION_RUNNERS].type.playback.run(element, text, options ||
                        {}, callback);
                    else
                        TypePlaybackAutomation.run(element, text, options || {}, callback);
                });
            });
    };

    exports.hover = function (what, options) {
        var actionStarted = false,
            elements = Util.ensureArray(what);

        testIterator.asyncActionSeries(
            elements,
            actionArgumentsIterator('hover').run,
            function (element, callback, iframe) {
                ensureElementVisibility(element, 'hover', function () {
                    if (!actionStarted) {
                        actionStarted = true;
                        onTargetWaitingFinished();
                    }

                    if (iframe)
                        iframe.contentWindow[Automation.AUTOMATION_RUNNERS].hover.playback.run(element, callback);
                    else
                        HoverPlaybackAutomation.run(element, options || {}, callback);
                });
            });
    };

    exports.press = function () {
        testIterator.asyncActionSeries(
            arguments,
            pressActionArgumentsIterator().run,
            function (keys, callback) {
                if (Util.parseKeysString(keys).error)
                    failWithError(SharedErrors.API_INCORRECT_PRESS_ACTION_ARGUMENT);

                else
                    PressPlaybackAutomation.run(keys, callback);
            });
    };

    //wait
    var conditionIntervalId = null;

    function startConditionCheck(condition, onConditionReached) {
        conditionIntervalId = window.setInterval(function () {
            if (testIterator.callWithSharedDataContext(condition))
                onConditionReached();
        }, CHECK_CONDITION_INTERVAL);
    }

    function stopConditionCheck() {
        if (conditionIntervalId !== null) {
            window.clearInterval(conditionIntervalId);
            conditionIntervalId = null;
        }
    }

    exports.wait = function (ms, condition) {
        condition = typeof(condition) === 'function' ? condition : null;

        if (typeof ms !== 'number' || ms < 0) {
            failWithError(SharedErrors.API_INCORRECT_WAIT_ACTION_MILLISECONDS_ARGUMENT);
            return;
        }

        testIterator.asyncAction(function (iteratorCallback) {
            testIterator.expectInactivity(ms, function () {
                function onConditionReached() {
                    window.clearTimeout(timeout);
                    stopConditionCheck();
                    iteratorCallback();
                }

                var timeout = window.setTimeout(onConditionReached, ms || 0);

                if (condition)
                    startConditionCheck(condition, onConditionReached);
            });
        });
    };

    exports.waitFor = function (event, timeout) {
        var waitForElements = Util.isStringOrStringArray(event, true),
            timeoutExceeded = false;

        if (typeof event !== 'function' && !waitForElements) {
            failWithError(SharedErrors.API_INCORRECT_WAIT_FOR_ACTION_EVENT_ARGUMENT);
            return;
        }

        if (typeof timeout === 'undefined')
            timeout = WAIT_FOR_DEFAULT_TIMEOUT;

        if (typeof timeout !== 'number' || timeout < 0) {
            failWithError(SharedErrors.API_INCORRECT_WAIT_FOR_ACTION_TIMEOUT_ARGUMENT);
            return;
        }

        onTargetWaitingStarted(true);

        testIterator.asyncAction(function (iteratorCallback) {
            var timeoutID = window.setTimeout(function () {
                if (waitForElements)
                    stopConditionCheck();

                timeoutExceeded = true;
                failWithError(SharedErrors.API_WAIT_FOR_ACTION_TIMEOUT_EXCEEDED);
            }, timeout);

            function onConditionReached() {
                if (timeoutExceeded)
                    return;

                if (waitForElements)
                    stopConditionCheck();

                window.clearTimeout(timeoutID);
                onTargetWaitingFinished();
                iteratorCallback();
            }


            testIterator.expectInactivity(timeout, function () {
                var condition = null;

                if (waitForElements) {
                    if (typeof event === 'string') {
                        condition = function () {
                            return !!$(event).length;
                        };
                    }
                    else {
                        condition = function () {
                            var elementsExist = true;

                            for (var i = 0; i < event.length; i++) {
                                if (!$(event[i]).length) {
                                    elementsExist = false;
                                    break;
                                }
                            }

                            return elementsExist;
                        };
                    }

                    startConditionCheck(condition, onConditionReached);
                }
                else {
                    testIterator.callWithSharedDataContext(function () {
                        event.call(this, function () {
                            onConditionReached();
                        });
                    });
                }
            });
        });
    };

    exports.navigateTo = function (url) {
        var NAVIGATION_DELAY = 1000;

        testIterator.asyncAction(function (iteratorCallback) {
            window[JSProcessor.SET_PROPERTY_METH_NAME](window, 'location', url);

            //NOTE: give browser some time to navigate
            window.setTimeout(iteratorCallback, NAVIGATION_DELAY);
        });
    };

    exports.upload = function (what, path) {
        var actionStarted = false,
            elements = Util.ensureArray(what);

        if (!Util.isStringOrStringArray(path) && path)
            failWithError(SharedErrors.API_UPLOAD_INVALID_FILE_PATH_ARGUMENT);

        testIterator.asyncActionSeries(
            elements,
            actionArgumentsIterator('upload').run,
            function (element, callback) {
                if (!Util.isFileInput(element))
                    failWithError(SharedErrors.API_UPLOAD_ELEMENT_IS_NOT_FILE_INPUT);

                else {
                    if (!actionStarted) {
                        actionStarted = true;
                        onTargetWaitingFinished();
                    }

                    Hammerhead.upload(element, path, function (errs) {
                        if (errs.length) {
                            var errPaths = errs.map(function (err) {
                                return err.filePath;
                            });

                            failWithError(SharedErrors.API_UPLOAD_CAN_NOT_FIND_FILE_TO_UPLOAD, {filePaths: errPaths});
                        }

                        else
                            callback();
                    });
                }
            }
        );
    };

    exports.screenshot = function () {
        testIterator.asyncAction(function (iteratorCallback) {
            testIterator.takeScreenshot(function () {
                iteratorCallback();
            }, false);
        });
    };

    //NOTE: add sourceIndex wrapper
    SourceIndexTracker.wrapTrackableMethods(exports, SharedConst.ACTION_FUNC_NAMES);
});

TestCafeClient.define('TestRunner.API.Assertions', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        MessageSandbox = Hammerhead.MessageSandbox,
        SourceIndexTracker = require('TestRunner.SourceIndexTracker'),
        IFrameMessages = require('Base.CrossDomainMessages'),
        SharedErrors = require('Shared.Errors'),
        SharedConst = require('Shared.Const'),
        Settings = require('Settings');

    function createDiffObject(actual, expected) {
        return {
            actual: getDescription(actual),
            expected: getDescription(expected)
        };
    }

    function isElementsCollection(obj) {
        return obj instanceof NodeList || obj instanceof HTMLCollection;
    }

    function getObjectsDiff(actual, expected, comparablePath, checkedElements) {
        //We store references of object for resolving circular dependencies.
        //If actual and expected object already were in checkedElements, they are equal
        if(!checkedElements)
            checkedElements = {
                actual: {},
                expected: {}
            };

        if (actual === expected)
            return null;

        //date
        if (actual instanceof Date && expected instanceof Date) {
            var actualTime = actual.getTime(),
                expectedTime = expected.getTime();

            return actualTime === expectedTime ?
                null :
            {
                actual: actualTime,
                expected: expectedTime,
                isDates: true
            };
        }

        //strings
        if (typeof actual === 'string' && typeof expected === 'string')
            return getStringDiff(actual, expected);

        //arrays
        if ($.isArray(actual) || $.isArray(expected)) {
            return (!($.isArray(actual)) || !($.isArray(expected))) ?
                   createDiffObject(actual, expected) :
                   getArraysDiff(actual, expected);
        }

        //NodeList
        if (isElementsCollection(actual) || isElementsCollection(expected)) {
            if (!(isElementsCollection(actual)) || !(isElementsCollection(expected)))
                return createDiffObject(actual, expected);

            var $actual = $(actual),
                $expected = $(expected);

            return getArraysDiff($actual.get(), $expected.get()) ? createDiffObject($actual, $expected) : null;
        }

        //dom elements
        if (Util.isDomElement(actual) || Util.isDomElement(expected)) {
            if (!Util.isDomElement(actual) || !Util.isDomElement(expected) || actual !== expected)
                return createDiffObject(actual, expected);
            return null;
        }

        //jQuery objects
        if (Util.isJQueryObj(actual) || Util.isJQueryObj(expected)) {
            if (!Util.isJQueryObj(actual) || !Util.isJQueryObj(expected) || getArraysDiff(actual.get(), expected.get()))
                return createDiffObject(actual, expected);
            return null;
        }

        if (actual === null || typeof actual === 'undefined' || expected === null || typeof expected === 'undefined')
            return createDiffObject(actual, expected);

        //functions
        if (typeof actual === 'function' || typeof expected === 'function') {
            if (typeof actual !== 'function' || typeof expected !== 'function' || actual !== expected)
                return createDiffObject(actual, expected);
            return null;
        }

        //other pairs, not objects
        if (typeof actual !== 'object' || typeof expected !== 'object') {
            //NOTE: force comparison with cast here for jshint
            /* jshint -W116 */
            return actual == expected ? null : createDiffObject(actual, expected);
            /* jshint +W116 */
        }

        //objects
        if (actual.prototype !== expected.prototype)
            return createDiffObject(actual, expected);

        var actualKeys = getKeys(actual),
            expectedKeys = getKeys(expected);

        actualKeys.sort();
        expectedKeys.sort();

        var keysArrayDiff = getKeysDiff(actualKeys, expectedKeys);

        if (keysArrayDiff) {
            var keyDiff = keysArrayDiff.actual || keysArrayDiff.expected;

            return {
                key:  comparablePath ? [comparablePath, keyDiff].join('.') : keyDiff,
                actual: getDescription(actual[keyDiff], true),
                expected: getDescription(expected[keyDiff], true),
                isObjects: true
            };
        }

        var key = null,
            objectsDiff = null;

        for (var i = 0; i < actualKeys.length; i++) {
            key = actualKeys[i];
            var objectPath = comparablePath ? [comparablePath, key].join('.') : key;

            if(isCircularDependency(checkedElements.actual, actual[key]) && isCircularDependency(checkedElements.expected, expected[key]))
                return null;

            checkedElements.actual[objectPath] = actual[key];
            checkedElements.expected[objectPath] = expected[key];

            objectsDiff = getObjectsDiff(actual[key], expected[key], objectPath, checkedElements);

            if (objectsDiff) {
                return { //NOTE: if we're comparing not objects, we're specifying current path in object
                    key: objectsDiff.key ? objectsDiff.key : objectPath,
                    actual: objectsDiff.isArrays ? getDescription(actual[key]) : objectsDiff.actual,
                    expected: objectsDiff.isArrays ? getDescription(expected[key]) : objectsDiff.expected,
                    isObjects: true,
                    diffType: {
                        isObjects: objectsDiff.isObjects,
                        isArrays: objectsDiff.isArrays,
                        isStrings: objectsDiff.isStrings,
                        isDates: objectsDiff.isDates
                    }
                };
            }
        }

        return null;
    }

    function isCircularDependency(elements, obj) {
        if(typeof obj !== 'object' || obj === null)
            return false;

        for(var key in elements) {
            if(elements.hasOwnProperty(key) && elements[key] === obj)
                return true;
        }

        return false;
    }

    function getArrayDiffIndex(actual, expected) {
        for (var i = 0; i < Math.min(actual.length, expected.length); i++) {
            if (getObjectsDiff(actual[i], expected[i]))
                return i;
        }

        //NOTE: we compare length of arrays in the end, because otherwise first difference index will calculate incorrect
        //eg. [1,2,3,4], [1,3,3] - first difference index - 1, not 2
        if (actual.length !== expected.length)
            return Math.min(actual.length, expected.length);
        else
            return -1;
    }

    function getKeysDiff(actualKeys, expectedKeys) {
        var diffIndex = -1;

        for (var i = 0; i < Math.min(actualKeys.length, expectedKeys.length); i++) {
            if(actualKeys[i] !== expectedKeys[i])
                diffIndex = i;
        }

        if (actualKeys.length !== expectedKeys.length)
            diffIndex = Math.min(Math.max(actualKeys.length - 1, 0), Math.max(expectedKeys.length - 1, 0));

        if(diffIndex > -1)
            return {
                key: diffIndex,
                actual: getDescription(actualKeys[diffIndex], true),
                expected: getDescription(expectedKeys[diffIndex], true),
                isArrays: true
            };

        return null;
    }

    function getStringDiff(actual, expected) {
        var diffIndex = -1,
            minLength = Math.min(actual.length, expected.length);

        for(var strIndex = 0; strIndex < minLength; strIndex++) {
            if(actual[strIndex] !== expected[strIndex]) {
                diffIndex = strIndex;
                break;
            }
        }

        if(diffIndex < 0 && actual.length !== expected.length)
            diffIndex = minLength ? minLength - 1 : 0;

        if(diffIndex > -1)
            return {
                key: diffIndex,
                actual: getDescription(actual),
                expected: getDescription(expected),
                isStrings: true
            };

        return null;
    }

    function getArraysDiff(actual, expected) {
        var diffIndex = getArrayDiffIndex(actual, expected),
            diffType = {};

        if(typeof actual[diffIndex] === 'string' && typeof expected[diffIndex] === 'string') {
            diffType.isStrings = true;
            diffType.diffIndex = getStringDiff(actual[diffIndex], expected[diffIndex]).key;
        } else if(actual[diffIndex] instanceof Date && expected[diffIndex] instanceof Date)
            diffType.isDates = true;

        if(diffIndex > -1)
            return {
                key: diffIndex,
                actual: diffType.isDates ? actual[diffIndex].getTime() : getDescription(actual[diffIndex]),
                expected: diffType.isDates ? expected[diffIndex].getTime() : getDescription(expected[diffIndex]),
                isArrays: true,
                diffType: diffType
            };

        return null;
    }

    function getKeys(obj) {
        var keys = [];

        Util.forEachKey(obj, function (key) {
            keys.push(key);
        });

        return keys;
    }

    function getDescription(obj, doNotWrapStr) {
        if(typeof obj === 'string' && !doNotWrapStr)
            return '\'' + obj + '\'';

        if (obj instanceof Date || /string|number|boolean|function/.test(typeof obj))
            return obj.toString();

        //arrays
        if ($.isArray(obj))
        {
            return getArrayDescription(obj);   }

        //jQuery objects
        if (Util.isJQueryObj(obj))
            return getArrayDescription($.makeArray(obj));

        if (obj === null)
            return 'null';

        if (typeof obj === 'undefined')
            return 'undefined';

        if (Util.isDomElement(obj))
            return Util.getElementDescription(obj);

        try{
            return JSON.stringify(obj);
        } catch(e) {
            //NOTE: we don't return all object's fields description, because it may be too long
            return obj.toString();
        }
    }

    function getArrayDescription(arr) {
        var resArr = [];

        for (var i = 0; i < arr.length; i++)
            resArr.push(getDescription(arr[i]));

        return '[' + resArr.join(', ') + ']';
    }

    var AssertionsAPI = this.exports = function (onAssertionFailed) {
        this.onAssertionFailed = onAssertionFailed;
    };

    AssertionsAPI.prototype._fail = function (err) {
        err.stepName = Settings.CURRENT_TEST_STEP_NAME;
        err.__sourceIndex = SourceIndexTracker.currentIndex;
        this.onAssertionFailed(err);
    };

    AssertionsAPI.prototype.ok = function (actual, message) {
        if (!actual) {
            this._fail({
                code: SharedErrors.API_OK_ASSERTION_FAILED,
                message: message,
                actual: getDescription(actual)
            });
        }
    };

    AssertionsAPI.prototype.notOk = function (actual, message) {
        if (actual) {
            this._fail({
                code: SharedErrors.API_NOT_OK_ASSERTION_FAILED,
                message: message,
                actual: getDescription(actual)
            });
        }
    };

    AssertionsAPI.prototype.eq = function (actual, expected, message) {
        var diff = getObjectsDiff(actual, expected);

        if (diff) {
            this._fail({
                code: SharedErrors.API_EQUAL_ASSERTION_FAILED,
                message: message,
                actual: diff.actual,
                expected: diff.expected,
                key: diff.key,
                isStrings: diff.isStrings,
                isArrays: diff.isArrays,
                isObjects: diff.isObjects,
                isDates: diff.isDates,
                diffType: diff.diffType || {}
            });
        }
    };

    AssertionsAPI.prototype.notEq = function (actual, unexpected, message, callback) {
        var diff = getObjectsDiff(actual, unexpected);

        if (!diff) {
            this._fail({
                code: SharedErrors.API_NOT_EQUAL_ASSERTION_FAILED,
                message: message,
                actual: getDescription(actual),
                callback: callback
            });
        }
        else if (callback)
            callback();
    };

    AssertionsAPI.assert = function (operator, args, callback, context) {
        function onMessage(e) {
            if (e.message.cmd === IFrameMessages.ASSERT_RESPONSE_CMD) {
                MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
                callback(e.message.err);
            }
        }

        if (context) {
            MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);

            var msg = {
                cmd: IFrameMessages.ASSERT_REQUEST_CMD,
                operator: operator,
                args: args
            };

            MessageSandbox.sendServiceMsg(msg, context);

            return;
        }

        var err = null,
            assertionsAPI = new AssertionsAPI(function (e) {
                err = e;
            });

        assertionsAPI[operator].apply(assertionsAPI, args);

        callback(err);
    };

    //NOTE: add sourceIndex wrapper
    SourceIndexTracker.wrapTrackableMethods(AssertionsAPI.prototype, SharedConst.ASSERTION_FUNC_NAMES);
});

TestCafeClient.define('TestRunner.API.Dialogs', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        EventEmitter = Hammerhead.Util.EventEmitter;

    exports.UNEXPECTED_DIALOG_ERROR_EVENT = 'unexpectedDialogError';
    exports.WAS_NOT_EXPECTED_DIALOG_ERROR_EVENT = 'wasNotExpectedDialogError';
    exports.DIALOGS_INFO_CHANGED_EVENT = 'dialogsInfoChangedEvent';

    var dialogsInfo = null; //NOTE: call the onDialogsInfoChanged function when you change this

    var beforeUnloadEventWasRaised = false;

    var eventEmitter = new EventEmitter();

    exports.on = function (event, handler) {
        eventEmitter.on(event, handler);
    };

    function initDialogsInfo(info) {
        if (!info) {
            dialogsInfo = {
                expectAlertCount: 0,
                expectConfirmCount: 0,
                expectPromptCount: 0,
                expectedConfirmRetValues: [],
                expectedPromptRetValues: [],
                expectBeforeUnload: false,
                alerts: [],
                confirms: [],
                prompts: [],
                beforeUnloadDialogAppeared: false
            };
        }
        else
            dialogsInfo = info;
    }

    function onDialogsInfoChanged() {
        eventEmitter.emit(exports.DIALOGS_INFO_CHANGED_EVENT, {
            info: dialogsInfo
        });
    }

    function beforeUnloadHandler(e) {
        dialogsInfo.beforeUnloadDialogAppeared = !!e.prevented;
        beforeUnloadEventWasRaised = true;

        if (dialogsInfo.beforeUnloadDialogAppeared)
            onDialogsInfoChanged();

        if (dialogsInfo.beforeUnloadDialogAppeared && !dialogsInfo.expectBeforeUnload)
            sendUnexpectedDialogError('beforeUnload', e.returnValue === true ? '' : e.returnValue.toString());
    }

    function initDialogs(info) {
        initDialogsInfo(info);

        window.alert = function (message) {
            dialogsInfo.alerts.push(message);
            onDialogsInfoChanged();

            if (dialogsInfo.alerts.length > dialogsInfo.expectAlertCount)
                sendUnexpectedDialogError('alert', message);
        };

        window.confirm = function (message) {
            var returnValue = dialogsInfo.expectedConfirmRetValues[dialogsInfo.confirms.length];

            dialogsInfo.confirms.push(message);
            onDialogsInfoChanged();

            if (dialogsInfo.confirms.length > dialogsInfo.expectConfirmCount)
                sendUnexpectedDialogError('confirm', message);

            return returnValue;
        };

        window.prompt = function (message) {
            var returnValue = dialogsInfo.expectedPromptRetValues[dialogsInfo.prompts.length];

            dialogsInfo.prompts.push(message);
            onDialogsInfoChanged();

            if (dialogsInfo.prompts.length > dialogsInfo.expectPromptCount)
                sendUnexpectedDialogError('prompt', message);

            return returnValue;

        };
    }

    function sendUnexpectedDialogError(dialog, message) {
        //NOTE: the following dialogs are not raised in browsers after before unload event
        if (/alert|confirm|prompt/.test(dialog) && beforeUnloadEventWasRaised)
            return;

        eventEmitter.emit(exports.UNEXPECTED_DIALOG_ERROR_EVENT, {
            dialog: dialog,
            message: message
        });
    }

    function sendWasNotExpectedDialog(dialog) {
        eventEmitter.emit(exports.WAS_NOT_EXPECTED_DIALOG_ERROR_EVENT, {
            dialog: dialog
        });
    }

    exports.init = function (info) {
        Hammerhead.on(Hammerhead.BEFORE_UNLOAD_EVENT, beforeUnloadHandler);

        beforeUnloadEventWasRaised = false;
        initDialogs(info);
    };

    exports.destroy = function () {
        Hammerhead.off(Hammerhead.BEFORE_UNLOAD_EVENT, beforeUnloadHandler);
    };

    exports.handleAlert = function () {
        dialogsInfo.expectAlertCount++;
        onDialogsInfoChanged();
    };

    exports.handleConfirm = function (value) {
        dialogsInfo.expectConfirmCount++;
        dialogsInfo.expectedConfirmRetValues.push(!(!value || value === 'Cancel'));
        onDialogsInfoChanged();
    };

    exports.handlePrompt = function (value) {
        dialogsInfo.expectPromptCount++;
        dialogsInfo.expectedPromptRetValues.push((value || value === '') ? value : null);
        onDialogsInfoChanged();
    };

    exports.handleBeforeUnload = function () {
        dialogsInfo.expectBeforeUnload = true;
        onDialogsInfoChanged();
    };

    exports.resetHandlers = function () {
        initDialogs();
        onDialogsInfoChanged();
    };

    exports.hasUnexpectedBeforeUnloadDialog = function () {
        return dialogsInfo && dialogsInfo.beforeUnloadDialogAppeared && !dialogsInfo.expectBeforeUnload;
    };

    exports.checkExpectedDialogs = function () {
        if (dialogsInfo.expectAlertCount && dialogsInfo.alerts.length < dialogsInfo.expectAlertCount)
            sendWasNotExpectedDialog('alert');

        if (dialogsInfo.expectConfirmCount && dialogsInfo.confirms.length < dialogsInfo.expectConfirmCount)
            sendWasNotExpectedDialog('confirm');

        if (dialogsInfo.expectPromptCount && dialogsInfo.prompts.length < dialogsInfo.expectPromptCount)
            sendWasNotExpectedDialog('prompt');

        if (dialogsInfo.alerts.length > dialogsInfo.expectAlertCount)
            sendUnexpectedDialogError('alert', dialogsInfo.alerts[dialogsInfo.expectAlertCount]);

        if (dialogsInfo.confirms.length > dialogsInfo.expectConfirmCount)
            sendUnexpectedDialogError('confirm', dialogsInfo.confirms[dialogsInfo.expectConfirmCount]);

        if (dialogsInfo.prompts.length > dialogsInfo.expectPromptCount)
            sendUnexpectedDialogError('prompt', dialogsInfo.prompts[dialogsInfo.expectPromptCount]);

        if (dialogsInfo.expectBeforeUnload && !dialogsInfo.beforeUnloadDialogAppeared)
            sendWasNotExpectedDialog('beforeUnload');
    };
});
(function () {
    var Errors = typeof module !== 'undefined' && module.exports ? exports : TestCafeClient;

    Errors.UNCAUGHT_JS_ERROR = 'CLIENT_UNCAUGHT_JS_ERROR';
    Errors.UNCAUGHT_JS_ERROR_IN_TEST_CODE_STEP = 'CLIENT_UNCAUGHT_JS_ERROR_IN_TEST_CODE_STEP';
    Errors.STORE_DOM_NODE_OR_JQUERY_OBJECT = 'CLIENT_STORE_DOM_NODE_OR_JQUERY_OBJECT';
    Errors.TEST_INACTIVITY = 'CLIENT_TEST_INACTIVITY';
    Errors.API_EMPTY_FIRST_ARGUMENT = 'CLIENT_API_EMPTY_FIRST_ARGUMENT';
    Errors.API_INVISIBLE_ACTION_ELEMENT = 'CLIENT_API_INVISIBLE_ACTION_ELEMENT';
    Errors.API_INCORRECT_DRAGGING_SECOND_ARGUMENT = 'CLIENT_API_INCORRECT_DRAGGING_SECOND_ARGUMENT';
    Errors.API_OK_ASSERTION_FAILED = 'CLIENT_API_OK_ASSERTION_FAILED';
    Errors.API_EQUAL_ASSERTION_FAILED = 'CLIENT_API_EQUAL_ASSERTION_FAILED';
    Errors.API_NOT_OK_ASSERTION_FAILED = "CLIENT_API_NOT_OK_ASSERTION_FAILED";
    Errors.API_NOT_EQUAL_ASSERTION_FAILED = "CLIENT_API_NOT_EQUAL_ASSERTION_FAILED";
    Errors.API_INCORRECT_PRESS_ACTION_ARGUMENT = "CLIENT_API_INCORRECT_PRESS_ACTION_ARGUMENT";
    Errors.API_EMPTY_TYPE_ACTION_ARGUMENT = "CLIENT_API_EMPTY_TYPE_ACTION_ARGUMENT";
    Errors.API_UNEXPECTED_DIALOG = "CLIENT_API_UNEXPECTED_DIALOG";
    Errors.API_EXPECTED_DIALOG_DOESNT_APPEAR = "CLIENT_API_EXPECTED_DIALOG_DOESNT_APPEAR";
    Errors.API_INCORRECT_SELECT_ACTION_ARGUMENTS = 'CLIENT_API_INCORRECT_SELECT_ACTION_ARGUMENTS';
    Errors.API_INCORRECT_WAIT_ACTION_MILLISECONDS_ARGUMENT = 'CLIENT_API_INCORRECT_WAIT_ACTION_FIRST_ARGUMENT';
    Errors.API_INCORRECT_WAIT_FOR_ACTION_EVENT_ARGUMENT = 'CLIENT_API_INCORRECT_WAIT_FOR_ACTION_EVENT_ARGUMENT';
    Errors.API_INCORRECT_WAIT_FOR_ACTION_TIMEOUT_ARGUMENT = 'CLIENT_API_INCORRECT_WAIT_FOR_ACTION_TIMEOUT_ARGUMENT';
    Errors.API_WAIT_FOR_ACTION_TIMEOUT_EXCEEDED = 'CLIENT_API_WAIT_FOR_ACTION_TIMEOUT_EXCEEDED';
    Errors.API_EMPTY_IFRAME_ARGUMENT = 'CLIENT_API_EMPTY_IFRAME_ARGUMENT';
    Errors.API_IFRAME_ARGUMENT_IS_NOT_IFRAME = 'CLIENT_API_IFRAME_ARGUMENT_IS_NOT_IFRAME';
    Errors.API_MULTIPLE_IFRAME_ARGUMENT = 'CLIENT_API_MULTIPLE_IFRAME_ARGUMENT';
    Errors.API_INCORRECT_IFRAME_ARGUMENT = 'CLIENT_API_INCORRECT_IFRAME_ARGUMENT';
    Errors.API_UPLOAD_CAN_NOT_FIND_FILE_TO_UPLOAD = 'CLIENT_API_UPLOAD_CAN_NOT_FIND_FILE_TO_UPLOAD';
    Errors.API_UPLOAD_ELEMENT_IS_NOT_FILE_INPUT = 'CLIENT_API_UPLOAD_ELEMENT_IS_NOT_FILE_INPUT';
    Errors.API_UPLOAD_INVALID_FILE_PATH_ARGUMENT = 'CLIENT_API_UPLOAD_INVALID_FILE_PATH_ARGUMENT';
    Errors.IFRAME_LOADING_TIMEOUT = 'CLIENT_IFRAME_LOADING_TIMEOUT';
    Errors.IN_IFRAME_TARGET_LOADING_TIMEOUT = 'CLIENT_IN_IFRAME_TARGET_LOADING_TIMEOUT';
    Errors.XHR_REQUEST_TIMEOUT = 'CLIENT_XHR_REQUEST_TIMEOUT';

    Errors.hasErrorStepName = function (err) {
        return err.code !== Errors.UNCAUGHT_JS_ERROR && err.code !== Errors.XHR_REQUEST_TIMEOUT &&
            err.code !== Errors.IFRAME_LOADING_TIMEOUT && err.code !== Errors.TEST_INACTIVITY;
    };

    if (typeof module !== 'undefined' && module.exports)
        module.exports = Errors;
    else {
        TestCafeClient.define('Shared.Errors', function () {
            this.exports = Errors;
        });
    }
})();
(function () {
    var Const = {};

    Const.IFRAME_WATCH_PROPERTY = 'tc_iwp_cf65bc15';
    Const.OLD_ATTR_VALUES = 'tc-1b082-oldAttrValues';
    Const.UPLOADED_FILES_PATH = './uploads/';
    Const.PROPERTY_PREFIX = "tc-1b082a6cec-51966-";
    Const.ACTION_FUNC_NAMES = [
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
    ];

    Const.ASSERTION_FUNC_NAMES = [
        'ok', 'notOk', 'eq', 'notEq'
    ];

    if (typeof module !== 'undefined' && module.exports)
        module.exports = Const;
    else {
        TestCafeClient.define('Shared.Const', function () {
            this.exports = Const;
        });
    }
})();
(function () {
    var ServiceCommands = {
        TEST_FAIL: 'CMD_TEST_FAIL',
        ASSERTION_FAILED: 'CMD_ASSERTION_FAILED',
        TEST_COMPLETE: 'CMD_TEST_COMPLETE',
        INACTIVITY_EXPECTED: 'CMD_INACTIVITY_EXPECTED',
        SET_STEPS_SHARED_DATA: 'CMD_SET_STEPS_SHARED_DATA',
        GET_STEPS_SHARED_DATA: 'CMD_GET_STEPS_SHARED_DATA',
        STEPS_INFO_GET: 'CMD_STEPS_INFO_GET',
        STEPS_INFO_SET: 'CMD_STEPS_INFO_SET',
        WERE_ACTIONS_RECORDED: 'CMD_WERE_ACTIONS_RECORDED',
        SET_NEXT_STEP: 'CMD_SET_NEXT_STEP',
        SET_ACTION_TARGET_WAITING: 'CMD_SET_ACTION_TARGET_WAITING',
        SET_TEST_ERROR: 'CMD_SET_TEST_ERROR',
        TOOLBAR_POSITION_SET: 'CMD_TOOLBAR_POSITION_SET',
        CHANGE_SHOW_STEPS: 'CMD_CHANGE_SHOW_STEPS',
        SET_HAS_UNSAVED_CHANGES: 'CMD_SET_HAS_UNSAVED_CHANGES',
        RESTART_RECORDING: 'CMD_RESTART_RECORDING',
        GET_AND_UNCHECK_FILE_DOWNLOADING_FLAG: "GET_AND_UNCHECK_FILE_DOWNLOADING_FLAG",
        UNCHECK_FILE_DOWNLOADING_FLAG: "CMD_UNCHECK_FILE_DOWNLOADING_FLAG",
        SAVE_TEST: 'CMD_SAVE_TEST',
        EXIT_RECORDING: 'CMD_EXIT_RECORDING',
        START_PLAYBACK: 'CMD_START_PLAYBACK',
        CANCEL_AUTHENTICATION: 'CMD_CANCEL_AUTHENTICATION',
        FAILED_STEP_IN_PLAYBACK: "CMD_FAILED_STEP_IN_PLAYBACK",
        END_PLAYBACK: 'CMD_END_PLAYBACK',
        SET_NEXT_STEP_PLAYBACK: 'CMD_SET_NEXT_STEP_PLAYBACK',
        SET_ACTION_TARGET_WAITING_PLAYBACK: 'CMD_SET_ACTION_TARGET_WAITING_PLAYBACK',
        AUTH_CREDENTIALS_SET: 'CMD_AUTH_CREDENTIALS_SET',
        UXLOG: 'CMD_UXLOG',
        TAKE_SCREENSHOT: 'CMD_TAKE_SCREENSHOT',
        NATIVE_DIALOGS_INFO_SET: "CMD_NATIVE_DIALOGS_INFO_SET",
        SET_NATIVE_DIALOGS_QUEUE: "CMD_SET_NATIVE_DIALOGS_QUEUE"
    };

    if (typeof module !== 'undefined' && module.exports)
        module.exports = ServiceCommands;
    else {
        TestCafeClient.define('Shared.ServiceCommands', function () {
            this.exports = ServiceCommands;
        });
    }
})();
    };

    window.initTestCafeClientCore(window);
})();