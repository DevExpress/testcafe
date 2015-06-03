(function () {
    window.initTestCafeRecorderUI = function (window) {
        var HammerheadClient = window.HammerheadClient,
            TestCafeClient = window.TestCafeClient,
            document = window.document;
TestCafeClient.define('UI.DraggingBehavior', function () {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        EventSandbox = Hammerhead.EventSandbox;

    var DraggingBehavior = this.exports = function ($area, $draggableElement, dragHandlers) {
        this.$dragArea = $area;
        this.$draggable = $draggableElement;
        this.handlers = dragHandlers;

        this.dragging = false;
        this.draggingStopped = false;
        this.dragEventRaised = false;
        this.maxTop = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this._init();
    };

    DraggingBehavior.prototype._init = function () {
        var draggingBehavior = this;

        this.$dragArea.css('cursor', 'move');

        ShadowUI.bind(this.$dragArea, 'mousedown', function (evt) {
            if (draggingBehavior.draggingStopped)
                return;

            draggingBehavior.dragging = true;

            var offset = Util.getOffsetPosition(draggingBehavior.$draggable[0]);
            draggingBehavior.dragOffsetX = (evt.pageX || evt.x) - offset.left;
            draggingBehavior.dragOffsetY = (evt.pageY || evt.y) - offset.top;

            //NOTE: prevent text selection
            Util.preventDefault(evt);
            return false;
        });

        function onMove(evt) {
            if (draggingBehavior.dragging) {
                if (!draggingBehavior.dragEventRaised) {
                    if (draggingBehavior.handlers && draggingBehavior.handlers.onDragStart)
                        draggingBehavior.handlers.onDragStart();
                    draggingBehavior.dragEventRaised = true;
                }
                var left = Math.max(evt.clientX - draggingBehavior.dragOffsetX, 0),
                    top = Math.max(evt.clientY - draggingBehavior.dragOffsetY, 0),
                    draggableWidth = draggingBehavior.$draggable.width(),
                    draggableHeight = draggingBehavior.$draggable.height(),
                    windowWidth = $(window).width(),
                    windowHeight = $(window).height();

                if (left + draggableWidth > windowWidth)
                    left = windowWidth - draggableWidth;

                if (top + draggableHeight > windowHeight)
                    top = windowHeight - draggableHeight;

                draggingBehavior.$draggable.css({
                    left: Math.max(left, 0),
                    top: draggingBehavior.maxTop !== null ? Math.min(draggingBehavior.maxTop, Math.max(top, 0)) : Math.max(top, 0)});

                if (draggingBehavior.handlers && draggingBehavior.handlers.onMove)
                    draggingBehavior.handlers.onMove();

                //NOTE: prevent text selection
                Util.preventDefault(evt);
                return false;
            }
        }

        EventSandbox.addInternalEventListener(window, ['mousemove'], function (e, dispatched) {
            if (!dispatched)
                onMove(e);
        });

        function onMouseUp(evt) {
            if (draggingBehavior.dragging) {
                draggingBehavior.dragging = false;

                if (draggingBehavior.dragEventRaised) {
                    if (draggingBehavior.handlers && draggingBehavior.handlers.onDragEnd)
                        draggingBehavior.handlers.onDragEnd();

                    draggingBehavior.dragEventRaised = false;
                }
                Util.preventDefault(evt);
            }
        }

        EventSandbox.addInternalEventListener(window, ['mouseup'], function (e, dispatched) {
            if (!dispatched)
                onMouseUp(e);
        });
    };

    DraggingBehavior.prototype.resetDragging = function () {
        if (this.$dragArea) {
            this.$dragArea.css('cursor', 'auto');

            this.draggingStopped = true;
        }
    };

    DraggingBehavior.prototype.restoreDragging = function () {
        this.$dragArea.css('cursor', 'move');
        this.draggingStopped = false;
    };

    DraggingBehavior.prototype.setMaxTop = function (top) {
        this.maxTop = top;
    };
});
TestCafeClient.define('UI.Recorder', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        EventSandbox = Hammerhead.EventSandbox,
        NativeMethods = Hammerhead.NativeMethods,
        ShadowUI = Hammerhead.ShadowUI,
        Transport = require('Base.Transport'),
        ServiceCommands = require('Shared.ServiceCommands'),
        Settings = require('Settings'),
        Automation = require('Automation'),
        RecorderUtil = require('Recorder.Util'),
        ModalBackground = require('UI.ModalBackground'),
        ToolbarWidget = require('UI.RecorderWidgets.Toolbar'),
        StepsPanel = require('UI.RecorderWidgets.StepsPanel'),
        SetTestNameDialog = require('UI.RecorderWidgets.SetTestNameDialog'),
        UnsavedChangesDialog = require('UI.RecorderWidgets.UnsavedChangesDialog'),
        BackToInitialPageDialog = require('UI.RecorderWidgets.BackToInitialPage'),
        AddActionDialog = require('UI.RecorderWidgets.AddActionDialog'),
        ElementPicker = require('Recorder.ElementPicker'),
        Tooltip = require('UI.RecorderWidgets.Tooltip');

    //Const
    var ADD_HOVER_ACTION_SHORTCUT = Automation.ADD_ACTION_SHORTCUTS.hover,
        ADD_WAIT_ACTION_SHORTCUT = Automation.ADD_ACTION_SHORTCUTS.wait,
        ADD_SCREENSHOT_SHORTCUT = Automation.ADD_ACTION_SHORTCUTS.screenshot,
        ADD_ASSERTION_STEP_SHORTCUT = 'Ctrl+R',
        RUN_PLAYBACK_SHORTCUT = 'Ctrl+D',
        SAVE_TEST_SHORTCUT = 'Ctrl+S',
        EXIT_RECORDING_SHORTCUT = 'Ctrl+E',
        COMPLETE_TYPING_SHORTCUT = 'Ctrl+G',

        RECORDER_CLASS = 'recorder',
        COMPLETE_BUTTON_CLASS = 'complete-icon',
        COMPLETE_TYPING_BUTTON_CLASS = 'typing',
        COMPLETE_TYPING_BUTTON_TITLE = 'Complete Typing' + ' (' + COMPLETE_TYPING_SHORTCUT + ')',
        COMPLETE_CLICK_EDITOR_BUTTON_CLASS = 'click',
        COMPLETE_CLICK_EDITOR_BUTTON_TITLE = 'Complete Click' + ' (' + COMPLETE_TYPING_SHORTCUT + ')';

    exports.ADD_HOVER_ACTION_EVENT = 'addHoverAction';
    exports.ADD_WAIT_ACTION_EVENT = 'addWaitAction';
    exports.ADD_SCREENSHOT_ACTION_EVENT = 'addScreenshotAction';
    exports.ADD_ASSERTIONS_STEP_EVENT = 'addAssertionsStep';
    exports.RUN_PLAYBACK_EVENT = 'runPlayback';
    exports.SAVE_TEST_EVENT = 'saveTest';
    exports.EXIT_RECORDING_EVENT = 'exitRecording';
    exports.SEND_STEPS_INFO_EVENT = 'sendStepsInfo';
    exports.RESTART_RECORDING_EVENT = 'restartRecording';
    exports.RESUME_PLAYBACK_EVENT = 'resumePlayback';
    exports.POPUP_DIALOG_OPENING_EVENT = 'popupDialogOpening';
    exports.POPUP_DIALOG_CLOSED_EVENT = 'popupDialogClosed';
    exports.START_PICKING_ELEMENT_EVENT = 'startPickingElement';
    exports.STOP_PICKING_ELEMENT_EVENT = 'stopPickingElement';
    exports.STEP_EDITING_STARTED = 'stepEditingStarted';
    exports.STEP_EDITING_FINISHED = 'stepEditingFinished';

    exports.Shortcuts = {};
    exports.Shortcuts[ADD_HOVER_ACTION_SHORTCUT] = null;
    exports.Shortcuts[ADD_WAIT_ACTION_SHORTCUT] = null;
    exports.Shortcuts[ADD_SCREENSHOT_SHORTCUT] = null;
    exports.Shortcuts[ADD_ASSERTION_STEP_SHORTCUT] = null;
    exports.Shortcuts[RUN_PLAYBACK_SHORTCUT] = null;
    exports.Shortcuts[SAVE_TEST_SHORTCUT] = null;
    exports.Shortcuts[EXIT_RECORDING_SHORTCUT] = null;
    exports.Shortcuts[COMPLETE_TYPING_SHORTCUT] = null;

    var UI_MODES = {
        initialized: 'initializedMode',
        playback: 'playbackMode',
        recording: 'recordingMode'
    };

//Globals
    var eventEmitter = new Util.EventEmitter(),
        $recorder = null,
        activeDialog = null,
        openingDialog = false,
        $completeTypingButton = null,
        $completeClickEditorButton = null,
        currentCompleteTypingHandler = null,
        currentCompleteClickEditorHandler = null,
        stepsInfoGetter = null,
        hasChangesGetter = null,
        testSavedGetter = null,
        stepsPanelPlaybackHandlersAssigned = false,

        stepPanelExpanded = true,
        currentMode = null;

//Markup
    function getRecorderContainer() {
        if ($recorder)
            return $recorder;

        $recorder = $('<div>').appendTo(ShadowUI.getRoot());
        ShadowUI.addClass($recorder, RECORDER_CLASS);

        return $recorder;
    }

//Behavior
    function saveTest(complete, args) {
        if (!testSavedGetter()) {
            onPopupDialogOpening();
            setTestName(args, complete);
        }
        else {
            ModalBackground.show();
            ModalBackground.showLoadingIcon();

            eventEmitter.emit(exports.SAVE_TEST_EVENT, {
                callback: function () {
                    ModalBackground.hideLoadingIcon();
                    ModalBackground.hide();
                },
                complete: complete || false
            });
        }
    }

    function setTestName(args, complete) {
        openingDialog = true;
        SetTestNameDialog.init(getRecorderContainer(), args || {});
        openingDialog = false;
        activeDialog = SetTestNameDialog;

        activeDialog.events.on(SetTestNameDialog.CANCEL_SAVE_BUTTON_CLICK_EVENT, function () {
            activeDialog = null;
            onPopupDialogClosed();
        });

        activeDialog.events.on(SetTestNameDialog.SAVE_TEST_BUTTON_CLICK_EVENT, function (e) {
            activeDialog.blind(true);
            ModalBackground.showLoadingIcon();

            eventEmitter.emit(exports.SAVE_TEST_EVENT, {
                callback: function (err) {
                    if (!err) {
                        activeDialog.closeDialog(function () {
                            ModalBackground.hideLoadingIcon();
                            activeDialog = null;
                            if (!complete)
                                onPopupDialogClosed(true);
                        });
                    }
                    else {
                        ModalBackground.hideLoadingIcon();
                        activeDialog.blind(false);
                        SetTestNameDialog.onError(err);
                    }
                },
                testName: e.testName,
                complete: complete || false
            });
        });
    }

    function changesWarning(hasErrors) {
        openingDialog = true;
        UnsavedChangesDialog.init(getRecorderContainer(), hasErrors);
        openingDialog = false;
        activeDialog = UnsavedChangesDialog;

        activeDialog.events.on(UnsavedChangesDialog.CANCEL_BUTTON_CLICK_EVENT, function () {
            activeDialog = null;
            onPopupDialogClosed(true);
        });

        activeDialog.events.on(UnsavedChangesDialog.EXIT_BUTTON_CLICK_EVENT, function () {
            activeDialog = null;
            eventEmitter.emit(exports.EXIT_RECORDING_EVENT, {
                skipCheckChanges: true
            });
        });

        activeDialog.events.on(UnsavedChangesDialog.SAVE_BUTTON_CLICK_EVENT, function () {
            activeDialog = null;
            saveTest(true);
        });
    }

    function openStepWithError(stepNum, err, handlers, recordingMode) {
        ToolbarWidget.updateExpandStepsButtonAppearance(true);

        //T176225 - Cannot hide test steps once a test is failed.
        //Steps Panel should be non collapsible only when open failed assertion step
        if (!recordingMode)
            ToolbarWidget.setExpandStepsButtonState(false);

        StepsPanel.openStepWithError(stepNum, err, recordingMode);

        if (!stepsPanelPlaybackHandlersAssigned && handlers) {
            stepsPanelPlaybackHandlersAssigned = true;

            StepsPanel.events.on(StepsPanel.SKIP_STEP_BUTTON_CLICK_EVENT, function (e) {
                onPopupDialogClosed({
                    sendStepsInfo: true,
                    showToolbar: false
                });

                if (!stepPanelExpanded) {
                    StepsPanel.hide();
                    ToolbarWidget.updateExpandStepsButtonAppearance(stepPanelExpanded);
                }

                ToolbarWidget.setExpandStepsButtonState(true);

                if (handlers && handlers.skipStep)
                    handlers.skipStep(e.hasChanges);
            });

            StepsPanel.events.on(StepsPanel.REPLAY_STEP_BUTTON_CLICK_EVENT, function (e) {
                onPopupDialogClosed({
                    sendStepsInfo: true,
                    showToolbar: false
                });

                if (!stepPanelExpanded) {
                    StepsPanel.hide();
                    ToolbarWidget.updateExpandStepsButtonAppearance(stepPanelExpanded);
                }

                ToolbarWidget.setExpandStepsButtonState(true);

                if (handlers && handlers.resumePlayback)
                    handlers.resumePlayback(e.hasChanges);
            });
        }
    }

//Handlers
    function onPopupDialogOpening(transparentBackground) {
        ModalBackground.show(transparentBackground);

        exports.hideToolbar();

        if ($completeClickEditorButton)
            $completeClickEditorButton.css('visibility', 'hidden');

        if ($completeTypingButton)
            $completeTypingButton.css('visibility', 'hidden');

        eventEmitter.emit(exports.POPUP_DIALOG_OPENING_EVENT, {});
    }

    function onPopupDialogClosed(options) {
        var opts = options || {},
            needSendStepsInfo = typeof opts.sendStepsInfo !== 'undefined' ? opts.sendStepsInfo : false,
            cancelAction = typeof opts.cancelAction !== 'undefined' ? opts.cancelAction : false,
            needShowToolbar = typeof opts.showToolbar !== 'undefined' ? opts.showToolbar : true;

        ModalBackground.hide();

        if (needShowToolbar)
            exports.showToolbar();

        if ($completeClickEditorButton) {
            if (cancelAction) {
                $completeClickEditorButton.remove();
                $completeClickEditorButton = null;
            }
            else
                $completeClickEditorButton.css('visibility', 'visible');
        }
        if ($completeTypingButton)
            $completeTypingButton.css('visibility', 'visible');

        eventEmitter.emit(exports.POPUP_DIALOG_CLOSED_EVENT, {
            needSendStepsInfo: needSendStepsInfo
        });
    }

//Toolbar event handlers
    function onAddHoverActionButtonPressed() {
        eventEmitter.emit(exports.ADD_HOVER_ACTION_EVENT);
    }

    function onAddWaitActionButtonPressed() {
        eventEmitter.emit(exports.ADD_WAIT_ACTION_EVENT);
    }

    function onScreenshotActionButtonPressed(){
        eventEmitter.emit(exports.ADD_SCREENSHOT_ACTION_EVENT);
    }

    function onAddAssertionStepButtonPressed(e) {
        eventEmitter.emit(exports.ADD_ASSERTIONS_STEP_EVENT, e);
    }

    function onRunPlaybackButtonPressed() {
        if (playbackActive)
            eventEmitter.emit(exports.RUN_PLAYBACK_EVENT);
    }

    function onSaveTestButtonPressed() {
        if (!hasChangesGetter())
            return;

        saveTest(false);
    }

    function onExitRecordingButtonPressed(e) {
        eventEmitter.emit(exports.EXIT_RECORDING_EVENT, e);
    }

    function initToolbarEventsHandlers() {
        ToolbarWidget.events.on(ToolbarWidget.ADD_HOVER_ACTION_BUTTON_PRESSED_EVENT, onAddHoverActionButtonPressed);

        ToolbarWidget.events.on(ToolbarWidget.ADD_WAIT_ACTION_BUTTON_PRESSED_EVENT, onAddWaitActionButtonPressed);

        ToolbarWidget.events.on(ToolbarWidget.ADD_ASSERTIONS_STEP_EVENT, onAddAssertionStepButtonPressed);

        ToolbarWidget.events.on(ToolbarWidget.ADD_SCREENSHOT_ACTION_BUTTON_PRESSED_EVENT, onScreenshotActionButtonPressed);

        ToolbarWidget.events.on(ToolbarWidget.RUN_PLAYBACK_BUTTON_PRESSED_EVENT, onRunPlaybackButtonPressed);

        ToolbarWidget.events.on(ToolbarWidget.SAVE_TEST_BUTTON_PRESSED_EVENT, onSaveTestButtonPressed);

        ToolbarWidget.events.on(ToolbarWidget.EXIT_RECORDING_BUTTON_PRESSED_EVENT, onExitRecordingButtonPressed);
    }

    function initStepsPanelHandlers() {
        StepsPanel.events.on(StepsPanel.STEPS_INFO_CHANGED_EVENT, function (e) {
            if (!e.draft)
                eventEmitter.emit(exports.SEND_STEPS_INFO_EVENT);

            exports.updateToolbarButtons();
        });

        StepsPanel.events.on(StepsPanel.ALL_STEPS_DELETED_EVENT, function () {
            Transport.asyncServiceMsg({cmd: ServiceCommands.WERE_ACTIONS_RECORDED}, function (wereActionsRecorded) {
                if (wereActionsRecorded) {
                    onPopupDialogOpening();
                    Tooltip.hideAll();

                    openingDialog = true;
                    BackToInitialPageDialog.init(getRecorderContainer());
                    openingDialog = false;
                    activeDialog = BackToInitialPageDialog;

                    activeDialog.events.on(BackToInitialPageDialog.BACK_TO_INITIAL_PAGE_EVENT, function () {
                        ModalBackground.showLoadingIcon();
                        activeDialog = null;
                        eventEmitter.emit(exports.RESTART_RECORDING_EVENT);
                    });
                }
            });
        });

        StepsPanel.events.on(StepsPanel.EDIT_ASSERTION_START_EVENT, function (e) {
            exports.hideToolbar();

            if (e.showBackground)
                ModalBackground.show();
        });

        StepsPanel.events.on(StepsPanel.EDIT_ASSERTION_COMPLETE_EVENT, function (e) {
            exports.showToolbar(true);

            if (e.hideBackground)
                ModalBackground.hide();

        });

        StepsPanel.events.on(StepsPanel.START_PICKING_ELEMENT_EVENT, function (e) {
            eventEmitter.emit(exports.START_PICKING_ELEMENT_EVENT, e);
        });

        StepsPanel.events.on(StepsPanel.STEP_INFO_SHOWN_EVENT, function (e) {
            ToolbarWidget.updateMaxTopForDragging(e.$el);

            eventEmitter.emit(exports.STEP_EDITING_STARTED, {});
        });

        StepsPanel.events.on(StepsPanel.STEP_INFO_HIDDEN_EVENT, function (e) {
            ToolbarWidget.updateMaxTopForDragging(null);

            if (e.editingFinished)
                eventEmitter.emit(exports.STEP_EDITING_FINISHED, {});
        });

        StepsPanel.events.on(StepsPanel.STEPS_PANEL_BLINDED_EVENT, function (e) {
            ToolbarWidget.setBlind(e.blind);
        });
    }

    function createCompleteTypingButton(rect) {
        var $button = $('<div></div>').attr('title', COMPLETE_TYPING_BUTTON_TITLE).appendTo(getRecorderContainer());

        ShadowUI.addClass($button, COMPLETE_BUTTON_CLASS);
        ShadowUI.addClass($button, COMPLETE_TYPING_BUTTON_CLASS);

        setCompleteTypingButtonPosition($button, rect);

        return $button;
    }

    function createCompleteClickEditorButton(elementRect) {
        var $button = $('<div></div>').attr('title', COMPLETE_CLICK_EDITOR_BUTTON_TITLE).appendTo(getRecorderContainer());

        ShadowUI.addClass($button, COMPLETE_BUTTON_CLASS);
        ShadowUI.addClass($button, COMPLETE_CLICK_EDITOR_BUTTON_CLASS);

        setCompleteTypingButtonPosition($button, elementRect);

        return $button;
    }

    function setCompleteTypingButtonPosition($button, rect) {
        $button.css({
            top: rect.top - $button.height(),
            left: rect.left + rect.width - $button.width()
        });
    }

    function initShortcutHandlers() {
        exports.Shortcuts[ADD_HOVER_ACTION_SHORTCUT] = onAddHoverActionButtonPressed;
        exports.Shortcuts[ADD_WAIT_ACTION_SHORTCUT] = onAddWaitActionButtonPressed;
        exports.Shortcuts[ADD_SCREENSHOT_SHORTCUT] = onScreenshotActionButtonPressed;
        exports.Shortcuts[ADD_ASSERTION_STEP_SHORTCUT] = onAddAssertionStepButtonPressed;
        exports.Shortcuts[RUN_PLAYBACK_SHORTCUT] = onRunPlaybackButtonPressed;
        exports.Shortcuts[SAVE_TEST_SHORTCUT] = onSaveTestButtonPressed;
        exports.Shortcuts[EXIT_RECORDING_SHORTCUT] = onExitRecordingButtonPressed;
        exports.Shortcuts[COMPLETE_TYPING_SHORTCUT] = function () {
            if (typeof currentCompleteTypingHandler === 'function')
                currentCompleteTypingHandler();
            else if (typeof currentCompleteClickEditorHandler === 'function')
                currentCompleteClickEditorHandler();
        };
    }

    function initPreventScrollingUnderRootElements() {
        NativeMethods.addEventListener.call(document, typeof document.onwheel !== 'undefined' ? 'wheel' : 'mousewheel', function (e) {
            var $target = $(e.target);

            if (Util.isShadowUIElement(e.target) && !ShadowUI.hasClass($target, RecorderUtil.ELEMENT_PICKING_CLASSES.elementFrame) && !ShadowUI.hasClass($target, RecorderUtil.ELEMENT_PICKING_CLASSES.elementFramePart) && !ShadowUI.select('.' + RecorderUtil.ELEMENTS_MARKER_CLASS).has($target).length)
                Util.preventDefault(e);
        }, false);
    }

    function createToolbar(mode) {
        var recorderContainer = getRecorderContainer(),
            toolbarOptions = {
                stepsInfo: stepsInfoGetter(),
                hasChanges: hasChangesGetter(),
                toolbarPosition: {
                    left: Settings.RECORDER_TOOLBAR_POS_LEFT,
                    top: Settings.RECORDER_TOOLBAR_POS_TOP
                },
                collapsedMode: mode === UI_MODES.playback,
                shortcuts: {
                    addHover: ADD_HOVER_ACTION_SHORTCUT,
                    addWait: ADD_WAIT_ACTION_SHORTCUT,
                    addScreenshot: ADD_SCREENSHOT_SHORTCUT,
                    addAssertion: ADD_ASSERTION_STEP_SHORTCUT,
                    playback: RUN_PLAYBACK_SHORTCUT,
                    saveTest: SAVE_TEST_SHORTCUT,
                    exitRecording: EXIT_RECORDING_SHORTCUT
                },
                showSteps: stepPanelExpanded,
                enableStepListInteractive: mode === UI_MODES.recording
            };

        ToolbarWidget.init(recorderContainer, toolbarOptions);

        ToolbarWidget.events.on(ToolbarWidget.TOOLBAR_MOVED_EVENT, function (e) {
            var toolbarPosSetMsg = {
                cmd: ServiceCommands.TOOLBAR_POSITION_SET,
                toolbarPosition: e.toolbarPosition
            };

            Transport.queuedAsyncServiceMsg(toolbarPosSetMsg);
        });

        ToolbarWidget.events.on(ToolbarWidget.STEPS_PANEL_VISIBILITY_CHANGED, function (e) {
            stepPanelExpanded = e.shown;

            var toolbarPosSetMsg = {
                cmd: ServiceCommands.CHANGE_SHOW_STEPS,
                show: e.shown
            };

            Transport.queuedAsyncServiceMsg(toolbarPosSetMsg);
        });

        initStepsPanelHandlers();
    }

    //API
    var initialized = false,
        playbackActive = false;

    exports.init = function (getStepsInfoFunction, getHasChangesFlagFunction, isTestSavedFunction, showSteps) {
        stepsInfoGetter = getStepsInfoFunction;
        hasChangesGetter = getHasChangesFlagFunction;
        testSavedGetter = isTestSavedFunction;
        stepPanelExpanded = showSteps;

        currentMode = UI_MODES.initialized;
        initialized = true;
    };

    exports.isInitialized = function () {
        return initialized;
    };

    exports.events = {
        on: function (ev, listener) {
            eventEmitter.on(ev, listener);
        }
    };

    exports.activateRecordingMode = function () {
        var preventUiEvents = function (e, dispatched, preventEvent, cancelHandlers, stopPropagation) {
            if ((activeDialog && (!activeDialog.popup || !activeDialog.popup.isHidden())) || openingDialog) {
                cancelHandlers();

                if (!Util.isShadowUIElement(e.target))
                    stopPropagation();
            }
        };

        EventSandbox.addInternalEventListener(window, Util.DOM_EVENTS, preventUiEvents);
        EventSandbox.addInternalEventListener(document, Util.DOM_EVENTS, preventUiEvents);

        if (currentMode === UI_MODES.initialized)
            createToolbar(UI_MODES.recording);
        else if (currentMode === UI_MODES.playback) {
            StepsPanel.turnOffPlaybackMode();
            StepsPanel.activateInteractive();
        }

        ToolbarWidget.expand();

        initToolbarEventsHandlers();
        initShortcutHandlers();
        initPreventScrollingUnderRootElements();

        exports.updateToolbarButtons();

        currentMode = UI_MODES.recording;
    };

    exports.activatePlaybackMode = function () {
        if (currentMode === UI_MODES.initialized)
            createToolbar(UI_MODES.playback);

        initPreventScrollingUnderRootElements();

        currentMode = UI_MODES.playback;
    };

    exports.highlightStep = function (stepNum) {
        StepsPanel.highlightItem(stepNum);
    };


    exports.confirmAction = function (stepNum, stepInfo, callback) {
        onPopupDialogOpening(!stepInfo.isAssertion);

        openingDialog = true;

        var addActionDialog = new AddActionDialog(getRecorderContainer(), stepNum, stepInfo);
        activeDialog = addActionDialog;

        openingDialog = false;

        addActionDialog.on(AddActionDialog.ADD_ACTION_BUTTON_CLICK_EVENT, function (e) {
            activeDialog = null;
            onPopupDialogClosed();

            callback(true, e.stepInfo);
        });

        addActionDialog.on(AddActionDialog.CANCEL_BUTTON_CLICK_EVENT, function () {
            activeDialog = null;
            onPopupDialogClosed({
                cancelAction: true
            });

            callback(false);
        });

        addActionDialog.on(AddActionDialog.START_PICKING_ELEMENT_EVENT, function (e) {
            eventEmitter.emit(exports.START_PICKING_ELEMENT_EVENT, e);
        });
    };

    exports.stepAdded = function (stepInfo) {
        if (!stepInfo.isAssertion && !stepPanelExpanded)
            ToolbarWidget.addActionIndicator(stepInfo.actionDescriptor.type);

        StepsPanel.addItem();
    };

    exports.handlerAdded = function (dialogType) {
        if (!stepPanelExpanded)
            ToolbarWidget.addActionIndicator(dialogType);
    };

    exports.onTypingStateChanged = function (isTypingStarted, completeCallback, elementRect) {
        if (isTypingStarted) {
            elementRect = elementRect || Util.getElementRectangle(Util.getActiveElement());

            if (!$completeTypingButton) {
                if ($completeClickEditorButton) {
                    $completeClickEditorButton.remove();
                    $completeClickEditorButton = null;
                    currentCompleteClickEditorHandler = null;
                }
                $completeTypingButton = createCompleteTypingButton(elementRect);
            }
            else
                setCompleteTypingButtonPosition($completeTypingButton, elementRect);

            currentCompleteTypingHandler = function () {
                $completeTypingButton.remove();
                currentCompleteTypingHandler = null;
                completeCallback();
            };

            ShadowUI.bind($completeTypingButton, 'mousedown', function (e) {
                Util.preventDefault(e);
                currentCompleteTypingHandler();
            });
        }
        else if ($completeTypingButton) {
            $completeTypingButton.remove();
            $completeTypingButton = null;
        }
    };

    exports.onClickEditorStateChanged = function (isClickOnEditorStarted, completeCallback, elementRect) {
        if (isClickOnEditorStarted) {
            elementRect = elementRect || Util.getElementRectangle(Util.getActiveElement());

            if (!$completeClickEditorButton)
                $completeClickEditorButton = createCompleteClickEditorButton(elementRect);
            else
                setCompleteTypingButtonPosition($completeClickEditorButton, elementRect);

            currentCompleteClickEditorHandler = function () {
                $completeClickEditorButton.remove();
                $completeClickEditorButton = null;
                currentCompleteClickEditorHandler = null;
                completeCallback();
            };

            ShadowUI.bind($completeClickEditorButton, 'mousedown', function (e) {
                Util.preventDefault(e);
                currentCompleteClickEditorHandler();
            });
        }
        else if ($completeClickEditorButton) {
            $completeClickEditorButton.remove();
            $completeClickEditorButton = null;
        }
    };

    exports.onStartPickElement = function () {
        exports.hideToolbar();

        if (activeDialog) {
            activeDialog.popup.hide();
            ModalBackground.hide();
        }
        ElementPicker.setRecorderUI(getRecorderContainer());
    };

    exports.onStopPickElement = function () {
        if (activeDialog) {
            if (activeDialog.popup && activeDialog.popup.isHidden()) {
                activeDialog.popup.show();
                ModalBackground.show(activeDialog.step && !activeDialog.step.getStepInfo().isAssertion);
            }
        }
        else
            exports.showToolbar();
    };

    exports.hideToolbar = function () {
        ToolbarWidget.hide();
        StepsPanel.hide();
    };

    exports.showToolbar = function (skipPageStateSaving) {
        ToolbarWidget.show();

        if (stepPanelExpanded)
            StepsPanel.show(skipPageStateSaving);

        exports.updateToolbarButtons();
    };

    exports.setToolbarBlind = function (blind) {
        ToolbarWidget.setBlind(blind);
    };

    exports.updateToolbarButtons = function () {
        var hasErrors = false,
            steps = stepsInfoGetter();

        playbackActive = !!steps.length;

        for (var i = 0; i < steps.length; i++) {
            if (steps[i].error) {
                hasErrors = true;
                playbackActive = false;
                break;
            }
        }

        ToolbarWidget.updateState(hasChangesGetter(), !!steps.length, hasErrors);
    };

    exports.updateSteps = function () {
        StepsPanel.updateSteps();
    };

    exports.openStepWithError = openStepWithError;

    exports.openChangesWarningDialog = function (hasErrors) {
        onPopupDialogOpening();
        changesWarning(hasErrors);
    };
});

TestCafeClient.define('UI.SortingBehavior', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI;

    //Const
    var SORTABLE_CLASS = 'sortable',
        PLACE_HOLDER_CLASS = 'place-holder',

        DEFAULT_OPTIONS = {
            handlers: {},
            waitSortingStart: false, //we should not bind mousedown handler
            itemTag: '', //it's tag of draggable element require for placeholder element
            itemClass: '', //class of draggable elements
            draggableClass: '', //dragging runs beyond the element with this class
            exceptClass: '' //dragging beyond the element with this class is impossible
        };

    //vars
    var opts = null,
        container = null,

        $draggedItem = null,
        $placeHolderItem = null,

        mousedownOffset = {},
        itemOffsetLimit = null,
        currentPositions = null,
        lastPosTop = null,

        originalItemIndex = null,
        originalItemStyle = '',

        stopped = false;

    var getItemByElement = function (el) {
        var $parents = $(el).parents(),
            $item = null;

        if (opts.exceptClass && ShadowUI.hasClass($(el), opts.exceptClass))
            return null;

        if (opts.draggableClass && !ShadowUI.hasClass($(el), opts.draggableClass)) {
            var $draggableParent = $parents.filter(function () {
                return ShadowUI.hasClass($(this), opts.draggableClass);
            });

            if (!$draggableParent.length)
                return null;
        }
        else if ((!opts.draggableClass ||  opts.draggableClass === opts.itemClass) && ShadowUI.hasClass($(el), opts.itemClass))
            return $(el);

        $.each($parents, function (index, parent) {
            if (ShadowUI.hasClass($(parent), opts.itemClass)) {
                $item = $(parent);
                return false;
            }
        });

        return $item;
    };

    var getItems = function () {
        return $(container).children(opts.itemTag).map(function (i, item) {
            return ShadowUI.hasClass($(item), opts.itemClass) ? item : null;
        });
    };

    var saveItemPositions = function () {
        var positions = [],
            $itemsForSave = getItems(),
            offset = null;

        $itemsForSave = $itemsForSave.map(function (i, item) {
            return (ShadowUI.hasClass($(item), SORTABLE_CLASS) || ShadowUI.hasClass($(item), PLACE_HOLDER_CLASS)) ? null : item;
        });

        $itemsForSave.each(function (i, item) {
            offset = Util.getOffsetPosition(item);
            offset.right = offset.left + $(item).outerWidth();
            offset.bottom = offset.top + $(item).outerHeight();
            offset.el = item;
            positions[i] = offset;
        });

        currentPositions = positions;
    };

    var setDraggedItemPosition = function (x, y) {
        var itemNewTop = y - mousedownOffset.top,
            itemNewLeft = x - mousedownOffset.left;

        itemNewTop = Math.min(itemOffsetLimit.bottom, Math.max(itemNewTop, itemOffsetLimit.top));
        itemNewLeft = Math.min(itemOffsetLimit.right, Math.max(itemNewLeft, itemOffsetLimit.left));

        var $itemParents = $draggedItem.parents();

        $itemParents.each(function (i, parent) {
            if ($(parent).css('position') !== 'static' && (!Util.isMozilla || $(parent).css('display') !== 'table')) {
                var parentOffset = Util.getOffsetPosition(parent);
                itemNewTop -= parentOffset.top;
                itemNewLeft -= parentOffset.left;
                return false;
            }
        });

        $draggedItem.css({
            top: itemNewTop,
            left: itemNewLeft
        });
    };

    var findElementForReplace = function () {
        var offset = Util.getOffsetPosition($draggedItem[0]),
            currentY = offset.top + mousedownOffset.top;

        for (var i = 0; i < currentPositions.length; i++) {
            if (currentY >= currentPositions[i].top && currentY <= currentPositions[i].bottom)
                return currentPositions[i].el;
        }

        return null;
    };

    var updateOffsetLimit = function () {
        var containerHeight = Math.floor($(container).outerHeight());

        itemOffsetLimit = Util.getOffsetPosition(container);
        itemOffsetLimit.right = itemOffsetLimit.left + $(container).outerWidth() - $draggedItem.outerWidth();
        itemOffsetLimit.bottom = itemOffsetLimit.top + containerHeight - $draggedItem.outerHeight();
    };

    //handlers
    var onMousedown = function (e) {
        if (e.button !== Util.BUTTON.LEFT || stopped)
            return;

        var $curTarget = getItemByElement(e.target);

        if (!$curTarget || !$curTarget.length)
            return;

        //NOTE: we should prevent this event for prevent text selection
        Util.preventDefault(e);

        if ($draggedItem !== null)
            onDropItem();

        $draggedItem = $curTarget;

        var itemMargin = Util.getElementMargin($draggedItem),
            itemOffset = Util.getOffsetPosition($draggedItem[0]),
            itemHeight = $draggedItem.height(),
            itemWidth = $draggedItem.width();

        originalItemIndex = getItems().index($draggedItem);

        //calculate mouse offset relative to draggedItem
        mousedownOffset.top = (e.pageY || e.y) - itemOffset.top + (isNaN(itemMargin.top) ? 0 : itemMargin.top);
        mousedownOffset.left = (e.pageX || e.x) - itemOffset.left + (isNaN(itemMargin.left) ? 0 : itemMargin.left);

        updateOffsetLimit();

        //create placeholder item
        $draggedItem.after('<' + opts.itemTag + '>&nbsp</' + opts.itemTag + '>');
        $placeHolderItem = $draggedItem.next();
        ShadowUI.addClass($placeHolderItem, opts.itemClass);
        ShadowUI.addClass($placeHolderItem, PLACE_HOLDER_CLASS);
        $placeHolderItem.css({
            height: itemHeight,
            width: itemWidth
        });

        originalItemStyle = $draggedItem.attr('style') || '';
        ShadowUI.addClass($draggedItem, SORTABLE_CLASS);

        saveItemPositions();

        ShadowUI.bind($(document), 'mousemove', onDragging);
        ShadowUI.bind($(document), 'mouseup', onDropItem);
        ShadowUI.bind($(document), typeof document.onwheel !== 'undefined' ? 'wheel' : 'mousewheel', onMouseWheel);

        if (opts.handlers && opts.handlers.onDragStart)
            opts.handlers.onDragStart($draggedItem, originalItemIndex);
    };

    var onMouseWheel = function (e) {
        //update scrolling
        if (opts.handlers && opts.handlers.onMouseWheel)
            opts.handlers.onMouseWheel(e);

        onDragging(e);

        Util.preventDefault(e);
        return false;
    };

    var onDragging = function (e) {
        if ($draggedItem === null)
            return false;

        var x = e.pageX || e.x,
            y = e.pageY || e.y;

        setDraggedItemPosition(x, y);

        //update scroll
        if (opts.handlers && opts.handlers.onItemMoved)
            opts.handlers.onItemMoved($draggedItem);

        //update elements offsets
        saveItemPositions();
        updateOffsetLimit();

        var replacedElement = findElementForReplace();

        if (replacedElement === null)
            return false;

        if (lastPosTop === null || lastPosTop > y)
            $(replacedElement).before($placeHolderItem);
        else
            $(replacedElement).after($placeHolderItem);

        saveItemPositions();
        lastPosTop = y;

        return false;
    };

    var onDropItem = function () {
        if ($draggedItem === null)
            return;

        ShadowUI.removeClass($draggedItem, SORTABLE_CLASS);

        if (originalItemStyle !== '')
            $draggedItem.attr('style', originalItemStyle);
        else
            $draggedItem.removeAttr('style');


        $placeHolderItem.before($draggedItem);
        $placeHolderItem.remove();
        $placeHolderItem = null;

        var newIndex = getItems().index($draggedItem);

        if (opts.handlers && opts.handlers.onDragEnd)
            opts.handlers.onDragEnd(originalItemIndex, newIndex);

        $draggedItem = null;
        ShadowUI.unbind($(document), 'mousemove', onDragging);
        ShadowUI.unbind($(document), 'mouseup', onDropItem);
        ShadowUI.unbind($(document), typeof document.onwheel !== 'undefined' ? 'wheel' : 'mousewheel', onMouseWheel);

        return false;
    };

    exports.init = function (itemsContainer, options) {
        container = itemsContainer;
        opts = $.extend({}, DEFAULT_OPTIONS, options);

        var firstChild = $(container).children(':first')[0];

        if (!firstChild)
            return;

        if (!opts.itemTag)
            opts.itemTag = $(container).children(':first')[0].tagName.toLowerCase();

        if (!opts.waitSortingStart)
            ShadowUI.bind($(container), 'mousedown', onMousedown);
    };

    exports.startSorting = function(e){
        onMousedown(e);
    };

    exports.stopSorting = function () {
        stopped = true;
    };

    exports.resumeSorting = function () {
        stopped = false;
    };
});
TestCafeClient.define('UI.UXLog', function (require, exports) {
    var Transport = require('Base.Transport'),
        ServiceCommands = require('Shared.ServiceCommands');

    exports.write = function (msg) {
        var loggingMsg = {
            cmd: ServiceCommands.UXLOG,
            msg: msg
        };

        Transport.asyncServiceMsg(loggingMsg);
    };
});
TestCafeClient.define('UI.ValidationMessageFactory', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        ShadowUI = Hammerhead.ShadowUI;

    var VALIDATION_MESSAGE_ELEMENT_ATTRIBUTE_NAME = 'validation-element',
        ERROR_CLASS = 'error',
        WARNING_CLASS = 'warning',
        VALIDATION_CLASS = 'validation',
        ERROR_MESSAGE_CLASS = 'error-message',
        WARNING_MESSAGE_CLASS = 'warning-message',
        WIDE_MESSAGE_CLASS = 'wide';

    function createValidationMessageElement($element) {
        var $messageElement = $('<div></div>').insertAfter($element);

        $('<span></span>').appendTo($messageElement);

        $element.data(VALIDATION_MESSAGE_ELEMENT_ATTRIBUTE_NAME, $messageElement);
        ShadowUI.addClass($messageElement, VALIDATION_CLASS);
        return $messageElement;
    }

    exports.error = function ($element, text, wide) {
        if (text) {
            var $messageElement = $element.data(VALIDATION_MESSAGE_ELEMENT_ATTRIBUTE_NAME) || createValidationMessageElement($element),
                $message = $messageElement.find('span');

            $message.text(text);
            ShadowUI.removeClass($messageElement, WARNING_MESSAGE_CLASS);
            ShadowUI.addClass($messageElement, ERROR_MESSAGE_CLASS);

            if (wide)
                ShadowUI.addClass($message, WIDE_MESSAGE_CLASS);
        }

        ShadowUI.removeClass($element, WARNING_CLASS);
        ShadowUI.addClass($element, ERROR_CLASS);
    };

    exports.warning = function ($element, text) {
        var $messageElement = $element.data(VALIDATION_MESSAGE_ELEMENT_ATTRIBUTE_NAME) || createValidationMessageElement($element);
        $messageElement.find('span').html(text);

        ShadowUI.removeClass($messageElement, ERROR_MESSAGE_CLASS);
        ShadowUI.addClass($messageElement, WARNING_MESSAGE_CLASS);
        ShadowUI.removeClass($element, ERROR_CLASS);
        ShadowUI.addClass($element, WARNING_CLASS);
    };

    exports.success = function ($element) {
        var $messageElement = $element.data(VALIDATION_MESSAGE_ELEMENT_ATTRIBUTE_NAME);
        if ($messageElement) {
            $messageElement.find('span').html('');

            ShadowUI.removeClass($messageElement, ERROR_MESSAGE_CLASS);
            ShadowUI.removeClass($messageElement, WARNING_MESSAGE_CLASS);
        }
        ShadowUI.removeClass($element, ERROR_CLASS);
        ShadowUI.removeClass($element, WARNING_CLASS);
    };
});
TestCafeClient.define('UI.RecorderWidgets.ActionDialogsEditor', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,

        SharedErrors = require('Shared.Errors'),
        RecorderUtil = require('Recorder.Util'),
        DialogPropertyWidget = require('UI.RecorderWidgets.DialogProperty'),
        CheckboxWidget = require('UI.RecorderWidgets.Checkbox'),
        RadioGroupWidget = require('UI.RecorderWidgets.RadioGroup');

    //Const
    var EDITOR_BUTTON_TEXT = 'Browser dialogs',
        BROWSER_DIALOGS_ORDER = ['alert', 'confirm', 'prompt', 'beforeUnload'],
        BROWSER_DIALOG_INDEXES = RecorderUtil.BROWSER_DIALOG_INDEXES,
        PROMPT_DIALOG_NAME = 'prompt',
        CONFIRM_DIALOG_NAME = 'confirm',

        ACTION_OPTIONS_EDITOR_CLASS = 'action-dialogs-editor',
        EDITOR_BUTTON_CLASS = 'editor-button',
        EDITOR_BUTTON_TEXT_CLASS = 'editor-button-text',
        EDITOR_POPUP_CLASS = 'editor-popup',
        SEPARATOR_CLASS = 'separator',
        OPENED_CLASS = 'opened',
        DIALOG_OPTION_AREA = 'dialog-area',
        DIALOG_OPTION_EDITOR_AREA = 'editor-area',
        DIALOG_INDEX_DATA = 'dialog-index',
        CLEAR_CLASS = 'clear',
        FAILED_CLASS = 'failed',

        CONFIRM_RADIO_GROUP_TITLES = ['ok', 'cancel'],
        CONFIRM_VALUE = {
            ok: true,
            cancel: false
        };

    //ActionOptions
    var ActionDialogsEditor = this.exports = function ($container, stepInfo) {
        var dialogsEditor = this;

        this.stepInfo = stepInfo;
        this.dialogNameWithError = stepInfo.dialogError ? stepInfo.dialogError.dialog : null;

        this.$editor = null;
        this.$button = null;
        this.$popup = null;
        this.$dialogAreaWithError = null;

        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            dialogsEditor.eventEmitter.on(ev, listener);
        };

        this._createMarkup($container);
        this._init();
    };

    //Events
    ActionDialogsEditor.OPTION_CHANGED_EVENT = 'optionChangedEvent';

    //Utils
    function addClearElement($to) {
        ShadowUI.addClass($('<div></div>').appendTo($to), CLEAR_CLASS);
    }

    //Markup
    ActionDialogsEditor.prototype._createMarkup = function ($container) {
        this.$editor = $('<div></div>').appendTo($container);
        ShadowUI.addClass(this.$editor, ACTION_OPTIONS_EDITOR_CLASS);

        this.$button = $('<div></div>').appendTo(this.$editor);
        ShadowUI.addClass(this.$button, EDITOR_BUTTON_CLASS);

        var $buttonText = $('<div></div>').text(EDITOR_BUTTON_TEXT).appendTo(this.$button);
        ShadowUI.addClass($buttonText, EDITOR_BUTTON_TEXT_CLASS);

        if (this.dialogNameWithError && $.inArray(this.dialogNameWithError, BROWSER_DIALOGS_ORDER) !== -1)
            ShadowUI.addClass(this.$button, FAILED_CLASS);
    };

    ActionDialogsEditor.prototype._createSeparator = function () {
        if (this.$popup.children().length) {
            var $separator = $('<div></div>').appendTo(this.$popup);
            ShadowUI.addClass($separator, SEPARATOR_CLASS);
        }
    };

    ActionDialogsEditor.prototype._createUncheckedDialog = function (dialogName) {
        this._createSeparator();
        this._createDialogProperty(null, dialogName);
    };

    ActionDialogsEditor.prototype._createPopup = function () {
        this.$popup = $('<div></div>').appendTo(this.$editor);
        ShadowUI.addClass(this.$popup, EDITOR_POPUP_CLASS);

        for (var i = 0; i < BROWSER_DIALOGS_ORDER.length; i++)
            this._createDialogs(BROWSER_DIALOGS_ORDER[i]);

        this.$popup.css('left', this.$button.position().left - this.$popup.width() + this.$button[0].offsetWidth);
    };

    ActionDialogsEditor.prototype._createDialogs = function (dialogName) {
        var dialogsEditor = this,
            stepInfoHandlers = this.stepInfo.nativeDialogHandlers,
            dialogIndex = BROWSER_DIALOG_INDEXES[dialogName],
            handlers = stepInfoHandlers && stepInfoHandlers[dialogIndex] ? stepInfoHandlers[dialogIndex] : null;

        //NOTE: Create unchecked handler
        if (!handlers || !handlers.length) {
            this._createUncheckedDialog(dialogName);
            return;
        }

        var wasCreated = false; //NOTE: problem with disappeared dialog handler after unchecking and reopen dialog popup

        //NOTE: Create all checked handlers
        handlers.forEach(function (handler, index) {
            if (!handler)
                return;

            wasCreated = true;
            dialogsEditor._createSeparator();
            dialogsEditor._createDialogProperty(handler, dialogName, index);
        });

        if (!wasCreated) {
            this._createUncheckedDialog(dialogName);
            return;
        }

        //NOTE: if was some expected dialog and one unexpected dialog we should create unchecked handler to give an opportunity to correct dialog error
        if (this.dialogNameWithError && this.dialogNameWithError.toLowerCase() === dialogName.toLowerCase() && this.stepInfo.dialogError.code === SharedErrors.API_UNEXPECTED_DIALOG) {
            dialogsEditor._createSeparator();
            dialogsEditor._createDialogProperty(null, dialogName, handlers.length);
        }
    };

    ActionDialogsEditor.prototype._createDialogProperty = function (handler, dialogName, index) {
        var dialogsEditor = this,
            $dialogArea = null;

        if (dialogName === PROMPT_DIALOG_NAME)
            $dialogArea = this._createPromptDialogProperty(handler);
        else if (dialogName === CONFIRM_DIALOG_NAME)
            $dialogArea = this._createConfirmDialogProperty(handler);
        else {
            var checkbox = new CheckboxWidget(this.$popup, !!handler, dialogName);
            $dialogArea = checkbox.$checkboxContainer;

            checkbox.on(CheckboxWidget.STATE_CHANGED_EVENT, function (e) {
                if (e.state)
                    dialogsEditor._createDialogHandler($dialogArea.data(DIALOG_INDEX_DATA), dialogName);
                else
                    dialogsEditor._deleteDialogHandler($dialogArea.data(DIALOG_INDEX_DATA), dialogName);

                dialogsEditor.eventEmitter.emit(ActionDialogsEditor.OPTION_CHANGED_EVENT, {dialog: dialogName, state: e.state});
            });
        }

        if (typeof index !== 'undefined')
            $dialogArea.data(DIALOG_INDEX_DATA, index);

        if (this.dialogNameWithError && this.dialogNameWithError.toLowerCase() === dialogName.toLowerCase() && !this.$dialogAreaWithError && !(handler && this.stepInfo.dialogError.code === SharedErrors.API_UNEXPECTED_DIALOG)) {
            ShadowUI.addClass($dialogArea, FAILED_CLASS);
            this.$dialogAreaWithError = $dialogArea;
        }
    };

    ActionDialogsEditor.prototype._createPromptDialogProperty = function (handler) {
        var dialogsEditor = this,
            $dialogArea = $('<div></div>').appendTo(this.$popup),
            checkbox = null,
            $dialogEditorArea = null,
            editor = null;

        ShadowUI.addClass($dialogArea, DIALOG_OPTION_AREA);
        checkbox = new CheckboxWidget($dialogArea, !!handler, PROMPT_DIALOG_NAME);

        checkbox.on(CheckboxWidget.STATE_CHANGED_EVENT, function (e) {
            if (e.state) {
                editor.enable();

                if (editor.isValid())
                    dialogsEditor._createDialogHandler($dialogArea.data(DIALOG_INDEX_DATA), PROMPT_DIALOG_NAME, editor.getEditorText() === null ? null : editor.getEditorText());
            }
            else {
                editor.disable();
                dialogsEditor._deleteDialogHandler($dialogArea.data(DIALOG_INDEX_DATA), PROMPT_DIALOG_NAME);
            }

            dialogsEditor.eventEmitter.emit(ActionDialogsEditor.OPTION_CHANGED_EVENT, {dialog: PROMPT_DIALOG_NAME, state: e.state});
        });

        $dialogEditorArea = $('<div></div>').appendTo($dialogArea);
        ShadowUI.addClass($dialogEditorArea, DIALOG_OPTION_EDITOR_AREA);

        if (!handler) {
            editor = new DialogPropertyWidget($dialogEditorArea, '', '');
            editor.disable();
        }
        else
            editor = new DialogPropertyWidget($dialogEditorArea, '', handler.retValue === null ? 'null' : handler.retValue);

        editor.on(DialogPropertyWidget.VALUE_CHANGED_EVENT, function (e) {
            var dialogIndex = BROWSER_DIALOG_INDEXES[PROMPT_DIALOG_NAME],
                index = $dialogArea.data(DIALOG_INDEX_DATA);

            if (editor.isValid()) {
                dialogsEditor.stepInfo.nativeDialogHandlers[dialogIndex][typeof index === 'undefined' ? 0 : index] = {
                    dialog: PROMPT_DIALOG_NAME,
                    retValue: e.value === 'null' ? null : e.value
                };

                dialogsEditor.eventEmitter.emit(ActionDialogsEditor.OPTION_CHANGED_EVENT, {});
            }
        });

        addClearElement($dialogArea);

        return $dialogArea;
    };

    ActionDialogsEditor.prototype._createConfirmDialogProperty = function (handler) {
        var dialogsEditor = this,
            $dialogArea = $('<div></div>').appendTo(this.$popup),
            checkbox = null,
            $dialogEditorArea = null,
            editor = null;

        ShadowUI.addClass($dialogArea, DIALOG_OPTION_AREA);
        checkbox = new CheckboxWidget($dialogArea, !!handler, CONFIRM_DIALOG_NAME);

        checkbox.on(CheckboxWidget.STATE_CHANGED_EVENT, function (e) {
            if (e.state) {
                editor.enable();
                dialogsEditor._createDialogHandler($dialogArea.data(DIALOG_INDEX_DATA), CONFIRM_DIALOG_NAME, CONFIRM_VALUE[CONFIRM_RADIO_GROUP_TITLES[editor.checkedIndex]]);
            }
            else {
                editor.disable();
                dialogsEditor._deleteDialogHandler($dialogArea.data(DIALOG_INDEX_DATA), CONFIRM_DIALOG_NAME);
            }

            dialogsEditor.eventEmitter.emit(ActionDialogsEditor.OPTION_CHANGED_EVENT, {dialog: CONFIRM_DIALOG_NAME, state: e.state});
        });

        $dialogEditorArea = $('<div></div>').appendTo($dialogArea);
        ShadowUI.addClass($dialogEditorArea, DIALOG_OPTION_EDITOR_AREA);

        editor = new RadioGroupWidget($dialogEditorArea, CONFIRM_RADIO_GROUP_TITLES, !handler || handler.retValue === true ? 0 : 1);

        if (!handler)
            editor.disable();

        editor.on(RadioGroupWidget.CHECKED_INDEX_CHANGED, function (e) {
            var dialogIndex = BROWSER_DIALOG_INDEXES[CONFIRM_DIALOG_NAME],
                index = $dialogArea.data(DIALOG_INDEX_DATA);

            dialogsEditor.stepInfo.nativeDialogHandlers[dialogIndex][typeof index === 'undefined' ? 0 : index] = {
                dialog: CONFIRM_DIALOG_NAME,
                retValue: CONFIRM_VALUE[CONFIRM_RADIO_GROUP_TITLES[e.checkedIndex]]
            };

            dialogsEditor.eventEmitter.emit(ActionDialogsEditor.OPTION_CHANGED_EVENT, {});
        });

        addClearElement($dialogArea);

        return $dialogArea;
    };

    //Behavior
    ActionDialogsEditor.prototype._init = function () {
        var dialogsEditor = this;

        this.$button.mousedown(function () {
            if (!dialogsEditor.$popup || dialogsEditor.$popup.css('visibility') === 'hidden')
                dialogsEditor.showPopup();
            else
                dialogsEditor.hidePopup();
        });
    };

    ActionDialogsEditor.prototype._createDialogHandler = function (index, dialogName, retValue) {
        var dialogIndex = BROWSER_DIALOG_INDEXES[dialogName],
            dialogHandler = {
                dialog: dialogName,
                retValue: retValue
            };

        if (!this.stepInfo.nativeDialogHandlers)
            this.stepInfo.nativeDialogHandlers = [];

        if (!this.stepInfo.nativeDialogHandlers[dialogIndex])
            this.stepInfo.nativeDialogHandlers[dialogIndex] = [];

        this.stepInfo.nativeDialogHandlers[dialogIndex][typeof index === 'undefined' ? 0 : index] = dialogHandler;
    };

    ActionDialogsEditor.prototype._deleteDialogHandler = function (index, dialogName) {
        var dialogIndex = BROWSER_DIALOG_INDEXES[dialogName];

        if (this.stepInfo.nativeDialogHandlers[dialogIndex][index]) {
            delete this.stepInfo.nativeDialogHandlers[dialogIndex][index];

            if (!this.stepInfo.nativeDialogHandlers[dialogIndex].length)
                delete this.stepInfo.nativeDialogHandlers[dialogIndex];
        }
        else if (this.stepInfo.nativeDialogHandlers[dialogIndex])
            delete this.stepInfo.nativeDialogHandlers[dialogIndex];

        if (!this.stepInfo.nativeDialogHandlers.length)
            delete this.stepInfo.nativeDialogHandlers;
        else {
            var isEmpty = true;

            $.each(this.stepInfo.nativeDialogHandlers, function (index, handlers) {
                if (handlers && handlers.length) {
                    isEmpty = false;
                    return false;
                }
            });

            if (isEmpty)
                delete this.stepInfo.nativeDialogHandlers;
        }
    };

    ActionDialogsEditor.prototype.removeError = function () {
        this.dialogNameWithError = null;

        if (this.$dialogAreaWithError) {
            ShadowUI.removeClass(this.$dialogAreaWithError, FAILED_CLASS);
            ShadowUI.removeClass(this.$button, FAILED_CLASS);
        }

        this.$dialogAreaWithError = null;
    };

    ActionDialogsEditor.prototype.showPopup = function () {
        var dialogsEditor = this;

        if (!this.$popup)
            this._createPopup();
        else
            this.$popup.css('visibility', '');

        ShadowUI.addClass(this.$button, OPENED_CLASS);

        ShadowUI.bind($(document), 'mousedown', function (e) {
            if (!dialogsEditor.$editor.find(e.target).length) {
                ShadowUI.unbind($(document), 'mousedown', arguments.callee);
                dialogsEditor.hidePopup();
            }
        });
    };

    ActionDialogsEditor.prototype.hidePopup = function () {
        if (this.$popup) {
            this.$popup.css('visibility', 'hidden');
            ShadowUI.removeClass(this.$button, OPENED_CLASS);
        }
    };
});
TestCafeClient.define('UI.RecorderWidgets.ActionOptionsEditor', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,

        DialogPropertyWidget = require('UI.RecorderWidgets.DialogProperty'),
        CheckboxWidget = require('UI.RecorderWidgets.Checkbox');

    //Const
    var API_ARGUMENTS_OPTIONS_ORDER = ['ctrl', 'alt', 'shift', 'meta', 'caretPos', 'offsetX', 'offsetY'],
        OFFSET_X_PROPERTY_NAME = 'offsetX',
        OFFSET_Y_PROPERTY_NAME = 'offsetY',
        OFFSET_X_LABEL_TEXT = 'X:',
        OFFSET_Y_LABEL_TEXT = 'Y:',

        OFFSET_OPTIONS_CHECKBOX_TITLE = 'Use offsets',

        ACTION_OPTIONS_EDITOR_CLASS = 'action-options-editor',
        EDITOR_BUTTON_CLASS = 'editor-button',
        EDITOR_POPUP_CLASS = 'editor-popup',
        SEPARATOR_CLASS = 'separator',
        OPENED_CLASS = 'opened',
        OFFSETS_AREA_CLASS = 'offsets-area',
        OFFSET_EDITORS_AREA_CLASS = 'offset-editors-area';

    //ActionOptions
    var ActionOptionsEditor = this.exports = function ($container, stepInfo) {
        var editor = this;

        this.stepInfo = stepInfo;
        this.$editor = null;
        this.$button = null;
        this.$popup = null;

        this.propertyEditors = [];
        this.offsetPropertyEditors = [];

        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            editor.eventEmitter.on(ev, listener);
        };

        this._createMarkup($container);

        this._init();
    };

    //Events
    ActionOptionsEditor.OPTION_CHANGED_EVENT = 'optionChangedEvent';

    //Markup
    ActionOptionsEditor.prototype._createMarkup = function ($container) {
        this.$editor = $('<div></div>').appendTo($container);
        ShadowUI.addClass(this.$editor, ACTION_OPTIONS_EDITOR_CLASS);

        this.$button = $('<div></div>').appendTo(this.$editor);
        ShadowUI.addClass(this.$button, EDITOR_BUTTON_CLASS);

        var $buttonText = $('<div></div>').text('Options').appendTo(this.$button);
        ShadowUI.addClass($buttonText, 'editor-button-text');
    };

    ActionOptionsEditor.prototype._createPopup = function () {
        var editor = this,
            offsetAreaCreated = false;

        this.$popup = $('<div></div>').appendTo(this.$editor);
        ShadowUI.addClass(this.$popup, EDITOR_POPUP_CLASS);

        for (var i = 0; i < API_ARGUMENTS_OPTIONS_ORDER.length; i++) {
            var optionName = API_ARGUMENTS_OPTIONS_ORDER[i];
            var isOffsetOption = optionName === OFFSET_X_PROPERTY_NAME || optionName === OFFSET_Y_PROPERTY_NAME;
            if (this.stepInfo.actionDescriptor.apiArguments.options.hasOwnProperty(optionName)) {
                if (isOffsetOption && offsetAreaCreated)
                    continue;

                if (this.$popup.children().length) {
                    var $separator = $('<div></div>').appendTo(this.$popup);
                    ShadowUI.addClass($separator, SEPARATOR_CLASS);
                }

                if (isOffsetOption) {
                    this._createOffsetsArea();
                    offsetAreaCreated = true;
                }
                else
                    this._createOption(optionName, optionName, this.$popup);
            }
        }

        editor._updateOffsetOptionsEditability();

        this.$popup.css('left', this.$button.position().left - this.$popup.width() + this.$button[0].offsetWidth);
    };

    ActionOptionsEditor.prototype._createOffsetsArea = function () {
        var editor = this;

        var $offsetsArea = $('<div></div>').appendTo(this.$popup);
        ShadowUI.addClass($offsetsArea, OFFSETS_AREA_CLASS);

        var checkBox = new CheckboxWidget($offsetsArea, this.stepInfo.useOffsets, OFFSET_OPTIONS_CHECKBOX_TITLE);

        checkBox.on(CheckboxWidget.STATE_CHANGED_EVENT, function (e) {
            editor.stepInfo.useOffsets = e.state;
            editor._updateOffsetOptionsEditability();
            editor.eventEmitter.emit(ActionOptionsEditor.OPTION_CHANGED_EVENT, {});
        });

        var $offsetEditorsArea = $('<div></div>').appendTo($offsetsArea);
        ShadowUI.addClass($offsetEditorsArea, OFFSET_EDITORS_AREA_CLASS);

        this.offsetPropertyEditors.push(this._createOption(OFFSET_X_PROPERTY_NAME, OFFSET_X_LABEL_TEXT, $offsetEditorsArea));
        this.offsetPropertyEditors.push(this._createOption(OFFSET_Y_PROPERTY_NAME, OFFSET_Y_LABEL_TEXT, $offsetEditorsArea));
    };

    ActionOptionsEditor.prototype._createOption = function (name, labelText, $container) {
        var editor = this;

        var options = this.stepInfo.actionDescriptor.apiArguments.options;

        if (typeof options[name] === 'boolean') {
            var checkBox = new CheckboxWidget($container, options[name], labelText);

            checkBox.on(CheckboxWidget.STATE_CHANGED_EVENT, function (e) {
                options[name] = e.state;
                editor.eventEmitter.emit(ActionOptionsEditor.OPTION_CHANGED_EVENT, {});
            });

            return checkBox;
        }
        else {
            var property = new DialogPropertyWidget($container, labelText, options[name], {
                isNumericProperty: true,
                isNotNegativeNumericProperty: true
            });

            this.propertyEditors.push(property);

            property.on(DialogPropertyWidget.VALUE_CHANGED_EVENT, function (e) {
                if (property.isValid())
                    options[name] = e.value;
                editor.eventEmitter.emit(ActionOptionsEditor.OPTION_CHANGED_EVENT, {});
            });

            return property;
        }
    };

    ActionOptionsEditor.prototype._updateOffsetOptionsEditability = function () {
        for (var i = 0; i < this.offsetPropertyEditors.length; i++) {
            if (this.stepInfo.useOffsets && this.offsetPropertyEditors[i].isDisabled)
                this.offsetPropertyEditors[i].enable();
            else if (!this.stepInfo.useOffsets && !this.offsetPropertyEditors[i].isDisabled)
                this.offsetPropertyEditors[i].disable();
        }
    };

    //Behavior
    ActionOptionsEditor.prototype._init = function () {
        var editor = this;

        this.$button.mousedown(function () {
            if (!editor._isPopupVisible())
                editor._showPopup();
            else
                editor._hidePopup();
        });
    };

    ActionOptionsEditor.prototype._showPopup = function () {
        var editor = this;

        if (!this.$popup)
            this._createPopup();
        else
            this.$popup.css('visibility', '');

        ShadowUI.addClass(this.$button, OPENED_CLASS);

        ShadowUI.bind($(document), 'mousedown', function (e) {
            if (!editor.$editor.find(e.target).length) {
                ShadowUI.unbind($(document), 'mousedown', arguments.callee);
                editor._hidePopup();
            }
        });
    };

    ActionOptionsEditor.prototype._hidePopup = function () {
        if (this.$popup) {
            this.$popup.css('visibility', 'hidden');
            ShadowUI.removeClass(this.$button, OPENED_CLASS);
        }
    };

    ActionOptionsEditor.prototype._isPopupVisible = function () {
        return this.$popup && this.$popup.css('visibility') !== 'hidden';
    };

    ActionOptionsEditor.prototype.isValid = function () {
        for (var i = 0; i < this.propertyEditors.length; i++)
            if (!this.propertyEditors[i].isValid())
                return false;
        return true;
    };
});
TestCafeClient.define('UI.RecorderWidgets.ActionStep', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,

        SharedErrors = require('Shared.Errors'),
        SharedConst = require('Shared.Const'),

        BaseStep = require('UI.RecorderWidgets.BaseStep'),
        TextSelection = Hammerhead.TextSelection,
        ComboboxWidget = require('UI.RecorderWidgets.Combobox'),
        DialogPropertyWidget = require('UI.RecorderWidgets.DialogProperty'),
        ActionOptionsEditorWidget = require('UI.RecorderWidgets.ActionOptionsEditor'),
        ActionDialogsEditorWidget = require('UI.RecorderWidgets.ActionDialogsEditor'),

        SelectorEditorWidget = require('UI.RecorderWidgets.SelectorEditor'),
        ElementsMarkerWidget = require('UI.RecorderWidgets.ElementsMarker');

    //Const
    var API_ARGUMENTS_ORDERS = {
            click: ['options'],
            rclick: ['options'],
            dblclick: ['options'],
            drag: ['options', 'dragOffsetX', 'dragOffsetY'],
            hover: ['options'],
            type: ['options', 'text'],
            press: ['keysCommand'],
            wait: ['ms'],
            select: ['startPos', 'endPos'],
            upload: ['files'],
            screenshot: []
        },

        ACTION_STEP_CLASS = 'action-step',
        SELECTOR_EDITOR_CONTAINER_CLASS = 'selector-editor-container',
        ARGUMENTS_CLASS = 'arguments',
        OPTIONS_CLASS = 'options',
        ACTION_TYPE_CLASS = 'action-type',
        ACTION_ICON_CLASS = 'action-icon',
        PROPERTY_CLASS = 'dialog-property',
        SELECTOR_AREA_CLASS = 'selector-area',
        ARGUMENTS_CONTAINER_CLASS = 'arguments-container',

        IFRAME_SELECTOR_LABEL_TEXT = 'IFrame selector:',
        ELEMENT_SELECTOR_LABEL_TEXT = 'Target selector:',

        ELEMENT_SELECTOR_HEIGHT = 100,
        IFRAME_SELECTOR_HEIGHT = 100;

    //ActionStep
    var ActionStep = this.exports = function ($container, stepNum, stepInfo, options) {
        options = options || {};
        this.options = {
            enableFloatMode: options.enableFloatMode || false,
            $floatingParent: options.$floatingParent || null,
            enableSelectorValidation: options.enableSelectorValidation || false,
            enableElementsMarking: options.enableElementsMarking || false,
            stretchSelectorEditor: options.stretchSelectorEditor || false,
            allowVisibleElementsOnly: options.allowVisibleElementsOnly || false,
            dialogError: options.dialogError || stepInfo.dialogError
        };

        BaseStep.apply(this, [$container, stepNum, stepInfo, this.options]);

        this.actionDescriptor = stepInfo.actionDescriptor;

        this.argumentPropertyEditors = [];
        this.optionsEditor = null;
        this.dialogsEditor = null;
        this.selectorEditor = null;
        this.iFrameSelectorEditor = null;

        this.$argumentsContainer = null;

        this._createMarkup();
        this._init();
    };

    Util.inherit(ActionStep, BaseStep);

    //Events
    ActionStep.STEP_NAME_CHANGED_EVENT = BaseStep.STEP_NAME_CHANGED_EVENT;
    ActionStep.STEP_INFO_CHANGED_EVENT = BaseStep.STEP_INFO_CHANGED_EVENT;
    ActionStep.SELECTOR_EDITOR_FOCUSED_EVENT = 'selectorEditorFocused';
    ActionStep.SELECTOR_EDITOR_BLURED_EVENT = 'selectorEditorBlured';

    //Util
    function getPropertyOptions(propertyName) {
        return {
            isReadOnly: /^files/i.test(propertyName),
            isKeysProperty: /^key/.test(propertyName.toLowerCase()),
            isNumericProperty: !(/text|^key/.test(propertyName.toLowerCase())),
            isPositiveNumericProperty: (/^ms$/.test(propertyName.toLowerCase())),
            maximizeInput: propertyName.toLowerCase() === 'text',
            smallInput: /startPos|endPos|ms|keys/i.test(propertyName)
        };
    }

    //Markup
    ActionStep.prototype._createMarkup = function () {
        ShadowUI.addClass(this.$step, ACTION_STEP_CLASS);
        this._createBackground();
        this._createArguments(this.$step);

        if (typeof this.stepInfo.selectors !== 'undefined')
            this._createSelectorArea(this.$step);
    };

    ActionStep.prototype._createComboBoxProperty = function ($container, name, value) {
        var $property = $('<div></div>').appendTo($container);
        ShadowUI.addClass($property, PROPERTY_CLASS);

        var inputId = SharedConst.PROPERTY_PREFIX + name + Math.random().toString().replace('0.', '-');

        this._createLabel($property, name, inputId);
        return new ComboboxWidget($property, ['true', 'false'], value, inputId);
    };

    ActionStep.prototype._createArgumentsProperty = function ($container, name, value, obj) {
        var step = this;

        var property = new DialogPropertyWidget($container, this._getArgumentPropertyLabelText(name), value, getPropertyOptions(name));

        this.argumentPropertyEditors.push(property);

        property.on(DialogPropertyWidget.VALUE_CHANGED_EVENT, function (e) {
            obj[name] = e.value;

            step._onChangePropertyValue();
        });
    };

    ActionStep.prototype._getArgumentPropertyLabelText = function (propertyName) {
        if (/keyscommand/i.test(propertyName))
            return 'Keys:';
        else
            return propertyName + ':';
    };

    ActionStep.prototype._createArgumentsContainer = function ($container) {
        this.$argumentsContainer = $('<div></div>').appendTo($container);
        ShadowUI.addClass(this.$argumentsContainer, ARGUMENTS_CONTAINER_CLASS);
    };


    ActionStep.prototype._createOptionsEditor = function ($container) {
        var step = this;

        if (!this.$argumentsContainer)
            this._createArgumentsContainer($container);

        this.optionsEditor = new ActionOptionsEditorWidget(this.$argumentsContainer, this.stepInfo);

        this.optionsEditor.on(ActionOptionsEditorWidget.OPTION_CHANGED_EVENT, function () {
            step._onChangePropertyValue();
        });
    };

    ActionStep.prototype._createBrowserDialogsEditor = function ($container) {
        var step = this;

        if (!this.$argumentsContainer)
            this._createArgumentsContainer($container);

        this.dialogsEditor = new ActionDialogsEditorWidget(this.$argumentsContainer, this.stepInfo);

        this.dialogsEditor.on(ActionDialogsEditorWidget.OPTION_CHANGED_EVENT, function (e) {
            if (step._hasNativeDialogError() && e.dialog) {
                if ((step.options.dialogError.code === SharedErrors.API_EXPECTED_DIALOG_DOESNT_APPEAR && step.options.dialogError.dialog === e.dialog && !e.state) ||
                    (step.options.dialogError.code === SharedErrors.API_UNEXPECTED_DIALOG && step.options.dialogError.dialog === e.dialog && e.state)) {
                    step.options.dialogError = null;
                    step.stepInfo.dialogError = null;
                    step.dialogsEditor.removeError();
                }
            }

            step._onChangePropertyValue();
        });
    };

    ActionStep.prototype._createArguments = function ($container) {
        var step = this;

        var $arguments = $('<div></div>').appendTo($container);
        ShadowUI.addClass($arguments, ARGUMENTS_CLASS);

        var $actionType = $('<div></div>').appendTo($arguments);
        ShadowUI.addClass($actionType, ACTION_TYPE_CLASS);

        var actionName = this.actionDescriptor.type.toLowerCase();
        $('<span></span>').text(actionName).appendTo($actionType);
        var $icon = $('<div></div>').appendTo($actionType);
        ShadowUI.addClass($icon, ACTION_ICON_CLASS);
        ShadowUI.addClass($icon, actionName);

        var $options = null,
            apiArgumentOrder = API_ARGUMENTS_ORDERS[step.actionDescriptor.type],
            apiArguments = step.actionDescriptor.apiArguments;

        if (!apiArgumentOrder.length)
            step._createBrowserDialogsEditor($arguments);

        for (var i = 0; i < apiArgumentOrder.length; i++) {
            var argName = apiArgumentOrder[i],
                argOptions = getPropertyOptions(argName),
                argValue = apiArguments[argName],
                isArgValueEmpty = argValue ? (argValue.join ? !argValue.join('') : !argValue) : true;

            if (argOptions.isReadOnly && isArgValueEmpty)
                continue;

            if (argValue !== null) {
                if (argName === 'options') {
                    step._createOptionsEditor($arguments);
                    step._createBrowserDialogsEditor($arguments);
                }
                else {
                    if (!this.dialogsEditor)
                        step._createBrowserDialogsEditor($arguments);

                    if (!$options) {
                        $options = $('<div>').appendTo($arguments);
                        ShadowUI.addClass($options, OPTIONS_CLASS);
                    }
                    step._createArgumentsProperty($options, argName, argValue, apiArguments);
                }
            }
        }
    };

    ActionStep.prototype._createSelectorArea = function ($container) {
        var $selectorArea = $('<div></div>').appendTo($container);

        ShadowUI.addClass($selectorArea, SELECTOR_AREA_CLASS);

        if (this.stepInfo.iFrameSelectors)
            this._createIFrameSelectorEditor($selectorArea);

        this._createElementSelectorEditor($selectorArea);
    };

    ActionStep.prototype._createSelectorProperty = function ($container, text) {
        var $property = $('<div></div>').appendTo($container);
        ShadowUI.addClass($property, PROPERTY_CLASS);

        var $label = this._createLabel($property, text);
        $label.css('textTransform', 'none');
    };

    ActionStep.prototype._createIFrameSelectorEditor = function ($container) {
        this._createSelectorProperty($container, IFRAME_SELECTOR_LABEL_TEXT);

        var $iFrameSelectorEditorContainer = $('<div></div>').appendTo($container);
        ShadowUI.addClass($iFrameSelectorEditorContainer, SELECTOR_EDITOR_CONTAINER_CLASS);

        this.iFrameSelectorEditor = new SelectorEditorWidget($iFrameSelectorEditorContainer, {
            width: '100%',
            height: IFRAME_SELECTOR_HEIGHT,
            selectors: this.stepInfo.iFrameSelectors,
            currentSelectorIndex: this.stepInfo.currentIFrameSelectorIndex,
            allowEdit: true,
            enableFloatMode: false,
            enableValidation: false,
            enableElementsMarking: false
        });
    };

    ActionStep.prototype._createElementSelectorEditor = function ($container) {
        this._createSelectorProperty($container, ELEMENT_SELECTOR_LABEL_TEXT);

        var $editorContainer = $('<div></div>').appendTo($container);
        ShadowUI.addClass($editorContainer, SELECTOR_EDITOR_CONTAINER_CLASS);

        var context = (this.iFrameSelectorEditor && this.iFrameSelectorEditor.getParsedSelector().length) ?
            this.iFrameSelectorEditor.getParsedSelector().$elements[0].contentWindow :
            null;

        this.selectorEditor = new SelectorEditorWidget($editorContainer, {
            width: '100%',
            height: ELEMENT_SELECTOR_HEIGHT,
            selectors: this.stepInfo.selectors,
            currentSelectorIndex: this.stepInfo.currentSelectorIndex,
            allowEdit: true,
            enableFloatMode: this.options.enableFloatMode,
            $floatingParent: this.options.$floatingParent,
            enableValidation: this.options.enableSelectorValidation,
            enableElementsMarking: this.options.enableElementsMarking,
            allowVisibleElementsOnly: this.options.allowVisibleElementsOnly,
            context: context
        });
    };

    ActionStep.prototype._createBackground = function () {
        if (this.options.enableElementsMarking)
            ElementsMarkerWidget.mark(this.options.$floatingParent || this.$step, $());
    };

    //Behavior
    ActionStep.prototype._init = function () {
        var step = this;

        if (this._hasNativeDialogError())
            this.dialogsEditor.showPopup();

        if (typeof step.stepInfo.selectors !== 'undefined')
            this._initSelectorEditor();

        if (this.iFrameSelectorEditor)
            this._initIFrameSelectorEditor();

        if (this.selectorEditor) {
            this.selectorEditor.on(SelectorEditorWidget.FOCUS_EVENT, function () {
                step.eventEmitter.emit(ActionStep.SELECTOR_EDITOR_FOCUSED_EVENT);
            });

            this.selectorEditor.on(SelectorEditorWidget.BLUR_EVENT, function () {
                step.eventEmitter.emit(ActionStep.SELECTOR_EDITOR_BLURED_EVENT);
            });
        }

        if (this.actionDescriptor.type === 'wait')
            this._initWaitActionDialogSpecificBehavior();
    };

    ActionStep.prototype._initWaitActionDialogSpecificBehavior = function () {
        var step = this,
            msInput = null;

        function getAutoGeneratedStepName(ms) {
            return 'Wait ' + ms + ' milliseconds';
        }

        function isStepNameAutoGenerated(ms, message) {
            return getAutoGeneratedStepName(ms) === message;
        }

        for (var i = 0; i < this.argumentPropertyEditors.length; i++)
            if (/^ms:$/i.test(this.argumentPropertyEditors[i].getLabelText()))
                msInput = this.argumentPropertyEditors[i].getInputElement();

        msInput.focus();
        TextSelection.select(msInput);

        var savedValue = msInput.value;

        $(msInput).bind('input', function () {
            if (isStepNameAutoGenerated(savedValue, step.stepNamePropertyEditor.getEditorText())) {
                step.stepNamePropertyEditor.setEditorText(getAutoGeneratedStepName(msInput.value));
            }

            savedValue = msInput.value;
        });
    };

    ActionStep.prototype._initIFrameSelectorEditor = function () {
        var step = this;

        this.iFrameSelectorEditor.on(SelectorEditorWidget.SELECTOR_CHANGED_EVENT, function (e) {
            step.stepInfo.currentIFrameSelectorIndex = e.index;

            step.eventEmitter.emit(ActionStep.STEP_INFO_CHANGED_EVENT, {
                stepInfo: step.stepInfo
            });
        });
    };

    ActionStep.prototype._initSelectorEditor = function () {
        var step = this;

        this.selectorEditor.on(SelectorEditorWidget.SELECTOR_CHANGED_EVENT, function (e) {
            step.actionDescriptor.selector = e.parsedSelector.selector;
            //NOTE: we store element in descriptor before it's changed only
            step.actionDescriptor.element = null;

            step.stepInfo.currentSelectorIndex = e.index;

            step.eventEmitter.emit(ActionStep.STEP_INFO_CHANGED_EVENT, {
                selector: e.text
            });
        });
    };

    ActionStep.prototype._onChangePropertyValue = function () {
        this.eventEmitter.emit(ActionStep.STEP_INFO_CHANGED_EVENT, {
            stepInfo: this.stepInfo
        });
    };

    //Validation
    ActionStep.prototype._hasPropertyError = function () {
        for (var i = 0; i < this.argumentPropertyEditors.length; i++)
            if (!this.argumentPropertyEditors[i].isValid())
                return true;
        return false;
    };

    ActionStep.prototype._hasNativeDialogError = function () {
        return  this.options.dialogError && this.options.dialogError.dialog &&
            (this.options.dialogError.code === SharedErrors.API_EXPECTED_DIALOG_DOESNT_APPEAR || this.options.dialogError.code === SharedErrors.API_UNEXPECTED_DIALOG);
    };

    //API
    ActionStep.prototype.getParsedSelector = function () {
        return this.selectorEditor ? this.selectorEditor.getParsedSelector() : null;
    };

    ActionStep.prototype.isValid = function (skipPageStateDependentErrors) {
        if (this._hasPropertyError())
            return false;
        else if (!skipPageStateDependentErrors && this._hasNativeDialogError())
            return false;
        else if (this.optionsEditor && !this.optionsEditor.isValid())
            return false;
        else if (this.selectorEditor) {
            if (this.iFrameSelectorEditor && !this.iFrameSelectorEditor.isValid(skipPageStateDependentErrors))
                return false;

            return this.selectorEditor.isValid(skipPageStateDependentErrors);
        }
        else
            return true;
    };

    ActionStep.prototype.destroy = function () {
        if (this.selectorEditor)
            this.selectorEditor.destroy();

        ElementsMarkerWidget.clear();
    };
});
TestCafeClient.define('UI.RecorderWidgets.AddActionDialog', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,

        PopupWidget = require('UI.RecorderWidgets.Popup'),
        ButtonWidget = require('UI.RecorderWidgets.Button'),
        BaseStepWidget = require('UI.RecorderWidgets.BaseStep'),
        ActionStepWidget = require('UI.RecorderWidgets.ActionStep'),
        AssertionsStepWidget = require('UI.RecorderWidgets.AssertionsStep');

    //Const
    var BUTTONS_CLASS = 'buttons',
        POPUP_HEADER_NUMBER_CLASS = 'number',
        ADD_ACTION_DIALOG_WIDTH = 550,
        ADD_ASSERTION_DIALOG_WIDTH = 606;

    var AddActionDialog = this.exports = function ($container, stepNum, stepInfo) {
        var dialog = this;

        this.popup = null;
        this.step = null;

        this.$addActionButton = null;
        this.$cancelButton = null;

        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            dialog.eventEmitter.on(ev, listener);
        };

        this._createDialog($container, stepNum, stepInfo);

        this._init();
    };

    //Events
    AddActionDialog.ADD_ACTION_BUTTON_CLICK_EVENT = 'addActionButtonClick';
    AddActionDialog.CANCEL_BUTTON_CLICK_EVENT = 'cancelButtonClick';
    AddActionDialog.START_PICKING_ELEMENT_EVENT = 'startPickingElement';

    //Markup
    AddActionDialog.prototype._createDialog = function ($container, stepNum, stepInfo) {
        var $stepArea = $('<div></div>');

        var popupOptions = {
            width: stepInfo.isAssertion ? ADD_ASSERTION_DIALOG_WIDTH : ADD_ACTION_DIALOG_WIDTH,
            headerIconText: stepNum,
            headerIconClass: POPUP_HEADER_NUMBER_CLASS,
            headerText: stepInfo.name,
            content: $stepArea,
            footerContent: this._createButtons(stepInfo),
            backgroundOpacity: true,
            showAtWindowCenter: true,
            footerWithoutTopMargins: stepInfo.isAssertion
        };

        this.popup = new PopupWidget($container, popupOptions);

        if (stepInfo.isAssertion) {
            this.step = new AssertionsStepWidget($stepArea, stepNum, stepInfo, {
                enableAssertionsValidation: true,
                parentPopup: this.popup
            });
            this.popup.showAtWindowCenter();
        }
        else {
            this.step = new ActionStepWidget($stepArea, stepNum, stepInfo, {
                enableFloatMode: true,
                $floatingParent: this.popup.getContainer(),
                enableSelectorValidation: true,
                enableElementsMarking: true
            });

            var parsedSelector = this.step.getParsedSelector();

            if (parsedSelector && parsedSelector.length && parsedSelector.$elements)
                this.popup.disposeRelativeToElement(parsedSelector.$elements);
        }
    };

    AddActionDialog.prototype._createButtons = function () {
        var $buttons = $('<div></div>');
        ShadowUI.addClass($buttons, BUTTONS_CLASS);

        this.$addActionButton = ButtonWidget.create($buttons, 'OK');
        this.$cancelButton = ButtonWidget.create($buttons, 'Cancel');

        return $buttons;
    };

    AddActionDialog.prototype._onError = function () {
        this.$addActionButton.attr('disabled', 'disabled');
    };

    AddActionDialog.prototype._onSuccess = function () {
        this.$addActionButton.removeAttr('disabled');
    };

    //Behavior
    AddActionDialog.prototype._init = function () {
        var dialog = this;

        ShadowUI.bind(this.$addActionButton, 'click', function () {
            dialog._close(function () {
                dialog.eventEmitter.emit(AddActionDialog.ADD_ACTION_BUTTON_CLICK_EVENT, {
                    stepInfo: dialog.step.getStepInfo()
                });
            });
        });

        ShadowUI.bind(this.$cancelButton, 'click', function () {
            dialog._close(function () {
                dialog.eventEmitter.emit(AddActionDialog.CANCEL_BUTTON_CLICK_EVENT, {});
            });
        });

        this.popup.onkeydown(function (e) {
            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.enter) {
                if (dialog.$addActionButton && dialog.$addActionButton.css('visibility') !== 'hidden')
                    dialog.$addActionButton.trigger('click');
                Util.preventDefault(e);
            }

            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.esc) {
                dialog.$cancelButton.trigger('click');
                Util.preventDefault(e);
            }
        }, true, true);

        this.step.on(BaseStepWidget.STEP_INFO_CHANGED_EVENT, function () {
            if (!dialog.step.isValid())
                dialog._onError();
            else
                dialog._onSuccess();
        });

        this.step.on(BaseStepWidget.STEP_NAME_CHANGED_EVENT, function (e) {
            dialog.popup.setHeaderText(e.name);
        });

        if (this.step.getStepInfo().isAssertion) {
            this.step.on(AssertionsStepWidget.START_PICKING_ELEMENT_EVENT, function (e) {
                dialog.eventEmitter.emit(AddActionDialog.START_PICKING_ELEMENT_EVENT, e);
            });
        }
        else {
            this.step.on(ActionStepWidget.SELECTOR_EDITOR_FOCUSED_EVENT, function () {
                dialog.popup.$header.css('cursor', 'default');
                dialog.popup.blind(true);
            });

            this.step.on(ActionStepWidget.SELECTOR_EDITOR_BLURED_EVENT, function () {
                dialog.popup.blind(false);
                dialog.popup.$header.css('cursor', 'move');
                dialog.popup.getContainer().focus();
            });
        }

        if (!dialog.step.isValid())
            dialog._onError();
    };

    AddActionDialog.prototype._close = function (callback) {
        this.step.destroy();
        this.popup.close(callback);
    };
});
TestCafeClient.define('UI.RecorderWidgets.AuthenticationDialog', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        ValidationMessageFactory = require('UI.ValidationMessageFactory'),
        PopupWidget = require('UI.RecorderWidgets.Popup'),
        ButtonWidget = require('UI.RecorderWidgets.Button');

    //Const
    var HEADER_TEXT = 'Authentication Required',
        LOGIN_BUTTON_TEXT = 'Log In',
        CANCEL_BUTTON_TEXT = 'Cancel',
        USERNAME_LABEL_TEXT = 'User Name:',
        PASSWORD_LABEL_TEXT = 'Password:',
        SERVER_MESSAGE_TEXT_PATTERN = '<p>The %s website requires authentication. Please fill in the username and password to log in.</p>' +
            '<br /><p>The login information will be saved to the fixture file.</p>',

    //Events
        LOG_IN_BUTTON_CLICK_EVENT = 'logInButtonClick',
        CANCEL_BUTTON_CLICK_EVENT = 'cancelButtonClick',

    //Classes
        AUTHENTICATION_DIALOG_CONTENT_CLASS = 'authentication-dialog-area',
        CREDENTIALS_AREA_CLASS = 'credentials-area',
        LOGIN_AREA_CLASS = 'login-area',
        MESSAGE_AREA_CLASS = 'message',
        FIELD_CLASS = 'field',
        VALUE_CLASS = 'value',
        INPUT_CLASS = 'input',
        INPUT_SEPARATOR_CLASS = 'input-separator',
        BUTTONS_CLASS = 'buttons';

    //Globals
    var eventEmitter = null,
        popup = null,
        $usernameInput = null,
        $passwordInput = null,
        $inputSeparator = null;

    //Util
    var createMessage = function (url, message) {
        return SERVER_MESSAGE_TEXT_PATTERN.replace('%s', url).replace('%s', message);
    };

    //Markup
    var createDialog = function ($container, options) {
        var pageUrl = options.originUrl,
            serverMessage = options.serverMessage || '',
            username = options.username || '',
            password = options.password || '',
            errorMessage = options.errorMessage;

        var popupOptions = {
            width: 750,
            content: createContent(createMessage(pageUrl, serverMessage), username, password),
            headerText: HEADER_TEXT,
            footerContent: createButtons(options.cancelButtonText),
            showAtWindowCenter: true,
            notDialog: true
        };

        if (errorMessage)
            exports.showErrorMessage(errorMessage);

        popup = new PopupWidget($container, popupOptions);

        popup.onkeydown(function (e) {
            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.enter) {
                Util.getActiveElement().blur();
                onLoginButtonClick();
                Util.preventDefault(e);
            }
            else if(e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.esc){
                Util.getActiveElement().blur();
                onCancelButtonClick();
                Util.preventDefault(e);
            }
        }, true);

        $usernameInput.focus();
    };

    var createContent = function (message, username, password) {
        var usernameInputId = 'tcc-uni-1b73311b',
            passwordInputId = 'tcc-pi-a7c77c94';

        var $contentContainer = $('<div>'),
            $credentialsArea = $('<div>').appendTo($contentContainer),
            $messageArea = $('<div>').appendTo($credentialsArea),
            $usernameArea = $('<div>').appendTo($credentialsArea),
            $passwordArea = $('<div>').appendTo($credentialsArea),
            $usernameLabel = $('<label>').attr('for', usernameInputId).html(USERNAME_LABEL_TEXT).appendTo($usernameArea),
            $usernameInputDiv = $('<div>').appendTo($usernameArea),
            $passwordLabel = $('<label>').attr('for', passwordInputId).html(PASSWORD_LABEL_TEXT).appendTo($passwordArea),
            $passwordInputDiv = $('<div>').appendTo($passwordArea);

        $usernameInput = $('<input>').attr('id', usernameInputId).attr('value', username).appendTo($usernameInputDiv);
        $passwordInput = $('<input type="password">').attr('id', passwordInputId).attr('value', password).appendTo($passwordInputDiv);
        $inputSeparator = $('<div>').insertAfter($usernameArea);

        ShadowUI.addClass($contentContainer, AUTHENTICATION_DIALOG_CONTENT_CLASS);
        ShadowUI.addClass($credentialsArea, CREDENTIALS_AREA_CLASS);
        ShadowUI.addClass($messageArea, MESSAGE_AREA_CLASS);
        ShadowUI.addClass($usernameArea, LOGIN_AREA_CLASS);
        ShadowUI.addClass($inputSeparator, INPUT_SEPARATOR_CLASS);
        ShadowUI.addClass($usernameLabel, FIELD_CLASS);
        ShadowUI.addClass($passwordLabel, FIELD_CLASS);
        ShadowUI.addClass($usernameInputDiv, VALUE_CLASS);
        ShadowUI.addClass($passwordInputDiv, VALUE_CLASS);
        ShadowUI.addClass($usernameInput, INPUT_CLASS);
        ShadowUI.addClass($passwordInput, INPUT_CLASS);

        if ($.browser.webkit || $.browser.opera) {
            var correctLabelStyle = {
                position: 'relative',
                top: '1px'
            };

            $usernameLabel.css(correctLabelStyle);
            $passwordLabel.css(correctLabelStyle);
        }

        return $contentContainer;
    };

    var createButtons = function (cancelButtonText) {
        var $buttonArea = $('<div>');

        ButtonWidget.create($buttonArea, LOGIN_BUTTON_TEXT).click(onLoginButtonClick);

        ButtonWidget.create($buttonArea, cancelButtonText || CANCEL_BUTTON_TEXT)
            .click(onCancelButtonClick);

        ShadowUI.addClass($buttonArea, BUTTONS_CLASS);

        return $buttonArea;
    };


    //Behavior
    var onLoginButtonClick = function () {
        var username = $usernameInput.attr('value');

        if (!username) {
            var onUsernameChange = function () {
                ValidationMessageFactory.success($usernameInput);
                $usernameInput.unbind('change', onUsernameChange);
            };
            ValidationMessageFactory.error($usernameInput);
            $usernameInput.bind('change', onUsernameChange);
        }
        else {
            ValidationMessageFactory.success($usernameInput);
            eventEmitter.emit(LOG_IN_BUTTON_CLICK_EVENT, {
                username: username,
                password: $passwordInput.attr('value')
            });
        }

        ValidationMessageFactory.success($passwordInput);
        $inputSeparator.css('visibility', 'hidden');
    };

    var onCancelButtonClick = function(){
        eventEmitter.emit(CANCEL_BUTTON_CLICK_EVENT, {});
    };

    //API
    exports.init = function ($container, options) {
        eventEmitter = new Util.EventEmitter();
        createDialog($container, options);
    };

    exports.close = function (callback) {
        popup.close(callback);
    };

    exports.blind = function (blind) {
        popup.blind(blind);
    };

    exports.showErrorMessage = function (message) {
        $inputSeparator.css('visibility', 'visible');
        ValidationMessageFactory.error($usernameInput);
        ValidationMessageFactory.error($passwordInput, message, true);
    };

    exports.events = {
        on: function (event, handler) {
            eventEmitter.on(event, handler);
        }
    };
});

TestCafeClient.define('UI.RecorderWidgets.BackToInitialPage', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        ConfirmDialog = require('UI.RecorderWidgets.ConfirmDialog'),
        ButtonWidget = require('UI.RecorderWidgets.Button');

    //Const
    var BACK_TO_INITIAL_PAGE_CLASS = 'back-to-initial',
        BUTTONS_CLASS = 'buttons',

    //Popup text
        POPUP_MESSAGE_TEXT = ['The tested page state was changed by the test steps, which are now deleted. Please return to the initial test page.'];

    //Events
    exports.BACK_TO_INITIAL_PAGE_EVENT = 'backToInitialPageButtonClick';

    //Globals
    var dialog = null,
        eventEmitter = null,
        $backToInitialPageButton = null;

    //Markup
    var createButtons = function () {
        var $buttons = $('<div></div>');
        ShadowUI.addClass($buttons, BUTTONS_CLASS);

        $backToInitialPageButton = ButtonWidget.create($buttons, 'Go back to initial page');

        return $buttons;
    };

    var createDialog = function ($container) {
        dialog = new ConfirmDialog($container, {
            message: POPUP_MESSAGE_TEXT,
            footerContent: createButtons(),
            popupWidth: 540
        });

        ShadowUI.addClass(dialog.popup.$popup, BACK_TO_INITIAL_PAGE_CLASS);
        init();
    };

//Behavior
    var init = function () {
        ShadowUI.bind($backToInitialPageButton, 'click', function () {
            closeDialog(function () {
                eventEmitter.emit(exports.BACK_TO_INITIAL_PAGE_EVENT);
            });
        });

        dialog.bindEnterPressHandler(function(){
            $backToInitialPageButton.trigger('click');
        });
    };

    var closeDialog = function (callback) {
        dialog.popup.close(callback);
    };

    //API
    exports.init = function ($container) {
        eventEmitter = new Util.EventEmitter();
        createDialog($container);
    };

    exports.events = {
        on: function (ev, listener) {
            eventEmitter.on(ev, listener);
        }
    };
});
TestCafeClient.define('UI.RecorderWidgets.BaseStep', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        DialogPropertyWidget = require('UI.RecorderWidgets.DialogProperty'),

        STEP_CLASS = 'step',
        FIELD_CLASS = 'field',
        SEPARATOR_CLASS = 'separator';

    //Step
    var BaseStep = this.exports = function ($container, stepNum, stepInfo, options) {
        var step = this;

        this.options = options || {};

        this.$step = null;

        this.stepNamePropertyEditor = null;

        this.stepInfo = stepInfo;
        this.stepNum = stepNum;

        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            step.eventEmitter.on(ev, listener);
        };

        this._createBaseStep($container);

        this._initBaseStep();
    };

    //Events
    BaseStep.STEP_NAME_CHANGED_EVENT = 'stepNameChanged';
    BaseStep.STEP_INFO_CHANGED_EVENT = 'stepInfoChanged';

    //Markup
    BaseStep.prototype._createBaseStep = function ($container) {
        this.$step = $('<div></div>').appendTo($container);
        ShadowUI.addClass(this.$step, STEP_CLASS);

        this._createStepName(this.$step);
    };

    BaseStep.prototype._createLabel = function ($container, labelText, inputId) {
        var $label = $('<label></label>')
            .appendTo($container)
            .text(labelText);

        ShadowUI.addClass($label, FIELD_CLASS);
        if (inputId)
            $label.attr('for', inputId);

        return $label;
    };

    BaseStep.prototype._createStepName = function ($container) {
        this.stepNamePropertyEditor = new DialogPropertyWidget($container, 'Name:', this.stepInfo.name, {maximizeInput: true});

        var $separator = $('<div></div>').appendTo($container);
        ShadowUI.addClass($separator, SEPARATOR_CLASS);
    };

    //Behavior
    BaseStep.prototype._initBaseStep = function () {
        var step = this;

        this.stepNamePropertyEditor.on(DialogPropertyWidget.VALUE_CHANGED_EVENT, function (e) {
            if (step.stepNamePropertyEditor.isValid()) {
                step.stepInfo.name = e.value;
                step.eventEmitter.emit(BaseStep.STEP_NAME_CHANGED_EVENT, { name: step.stepInfo.name });
            }
        });
    };

    //API
    BaseStep.prototype.isValid = function () {
        return true;
    };

    BaseStep.prototype.getStepInfo = function () {
        return this.stepInfo;
    };

    BaseStep.prototype.destroy = function () {
    };
});
TestCafeClient.define('UI.RecorderWidgets.Button', function () {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI;

    //Const
    var BUTTON_CLASS = 'button',
        BUTTON_ICON_CLASS = 'button-icon';

    this.exports.create = function ($container, text, withImg) {
        var $button = $('<button></button>').appendTo($container);

        if (withImg) {
            ShadowUI.addClass($('<div></div>').appendTo($button), BUTTON_ICON_CLASS);
            var $span = $('<span></span>').html(text).appendTo($button);

            if (Util.isSafari) {
                $span.css({
                    position: 'relative',
                    top: '2px'
                });
            }
        }
        else {
            $button.html(text);

            //HACK: (B239762) It impossible to fix the bug with css because the font looks differently on windows and mac.
            if (Util.isSafari) {
                $button.css({
                    paddingTop: '2px',
                    paddingBottom: '0px'
                });
            }
        }

        ShadowUI.addClass($button, BUTTON_CLASS);

        return $button;
    };
});
TestCafeClient.define('UI.RecorderWidgets.Checkbox', function () {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI;

    //Const
    var CHECKBOX_CLASS = 'checkbox',
        CHECKBOX_ICON_CLASS = 'checkbox-icon',
        CHECKBOX_TITLE_CLASS = 'checkbox-title',
        PRESSED_CLASS = 'pressed';

    var Checkbox = this.exports = function ($container, state, title) {
        var checkbox = this;

        this.$checkbox = null;
        this.$checkboxTitle = null;
        this.$checkboxContainer = null;

        this.state = state || false;

        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            checkbox.eventEmitter.on(ev, listener);
        };

        this._create($container, title);
        this._init();
    };

    //Events
    Checkbox.STATE_CHANGED_EVENT = 'stateChanged';

    //Markup
    Checkbox.prototype._create = function ($container, title) {
        this.$checkboxContainer = $('<div></div>').appendTo($container);
        ShadowUI.addClass(this.$checkboxContainer, CHECKBOX_CLASS);

        this.$checkbox = $('<div></div>').appendTo(this.$checkboxContainer);
        ShadowUI.addClass(this.$checkbox, CHECKBOX_ICON_CLASS);

        if (this.state)
            ShadowUI.addClass(this.$checkbox, PRESSED_CLASS);

        if (title) {
            this.$checkboxTitle = $('<span></span>').html(title).appendTo(this.$checkboxContainer);
            ShadowUI.addClass(this.$checkboxTitle, CHECKBOX_TITLE_CLASS);

            if (Util.isIE && Util.browserVersion === 9)
                this.$checkboxTitle[0].setAttribute('unselectable', 'on');
        }

        this._init();
    };

//Behavior
    Checkbox.prototype._init = function () {
        var checkbox = this;

        var checkboxClickHandler = function (e) {
            checkbox.changeState();
            Util.preventDefault(e);
        };

        ShadowUI.bind(this.$checkboxContainer, 'click', checkboxClickHandler);
    };

    //API
    Checkbox.prototype.changeState = function () {
        if (this.state)
            ShadowUI.removeClass(this.$checkbox, PRESSED_CLASS);
        else
            ShadowUI.addClass(this.$checkbox, PRESSED_CLASS);

        this.state = !this.state;

        this.eventEmitter.emit(Checkbox.STATE_CHANGED_EVENT, { state: this.state });
    };

    Checkbox.prototype.getContainer = function () {
        return this.$checkbox;
    };
});
TestCafeClient.define('UI.RecorderWidgets.CodeEditor', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        NativeMethods = Hammerhead.NativeMethods,
        KeyEventParser = require('Recorder.KeyEventParser'),
        CodeFormatter = require('UI.RecorderWidgets.CodeFormatter');

    //Consts
    var EDITOR_CLASS = 'codeEditor',
        EDIT_LAYOUT_CLASS = 'editable',
        SCROLL_LAYOUT_CLASS = 'scrollable',
        LINE_CLASS = 'line',
        CURSOR_CLASS = 'editorCursor',
        TEXT_AREA_CLASS = 'editorTextarea',
        LETTER_WIDTH_FINDER = 'letter-width-finder',
        SELECTION_CLASS = 'selection',
        SELECTION_START_CLASS = 'start',
        SELECTION_END_CLASS = 'end',
        DISABLED_CLASS = 'disabled',

        EDITOR_WIDTH_DEFAULT = 400,
        EDITOR_HEIGHT_DEFAULT = 150,

        EDITOR_MAX_EXPANDED_SYMBOLS_COUNT = 80,

        EDITOR_PADDING_RIGHT = 4,
        EDITOR_PADDING_BOTTOM = 4,

        CURSOR_BLINKING_INTERVAL = 500,
        CURSOR_BLINKING_DELAY = 500,

        TAB_INDENT = '    ',

        STATE_STACK_SIZE = 100,

        OPENING_BRACKET_CHAR_CODES = [40, 91, 123],
        CLOSING_BRACKET_CHAR_CODES = [41, 93, 125];

    //Globals
    var CodeEditor = this.exports = function ($editorArea, options) {
        this.$editor = null;
        this.$scrollLayout = null;
        this.$editLayout = null;
        this.$cursor = null;
        this.$textarea = null;
        this.$lines = [];
        this.$selectionStart = null;
        this.$selectionCenter = null;
        this.$selectionEnd = null;

        this.editorWidth = 0;
        this.editorHeight = 0;
        this.fixedHeight = true;
        this.floatingWidth = false;
        this.expandDirection = null;
        this.holdFocus = false;
        this.inPaste = false;

        this.state = {
            lineIndex: 0,
            position: 0,
            selectionRegion: {
                startPosition: 0,
                startLine: 0,
                endPosition: 0,
                endLine: 0,
                inverse: false
            }
        };
        this.stateStack = [];
        this.stateIndex = 0;

        this.mouseLeftButtonPressed = false;
        this.mouseRightButtonPressed = false;
        this.allowEdit = true;
        this.expanded = false;
        this.buffer = [];
        this.changes = {
            modified: [],
            added: [],
            removed: []
        };

        this.lineHeight = null;
        this.letterWidth = null;

        this.codeFormatter = new CodeFormatter();

        this._init($editorArea, options);
    };

//Events
    CodeEditor.CHANGE_EVENT = 'change';
    CodeEditor.FOCUS_EVENT = 'focus';
    CodeEditor.BLUR_EVENT = 'blur';

//Markup
    CodeEditor.prototype._createEditor = function ($editorArea) {
        this.$editor = $editorArea;
        ShadowUI.addClass(this.$editor, EDITOR_CLASS);

        this.$scrollLayout = $('<div>').appendTo(this.$editor);
        ShadowUI.addClass(this.$scrollLayout, SCROLL_LAYOUT_CLASS);
        this.$editLayout = $('<div>').appendTo(this.$scrollLayout);
        ShadowUI.addClass(this.$editLayout, EDIT_LAYOUT_CLASS);
    };

    CodeEditor.prototype._createCursor = function () {
        this.$cursor = $('<div>').appendTo(this.$scrollLayout);
        ShadowUI.addClass(this.$cursor, CURSOR_CLASS);
        this.$cursor.css({
            height: this._getLineHeight(),
            opacity: 0
        });
    };

    CodeEditor.prototype._createTextArea = function () {
        this.$textarea = $('<textarea>').appendTo(this.$editor);
        //NOTE: letterWidth = 7
        this.$textarea.css('width', 3 * 7);
        //NOTE: for IE
        if (Util.isIE) {
            this.$textarea.css('background-color', 'red');
            this.$textarea.css('font-size', '0em');
        }
        ShadowUI.addClass(this.$textarea, TEXT_AREA_CLASS);
    };

    CodeEditor.prototype._createSelectionAreas = function () {
        this.$selectionStart = $('<div>').appendTo(this.$scrollLayout);
        ShadowUI.addClass(this.$selectionStart, SELECTION_CLASS);
        ShadowUI.addClass(this.$selectionStart, SELECTION_START_CLASS);
        this.$selectionStart.css('height', this._getLineHeight());

        this.$selectionCenter = $('<div>').appendTo(this.$scrollLayout);
        ShadowUI.addClass(this.$selectionCenter, SELECTION_CLASS);
        this.$selectionCenter.css('width', this.$scrollLayout[0].clientWidth);
        this.$selectionCenter.css('height', 0);

        this.$selectionEnd = $('<div>').appendTo(this.$scrollLayout);
        ShadowUI.addClass(this.$selectionEnd, SELECTION_CLASS);
        ShadowUI.addClass(this.$selectionEnd, SELECTION_END_CLASS);
        this.$selectionEnd.css('height', this._getLineHeight());
    };

    CodeEditor.prototype._createLines = function (startIndex, lineTexts) {
        if (!lineTexts.length)
            return [];
        var $lines = null,
            lineTemplate = '<div><span></span></div>';

        $.each(lineTexts, function (index, text) {
            var $line = $(lineTemplate);
            $line.children('span').text(text || '');
            ShadowUI.addClass($line, LINE_CLASS);
            if (!$lines)
                $lines = $line;
            else
                $lines = $lines.add($line);
        });

        var prevChild = this.$editLayout.children(':nth-child(' + startIndex + ')');

        if (startIndex === 0)
            $lines.prependTo(this.$editLayout);
        else if (prevChild.length)
            $lines.insertAfter(prevChild);
        else
            $lines.appendTo(this.$editLayout);

        return $lines;
    };

//highlight
    CodeEditor.prototype._highlight = function (modifiedLines) {
        if (this.codeFormatter)
            this.codeFormatter.highlight(this.$lines, modifiedLines, this.state.lineIndex);
    };

//Behavior

//initialization
    CodeEditor.prototype._init = function ($editorArea, options) {
        var codeEditor = this;
        options = options || {};

        options = {
            width: options.width || EDITOR_WIDTH_DEFAULT,
            height: options.height || EDITOR_HEIGHT_DEFAULT,
            fixedHeight: typeof options.fixedHeight === 'undefined' ? true : options.fixedHeight,
            text: options.text || '',
            allowEdit: typeof options.allowEdit === 'undefined' ? true : options.allowEdit,
            floatingWidth: options.floatingWidth || false,
            expandDirection: options.expandDirection || 'right'
        };

        codeEditor.eventEmitter = new Util.EventEmitter();
        codeEditor.events = {
            on: function (ev, listener) {
                codeEditor.eventEmitter.on(ev, listener);
            }
        };

        codeEditor._createEditor($editorArea);
        codeEditor._initEditor(options);

        if (options.text) {
            codeEditor._setEditorText(options.text);
        }
        else
            codeEditor._addLine(undefined, '');

        codeEditor._createCursor();
        codeEditor._createTextArea();
        codeEditor._initTextArea();
        codeEditor._createSelectionAreas();
        codeEditor._initSelectionAreas();
        codeEditor._setCursor(0, 0);
        if (Util.isIE)
            Util.setUnselectableAttributeRecursive(codeEditor.$scrollLayout[0]);
        codeEditor._clearChanges();

        codeEditor._textChanged();
    };

    CodeEditor.prototype._initEditor = function (options) {
        var codeEditor = this;

        if (typeof options.width === 'string' && options.width.indexOf('%') !== -1)
            codeEditor.editorWidth = Math.floor(codeEditor.$editor.parent().width() *
                options.width.substring(0, options.width.indexOf('%')) / 100);
        else
            codeEditor.editorWidth = options.width;

        if (typeof options.height === 'string' && options.height.indexOf('%') !== -1)
            codeEditor.editorHeight = Math.floor(codeEditor.$editor.parent().height() *
                options.height.substring(0, options.height.indexOf('%')) / 100);
        else
            codeEditor.editorHeight = options.height;
        codeEditor.fixedHeight = options.fixedHeight;
        codeEditor.allowEdit = options.allowEdit;
        codeEditor.floatingWidth = options.floatingWidth;
        codeEditor.expandDirection = options.expandDirection;

        if (!codeEditor.allowEdit)
            ShadowUI.addClass(this.$editor, DISABLED_CLASS);

        codeEditor.$scrollLayout.css('width', codeEditor.editorWidth);
        codeEditor.$editor.css('height', codeEditor.editorHeight);
        codeEditor.$scrollLayout.css('height', codeEditor.editorHeight);

        if (!codeEditor.fixedHeight)
            codeEditor.$scrollLayout.css('overflowY', 'visible');

        codeEditor.$scrollLayout.mousedown(function (e) {
            codeEditor._mousedown(e);
            return false;
        });

        codeEditor.$scrollLayout.dblclick(function (e) {
            codeEditor._dblclick(e);
            return false;
        });

        ShadowUI.bind($(document), 'mouseup', function () {
            codeEditor.stopSelectionProcess();
        });

        codeEditor.$scrollLayout.mouseup(function () {
            codeEditor.mouseRightButtonPressed = false;
            codeEditor.mouseLeftButtonPressed = false;
            if (!Util.isMozilla)
                return false;
        });

        ShadowUI.bind($(document), 'mousemove', function (e) {
            codeEditor._mousemove(e);
        });

        ShadowUI.bind(codeEditor.$scrollLayout, typeof document.onwheel !== 'undefined' ? 'wheel' : 'mousewheel', function (e) {
            var delta = -e.wheelDelta || (e.originalEvent ? (e.originalEvent.deltaY * 8) : e.deltaY * 100),
                $el = $(this),
                scrollTop = $el.scrollTop(),
                bordersWidth = Util.getBordersWidth($el),
                sizeDifference = this.scrollHeight - this.clientHeight,
                newTop = Math.min(Math.max(scrollTop + delta, 0), sizeDifference);

            if (this.scrollHeight !== this.clientHeight + bordersWidth.top + bordersWidth.bottom)
                $el.scrollTop(newTop);

            Util.preventDefault(e);
            return false;
        });
    };

    CodeEditor.prototype._expandEditor = function () {
        this.expanded = true;
        ShadowUI.addClass(this.$editor, 'expanded');

        if (this.$editLayout.width() <= this.$scrollLayout.width())
            return;

        this._updateEditorSize();
    };

    CodeEditor.prototype._collapseEditor = function () {
        this.expanded = false;
        ShadowUI.removeClass(this.$editor, 'expanded');
        if (this.expandDirection === 'left') {
            this.$scrollLayout.css('marginLeft', 0);
            this.$scrollLayout.css('position', 'relative');
        }
        this.$scrollLayout.width(this.editorWidth);
        this._updateEditorSize();
    };

    CodeEditor.prototype._initTextArea = function () {
        var codeEditor = this;

        codeEditor._initEventParser();

        ShadowUI.bind(codeEditor.$textarea, 'blur', function () {
            codeEditor._blur();
        });

        ShadowUI.bind(codeEditor.$textarea, 'focus', function () {
            codeEditor._focus();
        });

        ShadowUI.bind(codeEditor.$textarea, 'contextmenu', function () {
            window.setTimeout(function () {
                codeEditor.$textarea.css('z-index', 0);
                if (Util.isIE)
                    codeEditor.$textarea.css('font-size', '0em');
                if (!Util.isMozilla && !Util.isIE)
                    codeEditor.$textarea[0].value = '';
            }, 0);
        });

        ShadowUI.bind(codeEditor.$textarea, 'copy', function () {
            codeEditor._onCopyCodeEditorText();
        });

        ShadowUI.bind(codeEditor.$textarea, 'paste', function () {
            codeEditor._onPasteCodeEditor();
        });

        ShadowUI.bind(codeEditor.$textarea, 'cut', function () {
            codeEditor._onCutCodeEditor();
        });
    };

    CodeEditor.prototype._initEventParser = function () {
        var codeEditor = this;
        codeEditor.keyEventParser = new KeyEventParser();
        codeEditor.keyEventParser.init({
            symbolPressed: function (charCode) {
                codeEditor._letterPressed(charCode);
            },
            shortcutHandlers: {
                'left': function () {
                    codeEditor._shortcutHandlers().left();
                },
                'right': function () {
                    codeEditor._shortcutHandlers().right();
                },
                'up': function () {
                    codeEditor._shortcutHandlers().up();
                },
                'down': function () {
                    codeEditor._shortcutHandlers().down();
                },
                'enter': function () {
                    codeEditor._shortcutHandlers().enter();
                },
                'backspace': function () {
                    codeEditor._shortcutHandlers().backspace();
                },
                'delete': function () {
                    codeEditor._shortcutHandlers()['delete']();
                },
                'home': function () {
                    codeEditor._shortcutHandlers().home();
                },
                'end': function () {
                    codeEditor._shortcutHandlers().end();
                },
                'tab': function () {
                    codeEditor._shortcutHandlers().tab();
                },
                'shift+tab': function () {
                    codeEditor._shortcutHandlers().shiftTab();
                },
                'shift+left': function () {
                    codeEditor._shortcutHandlers().shiftLeft();
                },
                'shift+right': function () {
                    codeEditor._shortcutHandlers().shiftRight();
                },
                'shift+up': function () {
                    codeEditor._shortcutHandlers().shiftUp();
                },
                'shift+down': function () {
                    codeEditor._shortcutHandlers().shiftDown();
                },
                'shift+home': function () {
                    codeEditor._shortcutHandlers().shiftHome();
                },
                'shift+end': function () {
                    codeEditor._shortcutHandlers().shiftEnd();
                },
                'ctrl+left': function () {
                    codeEditor._shortcutHandlers().ctrlLeft();
                },
                'ctrl+right': function () {
                    codeEditor._shortcutHandlers().ctrlRight();
                },
                'ctrl+home': function () {
                    codeEditor._shortcutHandlers().ctrlHome();
                },
                'ctrl+end': function () {
                    codeEditor._shortcutHandlers().ctrlEnd();
                },
                'ctrl+backspace': function () {
                    codeEditor._shortcutHandlers().ctrlBackspace();
                },
                'ctrl+delete': function () {
                    codeEditor._shortcutHandlers().ctrlDelete();
                },
                'ctrl+shift+left': function () {
                    codeEditor._shortcutHandlers().ctrlShiftLeft();
                },
                'shift+ctrl+left': function () {
                    codeEditor._shortcutHandlers().ctrlShiftLeft();
                },
                'ctrl+shift+right': function () {
                    codeEditor._shortcutHandlers().ctrlShiftRight();
                },
                'shift+ctrl+right': function () {
                    codeEditor._shortcutHandlers().ctrlShiftRight();
                },
                'ctrl+shift+up': function () {
                    codeEditor._shortcutHandlers().ctrlShiftUp();
                },
                'shift+ctrl+up': function () {
                    codeEditor._shortcutHandlers().ctrlShiftUp();
                },
                'ctrl+shift+down': function () {
                    codeEditor._shortcutHandlers().ctrlShiftDown();
                },
                'shift+ctrl+down': function () {
                    codeEditor._shortcutHandlers().ctrlShiftDown();
                },
                'ctrl+x': function () {
                    codeEditor._shortcutHandlers().ctrlX();
                },
                'ctrl+c': function () {
                    codeEditor._shortcutHandlers().ctrlC();
                },
                'ctrl+v': function () {
                    codeEditor._shortcutHandlers().ctrlV();
                },
                'ctrl+a': function () {
                    codeEditor._shortcutHandlers().ctrlA();
                },
                'ctrl+z': function () {
                    codeEditor._shortcutHandlers().ctrlZ();
                },
                'ctrl+shift+z': function () {
                    codeEditor._shortcutHandlers().ctrlShiftZ();
                },
                'shift+ctrl+z': function () {
                    codeEditor._shortcutHandlers().ctrlShiftZ();
                }
            }
        });

        var listenedEvents = ['keydown', 'keypress', 'keyup'];

        $.each(listenedEvents, function () {
            codeEditor.$textarea[this](function (e) {
                //NOTE: allow ctrl+c, ctrl+a always
                if (codeEditor.allowEdit ||
                    (/key(down|up)/.test(e.type) && (e.keyCode === 17 || e.keyCode === 65 || e.keyCode === 67)))
                    codeEditor.keyEventParser.pushEvent(e);

                //NOTE: we need to prevent page scrolling in Chrome
                if (/key(down|up)/.test(e.type) && $.browser.webkit && (e.keyCode === 37 || e.keyCode === 39))
                    e.preventDefault();


                //NOTE: we're should raise textarea blur event to code editor lost focus
                if (e.type === 'keydown' && Util.KEYS_MAPS.REVERSED_SPECIAL_KEYS[e.keyCode] === 'esc')
                    NativeMethods.blur.call(codeEditor.$textarea[0]);

                e.stopPropagation();

                if ((e.type === 'keypress' && !((e.charCode === 3 || (Util.isMozilla && e.charCode === 118) ||
                    ((e.charCode === 22 || e.charCode === 24))) && e.ctrlKey)) ||
                    (e.type === 'keydown' && (e.keyCode === 9 || e.keyCode === 8 || e.keyCode === 16))) {
                    return false;
                }
            });
        });
    };

    CodeEditor.prototype._initSelectionAreas = function () {
        var codeEditor = this;
        this.$selectionStart.mousedown(function (e) {
            codeEditor._mousedown(e);
            return false;
        });
        this.$selectionCenter.mousedown(function (e) {
            codeEditor._mousedown(e);
            return false;
        });
        this.$selectionEnd.mousedown(function (e) {
            codeEditor._mousedown(e);
            return false;
        });
    };

    CodeEditor.prototype._updateScroll = function () {
        var cursor = this.$cursor[0],
            cursorOffset = Util.getOffsetPosition(cursor),
            cursorClientPosition = Util.offsetToClientCoords({x: cursorOffset.left, y: cursorOffset.top});
        if (cursorClientPosition.top < 0)
            cursor.scrollIntoView();
        else if ((cursorClientPosition.top + this._getLineHeight()) >= $(window).height())
            cursor.scrollIntoView(false);

        var cursorPosition = {
            left: parseInt(this.$cursor.css('left').replace('px', '')),
            top: parseInt(this.$cursor.css('top').replace('px', ''))
        };
        //need scroll horizontal
        if (cursorPosition.left < this.$scrollLayout.scrollLeft())
            this.$scrollLayout.scrollLeft(cursorPosition.left);
        else if (cursorPosition.left >= this.$scrollLayout.scrollLeft() + this.$scrollLayout[0].clientWidth - this._getVerticalScrollWidth())
            this.$scrollLayout.scrollLeft(cursorPosition.left - this.$scrollLayout[0].clientWidth + this._getVerticalScrollWidth() + EDITOR_PADDING_RIGHT);
        //need scroll vertical
        if (!this.fixedHeight)
            return;
        if (cursorPosition.top < this.$scrollLayout.scrollTop())
            this.$scrollLayout.scrollTop(cursorPosition.top);
        else if (cursorPosition.top + this._getLineHeight() >= this.$scrollLayout.scrollTop() + this.editorHeight - this._getHorizontalScrollHeight()) {
            this.$scrollLayout.scrollTop(cursorPosition.top + this._getLineHeight() - this.editorHeight + this._getHorizontalScrollHeight() + EDITOR_PADDING_BOTTOM);
        }
    };

//events
    CodeEditor.prototype._textChanged = function () {
        this._updateEditorSize();

        if (this.changes.added.length || this.changes.removed.length)
            this._highlight();
        else
            this._highlight($.map(this.changes.modified, function (item) {
                return item.index;
            }));
        this._saveState(false);
        this.eventEmitter.emit(CodeEditor.CHANGE_EVENT, {text: this.getText()});
    };

    CodeEditor.prototype._focus = function () {
        if (this.holdFocus)
            return;

        this._showSelection();

        if (this.floatingWidth)
            this._expandEditor();
        this._enableCursor();
        this.eventEmitter.emit(CodeEditor.FOCUS_EVENT);
    };

    CodeEditor.prototype._blur = function () {
        if (this.holdFocus)
            return;

        this._hideSelection();

        this._disableCursor();

        if (this.floatingWidth)
            this._collapseEditor();
        this.eventEmitter.emit(CodeEditor.BLUR_EVENT);
    };

//cursor
    CodeEditor.prototype._enableCursorBlinking = function () {
        var codeEditor = this;
        codeEditor.cursorInterval = window.setInterval(function () {
            codeEditor.$cursor.css('opacity', (codeEditor.$cursor.css('opacity') === '1' ? 0 : 1));
        }, CURSOR_BLINKING_INTERVAL);
    };

    CodeEditor.prototype._enableCursor = function () {
        if (!this.allowEdit || this.$cursor.data('enabled'))
            return;

        this._enableCursorBlinking();
        this.$cursor.data('enabled', true);
        this.$cursor.css('opacity', 1);
    };

    CodeEditor.prototype._disableCursor = function () {
        if (!this.allowEdit)
            return;
        var codeEditor = this;

        if (codeEditor.cursorInterval)
            window.clearInterval(codeEditor.cursorInterval);
        if (codeEditor.cursorTimeout)
            window.clearTimeout(codeEditor.cursorTimeout);

        codeEditor.cursorInterval = null;
        codeEditor.cursorTimeout = null;
        codeEditor.$cursor.css('opacity', 0);
        codeEditor.$cursor.data('enabled', false);
    };

    CodeEditor.prototype._suspendCursorBlinking = function () {
        if (!this.allowEdit || !this.$cursor.data('enabled'))
            return;

        var codeEditor = this;

        if (codeEditor.cursorInterval)
            window.clearInterval(codeEditor.cursorInterval);
        if (codeEditor.cursorTimeout)
            window.clearTimeout(codeEditor.cursorTimeout);

        codeEditor.$cursor.css('opacity', 1);

        codeEditor.cursorTimeout = window.setTimeout(function () {
            codeEditor._enableCursorBlinking();
        }, CURSOR_BLINKING_DELAY);
    };

    CodeEditor.prototype._setCursor = function (lineIndex, position, saveState, withSelection) {
        if (withSelection) {
            this._setSelection(lineIndex, position);
            lineIndex = this.state.selectionRegion.inverse ? this.state.selectionRegion.startLine : this.state.selectionRegion.endLine;
            position = this.state.selectionRegion.inverse ? this.state.selectionRegion.startPosition : this.state.selectionRegion.endPosition;
        }
        else
            this._clearSelection(lineIndex, position);

        this.state.lineIndex = lineIndex;
        this.state.position = position;
        this._setElementPosition(this.$cursor, lineIndex, position);
        this._updateScroll();

        this.$textarea.css({
            left: this.$cursor[0].offsetLeft - this.$scrollLayout[0].scrollLeft + this.$scrollLayout[0].offsetLeft - this.letterWidth,
            top: this.$cursor[0].offsetTop - this.$scrollLayout[0].scrollTop + this.$scrollLayout[0].offsetTop
        });

        this._suspendCursorBlinking();

        if (saveState)
            this._saveState(true);
    };

    CodeEditor.prototype._setTextarea = function (lineIndex, position) {
        var left = this._getElementPosition(lineIndex, position).left - this.$scrollLayout[0].scrollLeft + this.$scrollLayout[0].offsetLeft - this.letterWidth,
            top = this._getElementPosition(lineIndex, position).top - this.$scrollLayout[0].scrollTop + this.$scrollLayout[0].offsetTop;

        this.$textarea.css({
            left: left > this.$scrollLayout.width() + this.$scrollLayout[0].offsetLeft ?
                this.$scrollLayout.width() + this.$scrollLayout[0].offsetLeft : left,
            top: top > this.$scrollLayout.height() + this.$scrollLayout[0].offsetTop ?
                this.$scrollLayout.height() + this.$scrollLayout[0].offsetTop : top
        });
    };

//lines
    CodeEditor.prototype._addLine = function (index, text, withIndent) {
        text = withIndent ? TAB_INDENT + text : text;

        this._addLines(index, [text]);
    };

    CodeEditor.prototype._addLines = function (startIndex, linesArray) {
        var codeEditor = this,
            height = null,
            $lines = codeEditor._createLines(startIndex, linesArray),
            newIndex,
            newValue,
            remIndex;
        $.each($lines, function (index, item) {
            var $item = $(item);
            if (typeof startIndex !== 'undefined') {
                codeEditor.$lines.splice(startIndex, 0, $item);
                newIndex = startIndex;
                newValue = codeEditor._getLineText(newIndex);
                remIndex = codeEditor._getStateIndex(codeEditor.changes.removed, newIndex);
                startIndex++;
            }
            else {
                codeEditor.$lines.push($item);
                newIndex = codeEditor.$lines.length - 1;
                newValue = codeEditor._getLineText(newIndex);
                remIndex = codeEditor._getStateIndex(codeEditor.changes.removed, newIndex);
            }
            if (typeof remIndex === 'undefined')
                codeEditor.changes.added.push({
                    index: newIndex,
                    value: newValue
                });
            else {
                codeEditor.changes.modified.push({
                    index: newIndex,
                    oldValue: codeEditor.changes.removed[remIndex].value,
                    newValue: newValue
                });
                codeEditor.changes.removed.splice(remIndex, 1);
            }
            if (!height)
                height = codeEditor._getLineHeight();
            $item.css('height', height);
            if (Util.isIE)
                Util.setUnselectableAttributeRecursive(item);
        });
    };

    CodeEditor.prototype._removeLine = function (lineIndex) {
        var value = this._getLineText(lineIndex),
            addIndex = this._getStateIndex(this.changes.added, lineIndex),
            modIndex = this._getStateIndex(this.changes.modified, lineIndex);

        if (typeof addIndex !== 'undefined')
            this.changes.added.splice(addIndex, 1);
        else {
            if (typeof modIndex !== 'undefined')
                this.changes.modified.splice(modIndex, 1);
            this.changes.removed.push({
                index: lineIndex,
                value: value
            });
        }
        this.$lines[lineIndex].remove();
        this.$lines.splice(lineIndex, 1);
    };

    CodeEditor.prototype._setLineText = function (lineIndex, text) {
        var oldValue = this._getLineText(lineIndex),
            modIndex = this._getStateIndex(this.changes.modified, lineIndex),
            addIndex = this._getStateIndex(this.changes.added, lineIndex);

        if (this.$lines[lineIndex])
            this.$lines[lineIndex].children('span:first').text(text);

        if (typeof modIndex !== 'undefined')
            this.changes.modified[modIndex].newValue = text;
        else if (typeof addIndex !== 'undefined')
            this.changes.added[addIndex].value = text;
        else
            this.changes.modified.push({
                index: lineIndex,
                oldValue: oldValue,
                newValue: text
            });
    };

    CodeEditor.prototype._getLineText = function (lineIndex) {
        if (this.$lines[lineIndex])
            return this.$lines[lineIndex].text();
        return '';
    };

//selection
    CodeEditor.prototype._setSelection = function (line, position) {
        var startSelectionLineIndex = this.state.selectionRegion.inverse ?
                this.state.selectionRegion.endLine :
                this.state.selectionRegion.startLine,

            startSelectionPosition = this.state.selectionRegion.inverse ?
                this.state.selectionRegion.endPosition :
                this.state.selectionRegion.startPosition;

        if (line === startSelectionLineIndex && position === startSelectionPosition)
            this._clearSelection(line, position);

        else if (line < startSelectionLineIndex || (line === startSelectionLineIndex && position < startSelectionPosition)) {
            this.state.selectionRegion.endLine = startSelectionLineIndex;
            this.state.selectionRegion.endPosition = startSelectionPosition;
            this.state.selectionRegion.startLine = line;
            this.state.selectionRegion.startPosition = position;
            this.state.selectionRegion.inverse = true;
        }
        else {
            this.state.selectionRegion.startLine = startSelectionLineIndex;
            this.state.selectionRegion.startPosition = startSelectionPosition;
            this.state.selectionRegion.endLine = line;
            this.state.selectionRegion.endPosition = position;
            this.state.selectionRegion.inverse = false;
        }

        this._updateSelectionAreas();
    };

    CodeEditor.prototype._shiftSelection = function (lineOffset, positionOffset) {
        if (lineOffset) {
            this.state.selectionRegion.startLine += lineOffset;
            this.state.selectionRegion.endLine += lineOffset;
        }
        if (positionOffset) {
            this.state.selectionRegion.startPosition += positionOffset;
            this.state.selectionRegion.endPosition += positionOffset;
        }
        this._updateSelectionAreas();
    };

    CodeEditor.prototype._moveLines = function (offset) {
        var changingLineIndex = null;

        if (!this._hasSelection(this.state))
            changingLineIndex = this.state.lineIndex + offset;
        else if (this._hasSelection(this.state) && offset === -1)
            changingLineIndex = this.state.selectionRegion.startLine - 1;
        else if (this._hasSelection(this.state) && offset === 1)
            changingLineIndex = this.state.selectionRegion.endLine + 1;

        if (!this.$lines[changingLineIndex])
            return;

        var lineText = this._getLineText(changingLineIndex);

        if (!this._hasSelection(this.state) || this.state.selectionRegion.startLine === this.state.selectionRegion.endLine) {
            this._setLineText(this.state.lineIndex + offset, this._getLineText(this.state.lineIndex));
            this._setLineText(this.state.lineIndex, lineText);
        }
        else {
            if (offset === -1) {
                for (var i = this.state.selectionRegion.startLine - 1; i < this.state.selectionRegion.endLine; i++)
                    this._setLineText(i, this._getLineText(i + 1));

                this._setLineText(this.state.selectionRegion.endLine, lineText);
            }
            else {
                for (var j = this.state.selectionRegion.endLine + 1; j > this.state.selectionRegion.startLine; j--)
                    this._setLineText(j, this._getLineText(j - 1));

                this._setLineText(this.state.selectionRegion.startLine, lineText);
            }
        }
        this._shiftSelection(offset);
        this._setCursor(this.state.lineIndex + offset, this.state.position, false, true);
        this._textChanged();
    };

    CodeEditor.prototype._updateSelectionAreas = function () {
        var startLine = this.state.selectionRegion.startLine,
            endLine = this.state.selectionRegion.endLine,
            startPosition = this.state.selectionRegion.startPosition,
            endPosition = this.state.selectionRegion.endPosition;

        if (startLine === endLine) {
            this._clearSelectionArea(this.$selectionCenter);
            this._clearSelectionArea(this.$selectionEnd);

            var width = Math.abs(
                // Browser rounds *.5 position to the smallest integer.
                Math.floor(endPosition * this._getLetterWidth(startLine)) -
                    Math.floor(startPosition * this._getLetterWidth(startLine))
            );

            this._setElementPosition(this.$selectionStart, startLine, Math.min(endPosition, startPosition));
            this.$selectionStart.css('width', width);
        }
        else {
            var startWidth = Math.floor(this.$editLayout.width() - (startPosition * this._getLetterWidth(startLine))),
                endWidth = Math.floor(endPosition * this._getLetterWidth(endLine));

            if (Math.abs(endLine - startLine) === 1)
                this._clearSelectionArea(this.$selectionCenter);
            else {
                var selectionCenterHeight = (Math.abs(endLine - startLine) - 1) * this._getLineHeight();
                this._setElementPosition(this.$selectionCenter, startLine + 1, 0);
                this.$selectionCenter.css('height', selectionCenterHeight + 'px');
            }

            this._setElementPosition(this.$selectionStart, startLine, startPosition);
            this._setElementPosition(this.$selectionEnd, endLine, 0);
            this.$selectionStart.css('width', startWidth);
            this.$selectionEnd.css('width', endWidth);
        }
    };

    CodeEditor.prototype._removeSelectionContent = function () {
        var startLineText = this._getLineText(this.state.selectionRegion.startLine).substring(0, this.state.selectionRegion.startPosition),
            endLineText = this._getLineText(this.state.selectionRegion.endLine).substring(this.state.selectionRegion.endPosition, this._getLineLength(this.state.selectionRegion.endLine));

        this._setLineText(this.state.selectionRegion.startLine, startLineText + endLineText);

        for (var i = this.state.selectionRegion.endLine; i > this.state.selectionRegion.startLine; i--)
            this._removeLine(i);

        this._setCursor(this.state.selectionRegion.startLine, this.state.selectionRegion.startPosition);
    };

    CodeEditor.prototype._getSelectionTextAsArray = function () {
        var selectionText = [];
        if (this._hasSelection(this.state)) {
            selectionText
                .push(this._getLineText(this.state.selectionRegion.startLine)
                    .substring(this.state.selectionRegion.startPosition,
                        this.state.selectionRegion.startLine === this.state.selectionRegion.endLine ?
                            this.state.selectionRegion.endPosition :
                            this._getLineLength(this.state.selectionRegion.startLine)));

            for (var i = this.state.selectionRegion.startLine + 1; i < this.state.selectionRegion.endLine; i++)
                selectionText.push(this._getLineText(i));

            if (this.state.selectionRegion.startLine !== this.state.selectionRegion.endLine)
                selectionText.push(this._getLineText(this.state.selectionRegion.endLine).substring(0, this.state.selectionRegion.endPosition));
        }
        return selectionText;
    };

    CodeEditor.prototype._clearSelection = function (line, position) {
        this.state.selectionRegion = {
            startLine: line,
            startPosition: position,
            endLine: line,
            endPosition: position,
            inverse: false
        };

        this._clearSelectionArea(this.$selectionStart);
        this._clearSelectionArea(this.$selectionCenter);
        this._clearSelectionArea(this.$selectionEnd);
    };

    CodeEditor.prototype._clearSelectionArea = function ($area) {
        $area.css('left', 0);

        if ($area === this.$selectionCenter)
            $area.css('height', 0);
        else
            $area.css('width', 0);

        $area.css('top', 0);
    };

    CodeEditor.prototype._hideSelection = function () {
        this.$selectionStart.css('visibility', 'hidden');
        this.$selectionCenter.css('visibility', 'hidden');
        this.$selectionEnd.css('visibility', 'hidden');
    };

    CodeEditor.prototype._showSelection = function () {
        this.$selectionStart.css('visibility', '');
        this.$selectionCenter.css('visibility', '');
        this.$selectionEnd.css('visibility', '');
    };

//moving position
    CodeEditor.prototype._moveRight = function (saveState, withSelection) {
        var line = this.state.lineIndex,
            position = this.state.position;

        if (this._getLineLength(this.state.lineIndex) >= this.state.position + 1)
            position++;
        else if (this.$lines[this.state.lineIndex + 1]) {
            line++;
            position = 0;
        }
        else {
            if (this._hasSelection(this.state))
                this._setCursor(line, position, saveState, withSelection);
            return;
        }

        this._setCursor(line, position, saveState, withSelection);
    };

    CodeEditor.prototype._moveLeft = function (withSelection) {
        var line = this.state.lineIndex,
            position = this.state.position;

        if ((this.state.position - 1) === -1) {
            if ((this.state.lineIndex - 1) === -1) {
                if (this._hasSelection(this.state))
                    this._setCursor(line, position, true, withSelection);
                return;
            }
            line--;
            position = this._getLineLength(line);
        }
        else
            position--;

        this._setCursor(line, position, true, withSelection);
    };

    CodeEditor.prototype._moveUp = function (withSelection) {
        var line = this.state.lineIndex,
            position = this.state.position;

        if ((this.state.lineIndex - 1) === -1)
            if ((this.state.position - 1) === -1) {
                if (this._hasSelection(this.state))
                    this._setCursor(line, position, true, withSelection);
                return;
            }
            else
                position = 0;
        else if (this._getLineLength(this.state.lineIndex - 1) <= this.state.position) {
            line--;
            position = this._getLineLength(line);
        }
        else
            line--;

        this._setCursor(line, position, true, withSelection);
    };

    CodeEditor.prototype._moveDown = function (withSelection) {
        var line = this.state.lineIndex,
            position = this.state.position;

        if (this.$lines[this.state.lineIndex + 1])
            if (this._getLineLength(this.state.lineIndex + 1) <= this.state.position) {
                line++;
                position = this._getLineLength(line);
            }
            else
                line++;
        else if (this.state.position !== this._getLineLength(this.$lines.length - 1))
            position = this._getLineLength(this.$lines.length - 1);
        else {
            if (this._hasSelection(this.state))
                this._setCursor(line, position, true, withSelection);
            return;
        }
        this._setCursor(line, position, true, withSelection);
    };

//handlers
    CodeEditor.prototype._mousedown = function (e) {
        var codeEditor = this,

            x = e.pageX,
            y = e.pageY,

            scrollLeft = this.$scrollLayout[0].scrollLeft,
            scrollTop = this.$scrollLayout[0].scrollTop,

            isTextareaActive = document.activeElement === this.$textarea[0];

        x = x - this._getEditorOffset().left + scrollLeft;
        y = y - this._getEditorOffset().top + scrollTop;

        //return if click on scroll
        if (y > this.$scrollLayout[0].offsetHeight + scrollTop - this._getHorizontalScrollHeight() ||
            x > this.$scrollLayout[0].offsetWidth + scrollLeft - this._getVerticalScrollWidth()) {
            return;
        }

        var newCursorPosition = this._getCodeEditorRelativePosition(x, y),
            contained = this._selectionContains({lineIndex: newCursorPosition.lineIndex, position: newCursorPosition.position});

        var mousedownHandler = function () {
            //NOTE: we should restore scrollContainer scroll values after focus textarea
            //because its can be modified (B237719)
            if (!isTextareaActive) {
                codeEditor.$scrollLayout[0].scrollLeft = scrollLeft;
                codeEditor.$scrollLayout[0].scrollTop = scrollTop;
            }

            if (Util.BUTTON.LEFT === e.button)
                codeEditor.mouseLeftButtonPressed = true;
            else if (Util.BUTTON.RIGHT === e.button) {
                if (Util.isIE)
                    codeEditor.$textarea.css('font-size', '1em');
                codeEditor.$textarea.css('z-index', 10);
                codeEditor.mouseRightButtonPressed = true;
                if (codeEditor._hasSelection(codeEditor.state) && contained)
                    codeEditor._createSelectionObject();
            }

            if (!codeEditor.mouseRightButtonPressed)
                codeEditor._setCursor(newCursorPosition.cursorLineIndex, newCursorPosition.cursorPosition, true, e.shiftKey);
            else if (!codeEditor._hasSelection(codeEditor.state)) {
                codeEditor._setCursor(newCursorPosition.cursorLineIndex, newCursorPosition.cursorPosition, true, e.shiftKey);
                if (newCursorPosition.cursorLineIndex !== newCursorPosition.lineIndex ||
                    newCursorPosition.cursorPosition !== newCursorPosition.position)
                    codeEditor._setTextarea(newCursorPosition.lineIndex, newCursorPosition.position);
            }
            else {
                if (!contained) {
                    codeEditor._clearSelection(newCursorPosition.cursorLineIndex, newCursorPosition.cursorPosition);
                    codeEditor.$textarea[0].value = '';
                    codeEditor._setCursor(newCursorPosition.cursorLineIndex, newCursorPosition.cursorPosition, true, e.shiftKey);
                }
                codeEditor._setTextarea(newCursorPosition.lineIndex, newCursorPosition.position);
            }

            if (!isTextareaActive)
                NativeMethods.focus.call(codeEditor.$textarea[0]);

            Util.preventDefault(e);
        };

        //B237719 - TD6 - Unnecessary text selection and scroll codeEditor in IE
        if (!Util.isIE)
            mousedownHandler();
        else
            window.setTimeout(mousedownHandler, 0);
    };

    CodeEditor.prototype._dblclick = function (e) {
        var ev = e.originalEvent || e,

            x = ev.pageX || ev.clientX,
            y = ev.pageY || ev.clientY;

        x = x - this._getEditorOffset().left + this.$scrollLayout[0].scrollLeft;
        y = y - this._getEditorOffset().top + this.$scrollLayout[0].scrollTop;

        //return if click on scroll
        if (y > this.$scrollLayout[0].offsetHeight + this.$scrollLayout[0].scrollTop - this._getHorizontalScrollHeight() ||
            x > this.$scrollLayout[0].offsetWidth + this.$scrollLayout[0].scrollLeft - this._getVerticalScrollWidth()) {
            return;
        }

        var positionLeft = this._findCurrentWordPosition(this.state.lineIndex, this.state.position),
            positionRight = this._findCurrentWordEndPosition(this.state.lineIndex, this.state.position),
            checkPositionLeft = this._findCurrentWordPosition(this.state.lineIndex, positionRight),
            checkPositionRight = this._findCurrentWordEndPosition(this.state.lineIndex, positionLeft);

        if (this.state.position === checkPositionLeft)
            positionLeft = this.state.position;
        else if (this.state.position === checkPositionRight) {
            positionRight = this.state.position;
        }
        this._setCursor(this.state.lineIndex, positionLeft, false);
        this._setCursor(this.state.lineIndex, positionLeft, true, false);
        this._setCursor(this.state.lineIndex, positionRight, true, true);

        e.preventDefault();
    };

    CodeEditor.prototype._mousemove = function (e) {
        if (!this.mouseLeftButtonPressed && !this.mouseRightButtonPressed)
            return;

        var target = e.target,
            $target = $(target);

        var x = e.pageX,
            y = e.pageY,
            cursorLineIndex = 0,
            cursorPosition = 0,
            newPosition = null;

        if (this.$editor.has($target).length || $target.is(this.$editor)) {
            x = x - this._getEditorOffset().left + this.$scrollLayout[0].scrollLeft;
            y = y - this._getEditorOffset().top + this.$scrollLayout[0].scrollTop;

            newPosition = this._getCodeEditorRelativePosition(x, y);
            cursorLineIndex = newPosition.cursorLineIndex;
            cursorPosition = newPosition.cursorPosition;
        }
        else {
            if (y > this._getEditorOffset().top + this.$editor.height()) {
                cursorLineIndex = this.$lines.length - 1;
                cursorPosition = this._getLineLength(cursorLineIndex);
            }
            else if (y > this._getEditorOffset().top) {
                cursorLineIndex = Math.min(
                    Math.floor((y + this.$scrollLayout[0].scrollTop - this._getEditorOffset().top) / this._getLineHeight()),
                    this.$lines.length - 1
                );
                x = x - this._getEditorOffset().left + this.$scrollLayout[0].scrollLeft;
                cursorPosition = Math.min(this._getLineLength(cursorLineIndex), Math.round(x / this._getLetterWidth(cursorLineIndex)));
            }

            //B239062 - Speedy selection in addAction dialog's codeEditor doesn't work
            if (e.pageX < this._getEditorOffset().left)
                cursorPosition = 0;
        }

        if (cursorLineIndex === this.state.lineIndex && cursorPosition === this.state.position)
            return;

        if (this.mouseLeftButtonPressed)
            this._setCursor(cursorLineIndex, cursorPosition, true, true);
        else if (newPosition)
            this._setTextarea(newPosition.lineIndex, newPosition.position);
    };

    CodeEditor.prototype._letterPressed = function (charCode) {
        if (this._hasSelection(this.state))
            this._removeSelectionContent();

        var newText = String.fromCharCode(charCode),
            text = this._getLineText(this.state.lineIndex),
            nextSymbolCharCode = text.charCodeAt(this.state.position);

        if ($.inArray(charCode, OPENING_BRACKET_CHAR_CODES) !== -1 || charCode === 39 || charCode === 34) {
            //NOTE: if empty line, space, one of the closing bracket or ";"
            var needPastePairChar = (text.length === this.state.position ||
                nextSymbolCharCode === 32 || nextSymbolCharCode === 59 ||
                ($.inArray(nextSymbolCharCode, CLOSING_BRACKET_CHAR_CODES) !== -1));
            if (needPastePairChar) {
                switch (charCode) {
                    case 40:
                        newText += String.fromCharCode(41);
                        break;
                    case 91:
                        newText += String.fromCharCode(93);
                        break;
                    case 123:
                        newText += String.fromCharCode(125);
                        break;
                    case 39:
                        newText += String.fromCharCode(39);
                        break;
                    case 34:
                        newText += String.fromCharCode(34);
                        break;
                }
            }
        }
        if (charCode === nextSymbolCharCode &&
            (($.inArray(nextSymbolCharCode, CLOSING_BRACKET_CHAR_CODES) !== -1) ||
                nextSymbolCharCode === 39 || nextSymbolCharCode === 34)) {
            this._moveRight();
            return;
        }
        this._setLineText(this.state.lineIndex, text.substring(0, this.state.position) + newText + text.substring(this.state.position, text.length));
        this._moveRight();
        this._textChanged();
    };

    CodeEditor.prototype._shortcutHandlers = function () {
        var codeEditor = this;
        return {
            left: function () {
                if (codeEditor._hasSelection(codeEditor.state) && !codeEditor.state.selectionRegion.inverse) {
                    codeEditor._setCursor(codeEditor.state.selectionRegion.startLine, codeEditor.state.selectionRegion.startPosition, true);
                }
                else
                    codeEditor._moveLeft();
            },

            up: function () {
                codeEditor._moveUp();
            },

            right: function () {
                if (codeEditor._hasSelection(codeEditor.state) && codeEditor.state.selectionRegion.inverse) {
                    codeEditor._setCursor(codeEditor.state.selectionRegion.endLine, codeEditor.state.selectionRegion.endPosition, true);
                }
                else
                    codeEditor._moveRight(true);
            },

            down: function () {
                codeEditor._moveDown();
            },

            enter: function () {
                if (codeEditor._hasSelection(codeEditor.state))
                    codeEditor._removeSelectionContent();
                var text = codeEditor._getLineText(codeEditor.state.lineIndex),
                    nextLineText = text.substring(codeEditor.state.position, text.length),
                    curLineNewText = text.substring(0, codeEditor.state.position),

                //auto-indent
                    nonSpaceRegExp = /\S/g,
                    firstSymbol = nonSpaceRegExp.exec(curLineNewText),
                    indent = firstSymbol ? nonSpaceRegExp.lastIndex - 1 : curLineNewText.length,
                    indentString = [''];
                indentString.length += indent;
                indentString = indentString.join(' ');

                codeEditor._setLineText(codeEditor.state.lineIndex, curLineNewText);

                if (codeEditor._checkBracketPairCharCodes(text.charCodeAt(codeEditor.state.position - 1), nextLineText.charCodeAt(0))) {
                    indent += 4;
                    codeEditor._addLine(codeEditor.state.lineIndex + 1, TAB_INDENT + indentString);
                    codeEditor._addLine(codeEditor.state.lineIndex + 2, indentString + nextLineText);
                }
                else {
                    codeEditor._addLine(codeEditor.state.lineIndex + 1, indentString + nextLineText);
                }
                codeEditor._setCursor(codeEditor.state.lineIndex + 1, indent);
                codeEditor._textChanged();
            },

            backspace: function () {
                if (codeEditor._hasSelection(codeEditor.state))
                    codeEditor._removeSelectionContent();
                else {
                    var text = codeEditor._getLineText(codeEditor.state.lineIndex);
                    if (codeEditor.state.position === 0) {
                        if (!codeEditor.$lines[codeEditor.state.lineIndex - 1])
                            return;
                        var newPosition = codeEditor._getLineLength(codeEditor.state.lineIndex - 1);
                        codeEditor._setLineText(codeEditor.state.lineIndex - 1, codeEditor._getLineText(codeEditor.state.lineIndex - 1) + text);
                        codeEditor._removeLine(codeEditor.state.lineIndex);
                        codeEditor._setCursor(codeEditor.state.lineIndex - 1, newPosition);
                    }
                    else {
                        if (codeEditor._checkBracketPairCharCodes(text.charCodeAt(codeEditor.state.position - 1), text.charCodeAt(codeEditor.state.position)) ||
                            codeEditor._checkQuotesPairCharCodes(text.charCodeAt(codeEditor.state.position - 1), text.charCodeAt(codeEditor.state.position)))
                            codeEditor._setLineText(codeEditor.state.lineIndex,
                                text.substring(0, codeEditor.state.position - 1) + text.substring(codeEditor.state.position + 1, text.length));
                        else
                            codeEditor._setLineText(codeEditor.state.lineIndex,
                                text.substring(0, codeEditor.state.position - 1) + text.substring(codeEditor.state.position, text.length));
                        codeEditor._setCursor(codeEditor.state.lineIndex, codeEditor.state.position - 1);
                    }
                }
                codeEditor._textChanged();
            },

            'delete': function () {
                if (codeEditor._hasSelection(codeEditor.state))
                    codeEditor._removeSelectionContent();
                else {
                    var text = codeEditor._getLineText(codeEditor.state.lineIndex);
                    if (codeEditor.state.position === codeEditor._getLineLength(codeEditor.state.lineIndex)) {
                        if (!codeEditor.$lines[codeEditor.state.lineIndex + 1])
                            return;
                        codeEditor._setLineText(codeEditor.state.lineIndex, text + codeEditor._getLineText(codeEditor.state.lineIndex + 1));
                        codeEditor._removeLine(codeEditor.state.lineIndex + 1);
                    }
                    else {
                        codeEditor._setLineText(codeEditor.state.lineIndex,
                            text.substring(0, codeEditor.state.position) + text.substring(codeEditor.state.position + 1, text.length));
                    }
                }
                codeEditor._textChanged();
            },

            home: function () {
                var lineSpaceCount = codeEditor._getLineSpaceCount(codeEditor.state.lineIndex),
                    position = 0;
                if (codeEditor.state.position === 0 || codeEditor.state.position > lineSpaceCount)
                    position = lineSpaceCount;
                codeEditor._setCursor(codeEditor.state.lineIndex, position, true);
            },

            end: function () {
                if (codeEditor.state.position !== codeEditor._getLineLength(codeEditor.state.lineIndex))
                    codeEditor._setCursor(codeEditor.state.lineIndex, codeEditor._getLineLength(codeEditor.state.lineIndex), true);
            },

            tab: function () {
                var text = codeEditor._getLineText(codeEditor.state.lineIndex);
                if (!codeEditor._hasSelection(codeEditor.state)) {
                    var spacesCount = 4 - (codeEditor.state.position % 4),
                        indent = '';
                    for (var i = 0; i < spacesCount; i++)
                        indent += ' ';
                    codeEditor._setLineText(codeEditor.state.lineIndex, text.substring(0, codeEditor.state.position) + indent + text.substring(codeEditor.state.position, text.length));
                    codeEditor._setCursor(codeEditor.state.lineIndex, codeEditor.state.position + spacesCount, false);
                }
                else {
                    for (var j = codeEditor.state.selectionRegion.startLine; j <= codeEditor.state.selectionRegion.endLine; j++)
                        if (codeEditor._getLineLength(j) !== 0)
                            codeEditor._setLineText(j, TAB_INDENT + codeEditor._getLineText(j));
                    codeEditor._shiftSelection(0, TAB_INDENT.length);

                    codeEditor._setCursor(codeEditor.state.lineIndex, codeEditor.state.position + TAB_INDENT.length > text.length ?
                        text.length : codeEditor.state.position + TAB_INDENT.length, false, true);
                }
                codeEditor._textChanged();
            },

            shiftTab: function () {
                var tabSpaceCount = 4,
                    lineSpaceCount = codeEditor._getLineSpaceCount(codeEditor.state.lineIndex),
                    removingSpaceCount = lineSpaceCount >= tabSpaceCount ?
                        tabSpaceCount :
                        lineSpaceCount,
                    saveState = false;

                if (!codeEditor._hasSelection(codeEditor.state))
                    saveState = codeEditor._removeLineTabIndent(codeEditor.state.lineIndex);
                else {
                    for (var i = codeEditor.state.selectionRegion.startLine; i <= codeEditor.state.selectionRegion.endLine; i++)
                        if (codeEditor._removeLineTabIndent(i))
                            saveState = true;
                    codeEditor._shiftSelection(0, -removingSpaceCount);
                }

                codeEditor._setCursor(codeEditor.state.lineIndex,
                    codeEditor.state.position - removingSpaceCount > 0 ?
                        codeEditor.state.position - removingSpaceCount : 0, false, codeEditor._hasSelection(codeEditor.state));

                if (saveState)
                    codeEditor._textChanged();
            },

            shiftLeft: function () {
                codeEditor._moveLeft(true);
            },

            shiftRight: function () {
                codeEditor._moveRight(true, true);
            },

            shiftUp: function () {
                codeEditor._moveUp(true);
            },

            shiftDown: function () {
                codeEditor._moveDown(true);
            },

            shiftHome: function () {
                var lineSpaceCount = codeEditor._getLineSpaceCount(codeEditor.state.lineIndex),
                    position = 0;
                if (codeEditor.state.position === 0 || codeEditor.state.position > lineSpaceCount)
                    position = lineSpaceCount;
                codeEditor._setCursor(codeEditor.state.lineIndex, position, true, true);
            },

            shiftEnd: function () {
                codeEditor._setCursor(codeEditor.state.lineIndex, codeEditor._getLineLength(codeEditor.state.lineIndex), true, true);
            },

            ctrlLeft: function () {
                var newPosition = codeEditor._findWordBoundary('left');
                if (codeEditor.state.lineIndex !== newPosition.lineIndex || codeEditor.state.position !== newPosition.position)
                    codeEditor._setCursor(newPosition.lineIndex, newPosition.position, true);
            },

            ctrlRight: function () {
                var newPosition = codeEditor._findWordBoundary('right');
                if (codeEditor.state.lineIndex !== newPosition.lineIndex || codeEditor.state.position !== newPosition.position)
                    codeEditor._setCursor(newPosition.lineIndex, newPosition.position, true);
            },

            ctrlBackspace: function () {
                if (codeEditor._hasSelection(codeEditor.state))
                    codeEditor._removeSelectionContent();
                else {
                    var lineIndex = codeEditor.state.lineIndex,
                        position = codeEditor.state.position;

                    if (lineIndex === 0 && position === 0)
                        return;

                    var nextPosition = codeEditor._findWordBoundary('left'),
                        lineText = codeEditor._getLineText(lineIndex);

                    codeEditor._setCursor(nextPosition.lineIndex, nextPosition.position);

                    if (nextPosition.lineIndex === lineIndex) {
                        codeEditor._setLineText(lineIndex, lineText.substring(0, nextPosition.position) + lineText.substring(position, codeEditor._getLineLength(lineIndex)));
                    }
                    else {
                        codeEditor._setLineText(nextPosition.lineIndex, codeEditor._getLineText(nextPosition.lineIndex) + lineText.substring(position, codeEditor._getLineLength(lineIndex)));
                        codeEditor._removeLine(lineIndex);
                    }
                }
                codeEditor._textChanged();
            },

            ctrlDelete: function () {
                if (codeEditor._hasSelection(codeEditor.state))
                    codeEditor._removeSelectionContent();
                else {
                    var lineIndex = codeEditor.state.lineIndex,
                        position = codeEditor.state.position,
                        lineText = codeEditor._getLineText(lineIndex);

                    if (lineIndex === codeEditor.$lines.length - 1 && position === lineText.length)
                        return;

                    var nextPosition = codeEditor._findWordBoundary('right');

                    if (nextPosition.lineIndex === lineIndex)
                        codeEditor._setLineText(lineIndex, lineText.substring(0, position) +
                            lineText.substring(nextPosition.position, codeEditor._getLineLength(lineIndex)));
                    else {
                        codeEditor._setLineText(lineIndex, codeEditor._getLineText(lineIndex) +
                            codeEditor._getLineText(nextPosition.lineIndex).substring(nextPosition.position, codeEditor._getLineLength(nextPosition.lineIndex)));
                        codeEditor._removeLine(nextPosition.lineIndex);
                    }
                }
                codeEditor._textChanged();
            },

            ctrlHome: function () {
                if (codeEditor.state.lineIndex !== 0 || codeEditor.state.position !== 0)
                    codeEditor._setCursor(0, 0, true);
            },

            ctrlEnd: function () {
                if (codeEditor.state.lineIndex !== codeEditor.$lines.length - 1 || codeEditor.state.position !== codeEditor._getLineLength(codeEditor.$lines.length - 1))
                    codeEditor._setCursor(codeEditor.$lines.length - 1, codeEditor._getLineLength(codeEditor.$lines.length - 1), true);
            },

            ctrlShiftLeft: function () {
                var newPosition = codeEditor._findWordBoundary('left');
                if (codeEditor.state.lineIndex !== newPosition.lineIndex || codeEditor.state.position !== newPosition.position)
                    codeEditor._setCursor(newPosition.lineIndex, newPosition.position, true, true);
            },

            ctrlShiftRight: function () {
                var newPosition = codeEditor._findWordBoundary('right');
                if (codeEditor.state.lineIndex !== newPosition.lineIndex || codeEditor.state.position !== newPosition.position)
                    codeEditor._setCursor(newPosition.lineIndex, newPosition.position, true, true);
            },

            ctrlShiftUp: function () {
                codeEditor._moveLines(-1);
            },

            ctrlShiftDown: function () {
                codeEditor._moveLines(1);
            },

            ctrlX: function () {
                codeEditor._onCutCodeEditor();
            },

            ctrlC: function () {
                if (codeEditor._hasSelection(codeEditor.state)) {
                    codeEditor.buffer = codeEditor._getSelectionTextAsArray();
                    codeEditor._onCopyCodeEditorText();
                }
            },

            ctrlV: function () {
                codeEditor._onPasteCodeEditor();
            },

            ctrlA: function () {
                var lastLine = codeEditor.$lines.length - 1,
                    lastPosition = codeEditor._getLineLength(lastLine);
                codeEditor._setCursor(0, 0);
                codeEditor._setCursor(lastLine, lastPosition, true, true);
            },

            ctrlZ: function () {
                if (codeEditor.stateStack[codeEditor.stateIndex - 1]) {
                    codeEditor._undoState(codeEditor.stateIndex);
                    codeEditor.stateIndex = codeEditor.stateIndex - 1;
                }
            },
            ctrlShiftZ: function () {
                if (codeEditor.stateStack[codeEditor.stateIndex + 1]) {
                    codeEditor._redoState(codeEditor.stateIndex);
                    codeEditor.stateIndex = codeEditor.stateIndex + 1;
                }
            }
        };
    };

    CodeEditor.prototype._createSelectionObject = function () {
        var codeEditor = this,
            selection = null;
        if (window.getSelection) {
            selection = window.getSelection();
            selection.removeAllRanges();
        }
        else {
            selection = document.selection;
            selection.clear();
        }

        codeEditor.$textarea[0].value = Util.isMozilla ? codeEditor._getSelectionTextAsArray().join('\n') : '12';

        codeEditor.$textarea[0].select();
    };

    CodeEditor.prototype._onCopyCodeEditorText = function (lineIndex) {
        var codeEditor = this;
        var selection;
        if (window.getSelection) {
            selection = window.getSelection();
            selection.removeAllRanges();
        }
        else {
            selection = document.selection;
            selection.clear();
        }
        codeEditor.holdFocus = true;
        var $newTextarea = codeEditor._createTextareaForCopyCodeEditorText(lineIndex);
        try {
            $newTextarea[0].select();
        }
        catch (e) {
            $newTextarea[0].select();
        }
        window.setTimeout(function () {
            $newTextarea.remove();
            //NOTE: we should set holdFocus flag to true only after codeEditor textarea focused
            // otherwise codeEditor may lost focus (especially in IE)
            NativeMethods.focus.call(codeEditor.$textarea[0]);
            window.setTimeout(function () {
                codeEditor.holdFocus = false;
            }, 0);
        }, 0);
    };

    CodeEditor.prototype._onPasteCodeEditor = function () {
        var codeEditor = this;
        if (codeEditor.inPaste)
            return;
        codeEditor.inPaste = true;
        window.setTimeout(function () {
            var textareaValue = codeEditor.$textarea[0].value;
            if (textareaValue) {
                codeEditor.buffer = [];
                var pasteText = textareaValue.replace(/\r\n/g, '\n'),
                    pasteLines = pasteText.split('\n');
                $.each(pasteLines, function (index, line) {
                    codeEditor.buffer.push(line);
                });
                codeEditor.$textarea[0].value = '';
            }
            codeEditor._insertText(codeEditor.buffer);
            codeEditor.inPaste = false;
        }, 0);
    };

    CodeEditor.prototype._insertText = function (lines) {
        if (lines.length) {
            var text = this._getLineText(this.state.lineIndex);
            if (this._hasSelection(this.state)) {
                this._removeSelectionContent();
                text = this._getLineText(this.state.lineIndex);
            }
            if (lines.length === 1) {
                this._setLineText(this.state.lineIndex, text.substring(0, this.state.position) + lines[0] + text.substring(this.state.position, text.length));
                this._setCursor(this.state.lineIndex, this.state.position + lines[0].length);
            }
            else {
                this._setLineText(this.state.lineIndex, text.substring(0, this.state.position) + lines[0]);
                var endText = text.substring(this.state.position);

                this._addLines(this.state.lineIndex + 1, lines.slice(1, lines.length - 1));
                this.state.lineIndex += lines.length - 1;
                this._addLine(this.state.lineIndex, lines[lines.length - 1] + endText);
                this._setCursor(this.state.lineIndex, lines[lines.length - 1].length);
            }
            this._textChanged();
        }
    };

    CodeEditor.prototype._onCutCodeEditor = function () {
        var codeEditor = this;
        if (codeEditor._hasSelection(codeEditor.state)) {
            codeEditor.buffer = codeEditor._getSelectionTextAsArray();
            codeEditor._onCopyCodeEditorText();
            codeEditor._removeSelectionContent();
        }
        else {
            codeEditor.buffer[0] = codeEditor._getLineText(codeEditor.state.lineIndex);
            codeEditor.buffer[1] = '';
            codeEditor._onCopyCodeEditorText(codeEditor.state.lineIndex);
            if (codeEditor.state.lineIndex !== codeEditor.$lines.length - 1) {
                codeEditor._removeLine(codeEditor.state.lineIndex);

                var curPosition = codeEditor._getLineLength(codeEditor.state.lineIndex) > codeEditor.state.position ?
                    codeEditor.state.position :
                    codeEditor._getLineLength(codeEditor.state.lineIndex);

                codeEditor._setCursor(codeEditor.state.lineIndex, curPosition, false);
            }
            else if (codeEditor._getLineText(codeEditor.state.lineIndex).length !== 0) {
                codeEditor._setLineText(codeEditor.state.lineIndex, '');
                codeEditor._setCursor(codeEditor.state.lineIndex, 0);
            }
            else
                return;
        }
        codeEditor._textChanged();
    };

//utils
    CodeEditor.prototype._getLetterWidth = function (lineIndex) {     //TODO: without lineIndex (or cache value)
        var $span = this.$lines[lineIndex].children('span'),
            textLength = $span.text().length,
            currentWidth = textLength ? ($span.width() / textLength) : 0;

        if (!this.letterWidth)
            this.letterWidth = this._calculateLetterWidth();

        return currentWidth || this.letterWidth;
    };

    CodeEditor.prototype._calculateLineHeight = function () {
        var $line = this.$lines[0],
            $testSpan = $('<span>')
                .text('a')
                .css('fontFamily', $line.css('fontFamily'))
                .css('fontSize', $line.css('fontSize'))
                .css('position', 'absolute')
                .appendTo(ShadowUI.getRoot()),
            height = $testSpan.height();
        $testSpan.remove();
        return height;
    };

    CodeEditor.prototype._calculateLetterWidth = function () {
        var $testSpan = $('<span></span>')
            .text('1234567890')
            .css('position', 'absolute')
            .appendTo(this.$editor);

        ShadowUI.addClass($testSpan, LETTER_WIDTH_FINDER);

        var width = $testSpan.width() / $testSpan.text().length;

        $testSpan.remove();
        return width;
    };

    CodeEditor.prototype._getLineHeight = function () {
        var codeEditor = this;
        if (!codeEditor.lineHeight) {
            codeEditor.lineHeight = codeEditor._calculateLineHeight();
        }
        return codeEditor.lineHeight;
    };

    CodeEditor.prototype._removeLineTabIndent = function (lineIndex) {
        var lineText = this._getLineText(lineIndex),
            tabSpaceCount = 4,
            lineSpaceCount = this._getLineSpaceCount(lineIndex),
            removingSpaceCount = lineSpaceCount >= tabSpaceCount ?
                tabSpaceCount :
                lineSpaceCount;
        if (!removingSpaceCount)
            return false;
        this._setLineText(lineIndex, lineText.substring(removingSpaceCount, lineText.length));
        return true;
    };

    CodeEditor.prototype._getLineSpaceCount = function (lineIndex) {
        var lineText = this._getLineText(lineIndex),
            lineLength = lineText.length,
            lineSpaceCount = 0;
        for (var i = 0; i < lineLength; i++)
            if (/\s/.test(lineText[i]))
                lineSpaceCount++;
            else break;
        return lineSpaceCount;
    };

    CodeEditor.prototype._getCodeEditorRelativePosition = function (x, y) {
        var codeEditor = this,
            position = {
                lineIndex: 0,
                position: 0,
                cursorLineIndex: 0,
                cursorPosition: 0
            };

        position.lineIndex = Math.floor(y / codeEditor._getLineHeight());

        position.cursorLineIndex = position.lineIndex >= codeEditor.$lines.length ?
            codeEditor.$lines.length - 1 :
            position.lineIndex;

        var letterWidth = position.lineIndex >= codeEditor.$lines.length ?
            this.letterWidth : codeEditor._getLetterWidth(position.lineIndex);
        position.position = Math.round(x / letterWidth);

        position.cursorPosition = position.position > codeEditor._getLineLength(position.cursorLineIndex) ?
            codeEditor._getLineLength(position.cursorLineIndex) :
            position.position;
        return position;
    };

    CodeEditor.prototype._findWordBoundary = function (direction) {
        var offset = (direction === 'left') ? -1 : 1;
        var nextPosition = {
            lineIndex: this.state.lineIndex,
            position: this.state.position
        };

        if ((offset === -1 && nextPosition.position === 0) ||
            (offset === 1 && nextPosition.position === this._getLineLength(nextPosition.lineIndex))) {
            if (this.$lines[nextPosition.lineIndex + offset]) {
                nextPosition.lineIndex = nextPosition.lineIndex + offset;
                nextPosition.position = (offset === -1) ? this._getLineLength(nextPosition.lineIndex) : 0;
            }
        }
        else
            nextPosition.position = (offset === -1) ? this._findCurrentWordPosition(nextPosition.lineIndex, nextPosition.position) : this._findNextWordPosition(nextPosition.lineIndex, nextPosition.position);

        return nextPosition;
    };

    CodeEditor.prototype._findCurrentWordPosition = function (lineIndex, position) {
        var nextPosRegExp = /(\b\S)|$|(\s[\W]+)/g,
            lineText = this._getLineText(lineIndex),
            text = lineText.substring(0, position),
            lastRes = '',
            lastIndex = '',
            res = '';

        do {
            lastRes = res;
            lastIndex = nextPosRegExp.lastIndex;
            res = nextPosRegExp.exec(text)[0];
            if (!/^\s+$/.test(res))
                res = res.replace(/^\s+/, '');
        }
        while (res);
        return lastIndex - lastRes.length;
    };

    CodeEditor.prototype._findCurrentWordEndPosition = function (lineIndex, position) {
        var nextPosRegExp = /(\S\b)|$|(\s[\W]+)/g,
            lineText = this._getLineText(lineIndex),
            text = lineText.substring(position, lineText.length);

        nextPosRegExp.exec(text)[0].replace(/^\s+/, '');

        position = position + (nextPosRegExp.lastIndex);

        return position > this._getLineLength(lineIndex) ?
            this._getLineLength(lineIndex) :
            position;
    };

    CodeEditor.prototype._findNextWordPosition = function (lineIndex, position) {
        var nextPosRegExp = /(\b\S)|$|(\s[\W]+)/g,
            lineText = this._getLineText(lineIndex),
            text = lineText.substring(position, lineText.length),
            res = nextPosRegExp.exec(text)[0].replace(/^\s+/, '');

        if (nextPosRegExp.lastIndex < 2)
            res = nextPosRegExp.exec(text)[0].replace(/^\s+/, '');

        position = position + (nextPosRegExp.lastIndex - res.length);

        return position > this._getLineLength(lineIndex) ?
            this._getLineLength(lineIndex) :
            position;
    };

    CodeEditor.prototype._findLongerLineIndex = function () {
        var codeEditor = this;
        if (codeEditor.$lines.length) {
            var index = 0,
                temp = codeEditor._getLineLength(0);
            $.each(codeEditor.$lines, function (i) {
                if (codeEditor._getLineLength(i) > temp) {
                    index = i;
                    temp = codeEditor._getLineLength(i);
                }
            });
            return index;
        }
        return 0;
    };

    CodeEditor.prototype._getEditorOffset = function () {
        return Util.getOffsetPosition(this.$scrollLayout[0]);
    };

    CodeEditor.prototype._updateEditorSize = function () {
        var longestLine = this._findLongerLineIndex(),
            scrollLayoutBorders = parseInt(this.$scrollLayout.css('borderLeftWidth')) + parseInt(this.$scrollLayout.css('borderRightWidth')),
            editLayoutWidth = Math.max(this.editorWidth - scrollLayoutBorders,
                this._getLineLength(longestLine) * this._getLetterWidth(longestLine) + this.$cursor.width());
        if (this.expanded) {
            var fullWidth = Math.min(editLayoutWidth, this._getLetterWidth(longestLine) * EDITOR_MAX_EXPANDED_SYMBOLS_COUNT + this.$cursor.width()) + scrollLayoutBorders;
            this.$editLayout.css('width', editLayoutWidth);
            if (this.expandDirection === 'left') {
                this.$scrollLayout.css('marginLeft', this.editorWidth - fullWidth);
                this.$scrollLayout.css('position', 'absolute');
            }
            this.$scrollLayout.width(fullWidth);
            this.$scrollLayout.css('overflow-x', fullWidth < editLayoutWidth + scrollLayoutBorders ? 'scroll' : 'hidden');

        }
        else {
            var scrollLayoutWidth = this.$scrollLayout[0].clientWidth || this.$scrollLayout.width();
            if (editLayoutWidth > scrollLayoutWidth) {
                this.$editLayout.css('width', editLayoutWidth);
                this.$scrollLayout.css('overflow-x', this.floatingWidth ? 'hidden' : 'scroll');
            }
            else {
                this.$editLayout.css('width', scrollLayoutWidth);
                this.$scrollLayout.css('overflow-x', 'hidden');
            }
        }

        var linesHeight = this.$lines.length * this._getLineHeight(),
            scrollHeight = this._getHorizontalScrollHeight();
        if (this.fixedHeight) {
            if (linesHeight + scrollHeight > this.editorHeight) {
                this.$editLayout.css('height', linesHeight);
                this.$scrollLayout.css('overflowY', 'scroll');
            }
            else {
                this.$editLayout.css('height', this.editorHeight - scrollHeight);
                this.$scrollLayout.css('overflowY', 'hidden');
            }
        }
        else {
            var height = Math.max(this.editorHeight, linesHeight + scrollHeight) + EDITOR_PADDING_BOTTOM;
            this.$editLayout.css('height', '');
            this.$editor.css('height', height);
            this.$scrollLayout.css('height', height);
            this.$editLayout.css('height', this.$scrollLayout.height() - scrollHeight - EDITOR_PADDING_BOTTOM);
        }

        this.$selectionCenter.css('width', this.$editLayout.width() + 'px');
    };

    CodeEditor.prototype._getLineLength = function (lineIndex) {
        return this.$lines[lineIndex] ? this._getLineText(lineIndex).length : 0;
    };

    CodeEditor.prototype._getElementPosition = function (lineIndex, position) {
        var letterWidth = lineIndex >= this.$lines.length ? this.letterWidth : this._getLetterWidth(lineIndex);

        return {
            left: position * letterWidth,
            top: lineIndex * this._getLineHeight()
        };
    };

    CodeEditor.prototype._setElementPosition = function ($element, lineIndex, position) {
        var newPosition = this._getElementPosition(lineIndex, position);

        $element.css('left', Math.floor(newPosition.left));

        if (this.$lines[lineIndex])
            $element.css('top', newPosition.top);
    };

    CodeEditor.prototype._getVerticalScrollWidth = function () {
        var bordersWidth = parseInt(this.$scrollLayout.css('borderLeftWidth').replace('px', '')) +
            parseInt(this.$scrollLayout.css('borderRightWidth').replace('px', ''));
        return this.$scrollLayout[0].offsetWidth - this.$scrollLayout[0].clientWidth - bordersWidth;
    };

    CodeEditor.prototype._getHorizontalScrollHeight = function () {
        var bordersWidth = parseInt(this.$scrollLayout.css('borderTopWidth').replace('px', '')) +
            parseInt(this.$scrollLayout.css('borderBottomWidth').replace('px', ''));
        return this.$scrollLayout[0].offsetHeight - this.$scrollLayout[0].clientHeight - bordersWidth;
    };

    CodeEditor.prototype._hasSelection = function (state) {
        return !(state.selectionRegion.startLine === state.selectionRegion.endLine &&
            state.selectionRegion.startPosition === state.selectionRegion.endPosition);
    };

    CodeEditor.prototype._selectionContains = function (position) {
        return ((position.lineIndex > this.state.selectionRegion.startLine ||
            (position.lineIndex === this.state.selectionRegion.startLine && position.position >= this.state.selectionRegion.startPosition)) &&
            (position.lineIndex < this.state.selectionRegion.endLine ||
                (position.lineIndex === this.state.selectionRegion.endLine && position.position <= this.state.selectionRegion.endPosition)));
    };

    CodeEditor.prototype._createTextareaForCopyCodeEditorText = function (lineIndex) {
        var codeEditor = this,
            newTextarea = document.createElement('textarea'),
            $newTextarea = $(newTextarea);

        $newTextarea.appendTo(ShadowUI.getRoot());

        $newTextarea.css({
            overflow: 'hidden',
            width: '1px',
            height: '1px',
            position: 'absolute',
            top: '-999px',
            left: '-999px'
        });

        var selectionText = typeof lineIndex !== 'undefined' ?
            codeEditor._getLineText(lineIndex) + '\r\n' :
            this._getSelectionTextAsArray().join('\n');
        $newTextarea.text(selectionText);
        return $newTextarea;
    };

    CodeEditor.prototype._checkBracketPairCharCodes = function (charCodeStart, charCodeEnd) {
        return ((charCodeStart === 40 && charCodeEnd === 41) ||
            (charCodeStart === 91 && charCodeEnd === 93) ||
            (charCodeStart === 123 && charCodeEnd === 125));
    };

    CodeEditor.prototype._checkQuotesPairCharCodes = function (charCodeStart, charCodeEnd) {
        return ((charCodeStart === 39 && charCodeEnd === 39) ||
            (charCodeStart === 34 && charCodeEnd === 34));
    };

    CodeEditor.prototype._getEditorText = function () {
        var codeEditor = this,

            lines = $.map(codeEditor.$lines, function (item, index) {
                return codeEditor._getLineText(index);
            });
        return lines.join('\r\n').replace(/\xA0/g, ' ');
    };

    CodeEditor.prototype._setEditorText = function (value) {
        if (this.$lines.length) {
            this._clearSelection(0, 0);
            while (this.$lines.length)
                this._removeLine(0);
        }
        var text = value.replace(/\r\n/g, '\n');
        this._addLines(undefined, text.split('\n'));
    };

// Undo/Redo
    CodeEditor.prototype._saveState = function (isCursor) {
        this.changes.removed.sort(function (i, j) {
            return (i.index - j.index);
        });
        this.changes.added.sort(function (i, j) {
            return (i.index - j.index);
        });
        var lastState = this.stateStack[this.stateIndex],
            newState = {
                lineIndex: this.state.lineIndex,
                position: this.state.position,

                selectionRegion: {
                    startPosition: this.state.selectionRegion.startPosition,
                    startLine: this.state.selectionRegion.startLine,
                    endPosition: this.state.selectionRegion.endPosition,
                    endLine: this.state.selectionRegion.endLine,
                    inverse: this.state.selectionRegion.inverse
                },
                isCursor: isCursor,
                changes: this.changes
            };

        this._clearChanges();

        if (isCursor && !(newState.changes.added.length || newState.changes.modified.length || newState.changes.removed.length) &&
            newState.lineIndex === lastState.lineIndex && newState.position === lastState.position)
            return;

        if (lastState && this.stateIndex !== this.stateStack.length - 1) {
            if (!isCursor)
                while (this.stateIndex < this.stateStack.length - 1) {
                    this.stateStack.pop();
                }
            else
                return;
        }

        if (isCursor && lastState && lastState.isCursor)
            this.stateStack.pop();

        if (this.stateStack.length === STATE_STACK_SIZE)
            this.stateStack.shift();

        this.stateStack.push(newState);
        this.stateIndex = this.stateStack.length - 1;
    };

    CodeEditor.prototype._redoState = function (stateIndex) {
        var codeEditor = this,
            redoState = codeEditor.stateStack[stateIndex + 1];

        for (var i = 0; i < redoState.changes.modified.length; i++)
            codeEditor._setLineText(redoState.changes.modified[i].index, redoState.changes.modified[i].newValue);

        for (var j = 0; j < redoState.changes.added.length; j++)
            codeEditor._addLine(redoState.changes.added[j].index, redoState.changes.added[j].value);

        for (var k = redoState.changes.removed.length - 1; k >= 0; k--)
            codeEditor._removeLine(redoState.changes.removed[k].index);

        codeEditor._applyState(redoState);
        this.eventEmitter.emit(CodeEditor.CHANGE_EVENT, {text: this.getText()});
    };

    CodeEditor.prototype._undoState = function (stateIndex) {
        var codeEditor = this,
            changes = codeEditor.stateStack[stateIndex].changes,
            redoState = codeEditor.stateStack[stateIndex - 1];

        for (var i = 0; i < changes.modified.length; i++)
            codeEditor._setLineText(changes.modified[i].index, changes.modified[i].oldValue);

        for (var j = changes.added.length - 1; j >= 0; j--)
            codeEditor._removeLine(changes.added[j].index);

        for (var k = 0; k < changes.removed.length; k++)
            codeEditor._addLine(changes.removed[k].index, changes.removed[k].value);

        codeEditor._applyState(redoState);
        this.eventEmitter.emit(CodeEditor.CHANGE_EVENT, {text: this.getText()});
    };

    CodeEditor.prototype._applyState = function (state) {
        var codeEditor = this;
        this._clearChanges();
        codeEditor._updateEditorSize();
        if (codeEditor._hasSelection(state)) {
            var startLineIndex = state.selectionRegion.inverse ?
                    state.selectionRegion.endLine : state.selectionRegion.startLine,
                startPosition = state.selectionRegion.inverse ?
                    state.selectionRegion.endPosition : state.selectionRegion.startPosition;

            codeEditor._setCursor(startLineIndex, startPosition);
            codeEditor.state.selectionRegion.inverse = state.inverse;
            codeEditor._setCursor(state.lineIndex, state.position, false, true);
        }
        else
            codeEditor._setCursor(state.lineIndex, state.position);

        codeEditor._updateScroll();
        codeEditor._highlight();
    };

    CodeEditor.prototype._clearChanges = function () {
        this.changes = {
            modified: [],
            added: [],
            removed: []
        };
    };

    CodeEditor.prototype._getStateIndex = function (changesArray, lineIndex) {
        var changeIndex;
        $.each(changesArray, function (index, value) {
            if (value.index === lineIndex) {
                changeIndex = index;
                return false;
            }
        });
        return changeIndex;
    };

//API
    CodeEditor.prototype.enableEdit = function (value) {
        if (this.allowEdit === value)
            return;
        this.allowEdit = value;
        if (value) {
            if (!this.keyEventParser)
                this._initEventParser();
            ShadowUI.removeClass(this.$editor, DISABLED_CLASS);
        }
        else {
            ShadowUI.addClass(this.$editor, DISABLED_CLASS);
        }
    };

    CodeEditor.prototype.getText = function () {
        return this._getEditorText();
    };

    CodeEditor.prototype.setText = function (value) {
        var prevValue = this._getEditorText();
        if (prevValue !== value) {
            this._setEditorText(value);
            this._setCursor(this.$lines.length - 1, this._getLineLength(this.$lines.length - 1));
            this._textChanged();
        }
    };

    CodeEditor.prototype.insertText = function (value) {
        this._insertText(value.replace(/\r\n/g, '\n').split('\n'));
    };

    CodeEditor.prototype.addClass = function (className) {
        ShadowUI.addClass(this.$editor, className);
    };

    CodeEditor.prototype.removeClass = function (className) {
        ShadowUI.removeClass(this.$editor, className);
    };

    CodeEditor.prototype.getContainer = function () {
        return this.$scrollLayout;
    };

    CodeEditor.prototype.blur = function () {
        var res = NativeMethods.blur.call(this.$textarea[0]);

        this.eventEmitter.emit(CodeEditor.BLUR_EVENT);

        return res;
    };

    CodeEditor.prototype.focus = function () {
        return NativeMethods.focus.call(this.$textarea[0]);
    };

    CodeEditor.prototype.setCursorToEnd = function () {
        var lastLine = this.$lines.length - 1;

        this._setCursor(lastLine, this._getLineLength(lastLine));
    };

    CodeEditor.prototype.stopSelectionProcess = function () {
        this.mouseRightButtonPressed = false;
        this.mouseLeftButtonPressed = false;

        if (!this._hasSelection(this.state)) {
            this.state.selectionRegion.endLine = this.state.lineIndex;
            this.state.selectionRegion.endPosition = this.state.position;
        }

        if (!Util.isMozilla)
            return false;
    };
});
TestCafeClient.define('UI.RecorderWidgets.CodeFormatter', function () {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI;

    //consts
    var CHUNK_SIZE = 20;

    var COMMENT_CLASS = 'comment',
        KEYWORD_CLASS = 'keyword',
        STRING_CLASS = 'string',
        OPERATOR_CLASS = 'operator',
        LITERAL_CLASS = 'literal',
        ARGUMENT_CLASS = 'argument',
        FUNCTION_NAME_CLASS = 'functionName',
        FUNCTION_CLASS = 'function',
        PROPERTY_CLASS = 'property',
        LANGUAGE_CLASS = 'language',
        NUMBER_CLASS = 'number',
        OBJECT_CLASS = 'object',

        KEYWORDS = ['break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'finally',
            'for', 'function', 'if', 'in', 'instanceof', 'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof',
            'var', 'void', 'while', 'with'],

        OPERATORS = ['&lt;', '&gt;', '=', '\\!', '\\+', '\\-', '\\*', '\\%', '&amp;', '\\|', '\\b[0-9]+\\b', '\\$(?=\\.|\\()'],

        LITERALS = ['null', 'true', 'false', 'undefined', 'NaN', 'Infinity'],

        FUNCTIONS = ['alert', 'eval', 'toString', 'apply', 'call', 'test', 'toLocaleString', 'concat', 'join', 'pop',
            'push', 'reverse', 'shift', 'slice', 'sort', 'slice', 'unshift', 'indexOf', 'lastIndexOf',
            //String
            'fromCharCode', 'valueOf', 'charAt', 'charCodeAt', 'match', 'replace', 'search', 'slice', 'split', 'substring',
            'substr', 'toLowerCase', 'toLocaleLowerCase', 'toUpperCase', 'toLocaleUpperCase', 'trim',
            //Math
            'abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'random',
            'round', 'sin', 'sqrt', 'tan',
            //Date
            'parse', 'UTC', 'now', 'toDateString', 'toTimeString', 'toLocaleString', 'toLocaleDateString', 'toLocaleTimeString',
            'getTime', 'getFullYear', 'getUTCFullYear', 'getMonth', 'getUTCMonth', 'getDate', 'getUTCDate', 'getDay',
            'getUTCDay', 'getHours', 'getUTCHours', 'getMinutes', 'getUTCMinutes', 'getSeconds', 'getUTCSeconds',
            'getMilliseconds', 'getUTCMilliseconds', 'getTimezoneOffset', 'setTime', 'setMilliseconds', 'setUTCMilliseconds',
            'setSeconds', 'setUTCSeconds', 'setMinutes', 'setUTCMinutes', 'setHours', 'setUTCHours', 'setDate', 'setUTCDate',
            'setMonth', 'setUTCMonth', 'setFullYear', 'setUTCFullYear', 'toUTCString', 'toJSON',
            //Other
            'exec', 'test', 'parse', 'stringify', 'parseInt', 'parseFloat', 'isNaN', 'isFinite'
        ],

        PROPERTIES = ['length', 'constructor', 'prototype', 'MAX_VALUE', 'MIN_VALUE', 'NEGATIVE_INFINITY',
            'POSITIVE_INFINITY', 'E', 'LN10', 'LN2', 'LOG2E', 'LOG10E', 'PI', 'SQRT1_2', 'SQRT2', 'name'],

        OBJECTS = ['Array', 'Boolean', 'Date', 'Math', 'Number', 'Object', 'RegExp', 'String', 'window'],

        SAFE = { '<': '&lt;', '>': '&gt;', '&': '&amp;' };


    function createRegExpFromArray(array, notWords) {
        return notWords ?
            new RegExp('' + array.join('|'), 'g') :
            new RegExp('\\b(' + array.join('|') + ')\\b', 'g');
    }

    function getLanguageFunctionsRegExp() {
        var functions = $.map(FUNCTIONS, function (item) {
            return item + '(?=\\(([^\\)]*\\))?)';
        });
        return new RegExp('\\b' + functions.join('|'), 'g');
    }

    function getLanguagePropertiesRegExp() {
        var functions = $.map(PROPERTIES, function (item) {
            return '\\.' + item;
        });
        return new RegExp(functions.join('|') + '\\b', 'g');
    }

    function getCommentReplacer(index) {
        return '~~~C' + index + '~~~';
    }

    function getFormattedHtml(className, text) {
        var $span = $('<span>').html(text);

        ShadowUI.addClass($span, className);

        return $span.wrap('<p>')
            .parent()
            .html();
    }

    //CodeFormatter

    var CodeFormatter = this.exports = function () {
        this.commentsState = [];
        this.prevCommentsState = [];
        this.lineStartPositions = [];
        this.timeouts = [];
    };

    CodeFormatter.prototype._clearTimeouts = function () {
        while (this.timeouts.length) {
            window.clearTimeout(this.timeouts.pop());
        }
    };

    CodeFormatter.prototype._getLineFromTextPosition = function (position) {
        var i = 0;
        while (this.lineStartPositions[i + 1]) {
            if (position <= this.lineStartPositions[i + 1])
                return i;
            i++;
        }
        return i;
    };

    CodeFormatter.prototype._isCommentsStateChanged = function (newState) {
        var getComparableString = function (state) {
            return $.map(state,function (item) {
                return '' + item.start.line + ':' + item.start.position + '-' + item.end.line + ':' + item.end.position;
            }).join(' ');
        };

        return getComparableString(newState) !== getComparableString(this.commentsState);
    };

    CodeFormatter.prototype._isLineCommentsStateChanged = function (index) {
        var getComparableString = function (state) {
            var res = '';
            $.map(state, function (item) {
                res = res.concat(
                    typeof item.start === 'undefined' ? 'start' : item.start,
                    '-',
                    typeof item.end === 'undefined' ? 'end' : item.end
                );
            });
            return res;
        };

        return getComparableString(this._getLineCommentsState(index, true)) !== getComparableString(this._getLineCommentsState(index, false));
    };

    CodeFormatter.prototype._updateCommentsState = function (text) {
        var startCommentOrStringRegExp = /(?:\/\*)|(?:\/\/)|(?:'|")|(\\n)/gm,
            startBlockPosition = -1,
            endBlockPosition = -1,
            inComment = false,
            inString = false,

            startBlock = startCommentOrStringRegExp.exec(text),

            endCommentPosition = null,
            startLine = null,
            startPosition = null,
            endLine = null,
            endPosition = null,

            newState = [];

        var startStringBlock = function (quote) {
            var closedPosition = text.indexOf(quote, startCommentOrStringRegExp.lastIndex),
                lastLineSymbolPosition = text.indexOf('\n', startCommentOrStringRegExp.lastIndex) - 1;

            if (lastLineSymbolPosition < 0)
                lastLineSymbolPosition = text.length - 1;

            var endStringPosition = closedPosition < 0 ?
                lastLineSymbolPosition :
                Math.min(lastLineSymbolPosition, closedPosition);

            startBlockPosition = startCommentOrStringRegExp.lastIndex - 1;
            endBlockPosition = endStringPosition;
            inString = true;
        };

        while (startBlock) {
            var value = startBlock[0];
            if (inComment || inString) {
                if (startCommentOrStringRegExp.lastIndex - value.length <= endBlockPosition) {
                    if (startBlock[0] === '//')
                        startCommentOrStringRegExp.lastIndex--;
                    startBlock = startCommentOrStringRegExp.exec(text);
                    continue;
                }
                else {
                    inComment = false;
                    inString = false;
                }
            }

            switch (value) {
                case '/*':
                    var closePosition = text.indexOf('*/', startCommentOrStringRegExp.lastIndex);

                    endCommentPosition = closePosition < 0 ? text.length - 1 : closePosition;

                    startBlockPosition = startCommentOrStringRegExp.lastIndex - '/*'.length;
                    endBlockPosition = endCommentPosition + (closePosition < 0 ? 0 : 1);

                    startLine = this._getLineFromTextPosition(startBlockPosition);
                    startPosition = startBlockPosition - this.lineStartPositions[startLine];
                    endLine = this._getLineFromTextPosition(endBlockPosition);
                    endPosition = endBlockPosition - this.lineStartPositions[endLine];

                    newState.push({start: { line: startLine, position: startPosition, multiline: true },
                        end: {line: endLine, position: endPosition}});
                    inComment = true;
                    break;

                case '//':
                    endCommentPosition = text.indexOf('\n', startCommentOrStringRegExp.lastIndex - 1);

                    if (endCommentPosition < 0)
                        endCommentPosition = text.length - 1;

                    startBlockPosition = startCommentOrStringRegExp.lastIndex - '//'.length;
                    endBlockPosition = endCommentPosition;

                    startLine = this._getLineFromTextPosition(startBlockPosition);
                    startPosition = startBlockPosition - this.lineStartPositions[startLine];
                    endLine = this._getLineFromTextPosition(endBlockPosition);
                    endPosition = endBlockPosition - this.lineStartPositions[endLine];

                    if (text[endCommentPosition] === '\n')
                        endPosition--;

                    newState.push({start: {line: startLine, position: startPosition},
                        end: {line: endLine, position: endPosition}});
                    inComment = true;
                    break;

                case '\'':
                    startStringBlock('\'');
                    break;
                case '\"':
                    startStringBlock('\"');
                    break;
            }
            startBlock = startCommentOrStringRegExp.exec(text);
        }

        if (this._isCommentsStateChanged(newState)) {
            this.prevCommentsState = this.commentsState;
            this.commentsState = newState;
            return true;
        }
        return false;
    };

    CodeFormatter.prototype._getLineCommentsState = function (lineIndex, prev) {
        var state = [];
        $.each((prev ? this.prevCommentsState : this.commentsState), function (index, item) {
            if (item.start.line === lineIndex) {
                if (item.end.line === lineIndex)
                    state.push({start: item.start.position, end: item.end.position});
                else
                    state.push({start: item.start.position});
            }
            else if (item.end.line === lineIndex) {
                state.push({end: item.end.position});
            }
            else if (item.start.line < lineIndex && item.end.line > lineIndex)
                state.push({ start: 0 });
        });
        return state;
    };

    CodeFormatter.prototype._highlightLine = function (text, index) {
        var newText = text.replace(/[<>&]/g, function (m) {
                return SAFE[m];
            }),

            commentsState = this._getLineCommentsState(index),
            length = newText.length;

        commentsState = $.map(commentsState, function (item) {
            return { start: item.start || 0, end: item.end || length - 1 };
        });

        var strings = [],
            shift = 0;

        var replacedComments = $.map(commentsState, function (comment, index) {
            var start = comment.start + shift,
                end = comment.end + shift + 1,
                length = end - start,
                replacer = getCommentReplacer(index),
                value = newText.substring(start, end);
            shift += replacer.length - length;
            newText = newText.substring(0, start) + replacer + newText.substring(end, newText.length);
            return { replacer: replacer, value: value };
        });
        newText = newText
            //strings
            .replace(/(^|[^\\])((?:'(?:\\'|[^'])*(?:'|$))|(?:"(?:\\"|[^"])*(?:"|$)))/g, function (m, f, s) {
                var l = strings.length;
                strings.push(s);
                return f + '~~~S' + l + '~~~';
            })
            //operators and numbers
            .replace(createRegExpFromArray(OPERATORS, true), function (str) {
                if (str[0] >= '0' && str[0] <= '9')
                    return getFormattedHtml(NUMBER_CLASS, str);
                return getFormattedHtml(OPERATOR_CLASS, str);
            })
            //object in 'someObject.someFuction = function() ...' construction
            .replace(/(\S+)(\.\S+\s?(?:<[^>]+>)?=(?:<[^>]+>)?\s?function\s?\([^\)]*\))/g, function (str, p1, p2) {
                return getFormattedHtml(OBJECT_CLASS, p1) + p2;
            })
            //object in 'someObject.prototype.someFunction = ...' construction
            .replace(/(\S+)(\.prototype\.\S+\s?(?:<[^>]+>)?=(?:<[^>]+>)?)/g, function (str, p1, p2) {
                return getFormattedHtml(OBJECT_CLASS, p1) + p2;
            })
            //arguments in function
            .replace(/(\bfunction(?:\s?|(?:\s[^\(]+))\()([^\)]+)(\))/g, function (str, p1, p2, p3) {
                return p1 + getFormattedHtml(ARGUMENT_CLASS, p2) + p3;
            })
            //function name in 'function someName(args)' construction
            .replace(/(\bfunction\s)(\w+)(\([^\)]*\))/g, function (str, p1, p2, p3) {
                return p1 + getFormattedHtml(FUNCTION_NAME_CLASS, p2) + p3;
            })
            //function name in 'someName = function (args)...' construction
            .replace(/(\s|^|\.)(\w+)(\s?(?:(?:\s?(?:<[^>]+>)?=(?:<[^>]+>)?\s?)|=)\s?function\s?\([^\)]*\))/g, function (str, p1, p2, p3) {
                return p1 + getFormattedHtml(FUNCTION_NAME_CLASS, p2) + p3;
            })
            .replace(createRegExpFromArray(KEYWORDS), function (str) {
                return getFormattedHtml(KEYWORD_CLASS, str);
            })
            .replace(createRegExpFromArray(LITERALS), function (str) {
                return getFormattedHtml(LITERAL_CLASS, str);
            })
            .replace(getLanguageFunctionsRegExp(), function (str) {
                return getFormattedHtml(FUNCTION_CLASS, str);
            })
            .replace(getLanguagePropertiesRegExp(), function (str) {
                return '.' + getFormattedHtml(PROPERTY_CLASS, str.substring(1));
            })
            .replace(createRegExpFromArray(OBJECTS), function (str) {
                return getFormattedHtml(LANGUAGE_CLASS, str);
            })
            .replace(/~~~(S)(\d+)~~~/g, function (m, t, i) {
                return getFormattedHtml(STRING_CLASS, strings[i]);
            });

        $.each(replacedComments, function (index, comment) {
            var value = getFormattedHtml(COMMENT_CLASS, comment.value);
            newText = newText.replace(comment.replacer, value);
        });

        return newText;
    };

    CodeFormatter.prototype._highlightLines = function ($lines, changedLines, currentLine, checkAll) {
        var formatter = this,
            checkingLines = null;

        if (changedLines === undefined || changedLines.length === 0 || checkAll) {
            formatter._clearTimeouts();
            checkingLines = {start: 0, end: $lines.length - 1 };
        }
        else if (changedLines.length === 1)
            checkingLines = {start: changedLines[0], end: changedLines[0]};
        else {
            var sortedIndexes = changedLines.sort();
            checkingLines = { start: sortedIndexes[0], end: sortedIndexes[changedLines.length - 1] };
        }

        var highLightChunksRecursive = function (array, startIndex, backward) {
            var chunkSize = Math.min(CHUNK_SIZE, array.length),

                chunk = backward ? array.splice(array.length - chunkSize, chunkSize) : array.splice(0, chunkSize),

                text = $.map(chunk, function (item) {
                    return item.text();
                });

            $.each(chunk, function (index, item) {
                var curIndex = backward ? startIndex - chunkSize + index + 1 : startIndex + index;

                if (!changedLines || !changedLines.length || $.inArray(curIndex, changedLines) > -1 || formatter._isLineCommentsStateChanged(curIndex)) {
                    var html = formatter._highlightLine(text[index], curIndex),
                        $span = item.children('span:first');
                    $span.html(html);
                    if (Util.isIE)
                        Util.setUnselectableAttributeRecursive($span[0]);
                }
            });

            if (array.length) {
                formatter.timeouts.push(window.setTimeout(function () {
                    highLightChunksRecursive(array, startIndex + chunkSize * (backward ? -1 : 1), backward);
                }, 0));
            }
        };

        var $checkingLines = $lines.slice(checkingLines.start, checkingLines.end + 1);

        if ($checkingLines.length > CHUNK_SIZE * 2 && currentLine > checkingLines.start && currentLine < checkingLines.end) {
            highLightChunksRecursive($checkingLines.slice(checkingLines.start, currentLine), currentLine - 1, true);
            highLightChunksRecursive($checkingLines.slice(currentLine), currentLine);
        }
        else
            highLightChunksRecursive($checkingLines, checkingLines.start);
    };

    //API
    CodeFormatter.prototype.highlight = function ($lines, changedLines, currentLine) {
        var formatter = this;
        formatter.lineStartPositions = [0];
        var curPosition = 0,
            text = $.map($lines,function ($item) {
                var itemText = $item.text();
                curPosition += itemText.length + 1;
                formatter.lineStartPositions.push(curPosition);
                return itemText;
            }).join('\n');
        var commentsStateChanged = formatter._updateCommentsState(text);
        formatter._highlightLines($lines, changedLines, currentLine, commentsStateChanged);
    };
});
TestCafeClient.define('UI.RecorderWidgets.Combobox', function () {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        NativeMethods = Hammerhead.NativeMethods,
        ShadowUI = Hammerhead.ShadowUI,
        TextSelection = Hammerhead.TextSelection;

    //Const
    var COMBOBOX_CLASS = 'combobox',
        DROPDOWN_BUTTON_CLASS = 'dropdown-button',
        DROPDOWN_IMAGE_CLASS = 'dropdown-img',
        DROPDOWN_BUTTON_PRESSED_CLASS = 'pressed',
        ITEM_HOVERED_CLASS = 'hovered',
        ITEM_LIST_CLASS = 'items',
        ITEM_CLASS = 'item',

        ITEM_LIST_MARGIN = 3,

    //Events
        VALUE_CHANGED_EVENT = 'valueChanged';

    var Combobox = this.exports = function ($container, items, value, inputId) {
        var combobox = this;

        this.$combobox = null;
        this.$dropdownButton = null;
        this.$input = null;
        this.$itemList = null;
        this.items = [];
        this.itemListCreated = null;

        this.eventEmitter = new Util.EventEmitter();
        this.events = {
            on: function (ev, listener) {
                combobox.eventEmitter.on(ev, listener);
            }
        };

        this._createCombobox($container, items, value, inputId);
    };

    //Markup
    Combobox.prototype._createCombobox = function ($container, items, value, inputId) {
        this.$combobox = $('<div></div>')
            .appendTo($container);
        ShadowUI.addClass(this.$combobox, COMBOBOX_CLASS);

        this.items = items;

        this.$input = $('<input type="text">')
            .appendTo(this.$combobox)
            .attr('id', inputId)
            .attr('value', value);

        this.$dropdownButton = $('<div></div>').appendTo(this.$combobox);
        ShadowUI.addClass(this.$dropdownButton, DROPDOWN_BUTTON_CLASS);

        var $dropdownImg = $('<div></div>').appendTo(this.$dropdownButton);
        ShadowUI.addClass($dropdownImg, DROPDOWN_IMAGE_CLASS);
        this._init();
    };

    Combobox.prototype._createItemList = function () {
        var combobox = this;

        combobox.itemListCreated = true;

        this.$itemList = $('<div></div>').appendTo(this.$combobox);
        ShadowUI.addClass(this.$itemList, ITEM_LIST_CLASS);

        $.each(this.items, function (index, item) {
            var $item = $('<div></div>')
                .text(item)
                .appendTo(combobox.$itemList);
            ShadowUI.addClass($item, ITEM_CLASS);

            if (index === 0)
                $item.css('margin-top', '6px');

            $item.mouseenter(function () {
                ShadowUI.removeClass(combobox._getHoveredItem(), ITEM_HOVERED_CLASS);
                ShadowUI.addClass($item, ITEM_HOVERED_CLASS);
            });

            $item.click(function () {
                combobox._setValue($item.text());
                combobox._hideItemList();
            });
        });

        this.$itemList.css({
            width: this.$combobox.width(),
            display: 'none'
        });

        ShadowUI.addClass(combobox.$dropdownButton, DROPDOWN_BUTTON_PRESSED_CLASS);

        this._updateItemListPosition();
    };

//Behavior
    Combobox.prototype._onArrowPressed = function (offset) {
        var combobox = this,
            $hoveredItem = combobox._getHoveredItem(),
            hoveredItemValue = $hoveredItem.text(),
            hoveredItemIndex = $.inArray(hoveredItemValue, combobox.items),
            activeValue = combobox._getValue(),
            activeItemIndex = $.inArray(activeValue, combobox.items),
            isStepListVisible = (combobox.itemListCreated && combobox.$itemList.is(':visible')),
            currentItemIndex = isStepListVisible ? hoveredItemIndex : activeItemIndex;

        if ((offset === 1 && (currentItemIndex !== -1 && currentItemIndex !== combobox.items.length - 1)) ||
            (offset === -1 && (currentItemIndex !== -1 && currentItemIndex !== 0))) {
            if (isStepListVisible) {
                ShadowUI.removeClass(combobox._getHoveredItem(), ITEM_HOVERED_CLASS);
                ShadowUI.addClass(ShadowUI.select('.' + COMBOBOX_CLASS + '>.' + ITEM_LIST_CLASS + '>.' + ITEM_CLASS + ':' + 'visible').eq(currentItemIndex + offset), ITEM_HOVERED_CLASS);
            }
            combobox._setValue(combobox.items[currentItemIndex + offset]);
        }
    };

    Combobox.prototype._init = function () {
        var combobox = this;

        var onMouseDown = function (e) {
            var inputValueLength = combobox.$input[0].value.length;

            if ((e.button === Util.BUTTON.LEFT || Util.hasTouchEvents) && !combobox.itemListCreated)
                combobox._createItemList();

            if (e.button === Util.BUTTON.LEFT || Util.hasTouchEvents) {
                if (!combobox.$itemList.is(':visible'))
                    combobox._showItemList();
                else
                    combobox._hideItemList();
            }

            NativeMethods.focus.call(combobox.$input[0]);
            TextSelection.select(combobox.$input[0], inputValueLength, inputValueLength);

            Util.preventDefault(e);
        };

        ShadowUI.bind(this.$input, 'mousedown', onMouseDown);
        ShadowUI.bind(this.$dropdownButton, 'mousedown', onMouseDown);

        ShadowUI.bind(this.$input, 'focus', function () {
            var inputValueLength = combobox.$input[0].value.length;

            NativeMethods.focus.call(combobox.$input[0]);
            TextSelection.select(combobox.$input[0], inputValueLength, inputValueLength);
        });

        ShadowUI.bind(this.$input, 'keydown', function (e) {
            var keyCode = e.keyCode;
            if (Util.isCharByKeyCode(keyCode, Util.isShadowUIElement) || /^(backspace|delete)$/.test(Util.KEYS_MAPS.REVERSED_SPECIAL_KEYS[keyCode])) {
                Util.preventDefault(e);
                return;
            }

            if (/^(down|right)$/.test(Util.KEYS_MAPS.REVERSED_SPECIAL_KEYS[keyCode])) {
                combobox._onArrowPressed(1);
                Util.preventDefault(e);
            }
            else if (/^(up|left)$/.test(Util.KEYS_MAPS.REVERSED_SPECIAL_KEYS[keyCode])) {
                combobox._onArrowPressed(-1);
                Util.preventDefault(e);
            }
            else if (/^(enter|esc)$/.test(Util.KEYS_MAPS.REVERSED_SPECIAL_KEYS[keyCode]) &&
                     (combobox.$itemList && combobox.$itemList.css('display') !== 'none')) {
                combobox._hideItemList();
                Util.preventDefault(e);
            }
            else if (combobox.itemListCreated)
                combobox._hideItemList();
        });
    };

    Combobox.prototype._setValue = function (value) {
        if (this.$input.attr('value') !== value) {
            this.$input.attr('value', value);
            this.eventEmitter.emit(VALUE_CHANGED_EVENT, { value: value });
        }
    };

    Combobox.prototype._getValue = function () {
        return this.$input.attr('value');
    };

    Combobox.prototype._updateItemListPosition = function () {
        var $window = $(window),
            comboboxPosition = Util.getOffsetPosition(this.$combobox[0]),
            itemListHeight = this.$itemList.height(),
            itemListTopPosition = comboboxPosition.top - $window.scrollTop() + this.$combobox.height();

        if (itemListTopPosition + itemListHeight > $window.scrollTop() + $window.height()) {
            var topPositionAboveCombobox = comboboxPosition.top - ITEM_LIST_MARGIN - itemListHeight;
            if (topPositionAboveCombobox >= $window.scrollTop())
                itemListTopPosition = topPositionAboveCombobox;
        }
        this.$itemList.css({
            left: comboboxPosition.left - $window.scrollLeft(),
            top: itemListTopPosition
        });
    };

    Combobox.prototype._showItemList = function () {
        var combobox = this;

        var onDocumentClick = function (e) {
            var target = e.target || e.srcElement;
            if (!combobox.$combobox.has(target).length) {
                combobox._hideItemList();
                ShadowUI.unbind($(document), 'mousedown', onDocumentClick);
                ShadowUI.unbind($(document), 'scroll', onDocumentScroll);
                ShadowUI.unbind($(window), 'resize', onResize);
            }
        };

        var onResize = function () {
            if (combobox.itemListCreated && combobox.$itemList.is(':visible')) {
                combobox._hideItemList();
                ShadowUI.unbind($(document), 'mousedown', onDocumentClick);
                ShadowUI.unbind($(document), 'scroll', onDocumentScroll);
            }
            ShadowUI.unbind($(window), 'resize', onResize);
        };

        var onDocumentScroll = function () {
            combobox._hideItemList();
            ShadowUI.unbind($(document), 'mousedown', onDocumentClick);
            ShadowUI.unbind($(document), 'scroll', onDocumentScroll);
            ShadowUI.unbind($(window), 'resize', onDocumentScroll);
        };

        this._updateItemListPosition();
        this.$itemList.css('display', '');

        var $activeItem = this.$itemList.children().filter(function () {
            return $(this).text() === combobox._getValue();
        });
        ShadowUI.addClass($activeItem, ITEM_HOVERED_CLASS);

        ShadowUI.addClass(combobox.$dropdownButton, DROPDOWN_BUTTON_PRESSED_CLASS);
        ShadowUI.bind($(document), 'mousedown', onDocumentClick);
        ShadowUI.bind($(document), 'scroll', onDocumentScroll);
        ShadowUI.bind($(window), 'resize', onResize);
        return false;
    };

    Combobox.prototype._hideItemList = function () {
        ShadowUI.removeClass(this._getHoveredItem(), ITEM_HOVERED_CLASS);
        this.$itemList.css('display', 'none');
        ShadowUI.removeClass(this.$dropdownButton, DROPDOWN_BUTTON_PRESSED_CLASS);
        return false;
    };

    Combobox.prototype._getHoveredItem = function () {
        return ShadowUI.select('.' + COMBOBOX_CLASS + '>.' + ITEM_LIST_CLASS + '>.' + ITEM_CLASS + '.' + ITEM_HOVERED_CLASS);
    };
});
TestCafeClient.define('UI.RecorderWidgets.ConfirmDialog', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        PopupWidget = require('UI.RecorderWidgets.Popup');

    //Const
    var CONFIRM_DIALOG_CONTENT_CLASS = 'confirm',
        CONFIRM_MESSAGE_CLASS = 'confirm-message',
        JUSTIFY_TEXT_CLASS = 'justify-text';

    var ConfirmDialog = this.exports = function ($container, args) {
        this.options = args;
        this.popup = null;
        this.headerText = '';
        this.confirmMessage = [];

        this._createDialog($container);
    };

    //Markup
    ConfirmDialog.prototype._createDialog = function ($container) {
        this.headerText = this.options.headerText || '';
        this.confirmMessage = this.options.message || '';

        var popupOptions = {
                width: this.options.popupWidth || 528,
                content: this._createContent($('<div></div>')),
                footerContent: this.options.footerContent,
                headerText: this.options.headerText,
                showAtWindowCenter: true
            };

        this.popup = new PopupWidget($container, popupOptions);
    };

    ConfirmDialog.prototype._createContent = function ($container) {
        var dialog = this;
        ShadowUI.addClass($container, CONFIRM_DIALOG_CONTENT_CLASS);

        var $confirmMessage = $('<div></div>').appendTo($container);
        ShadowUI.addClass($confirmMessage, CONFIRM_MESSAGE_CLASS);

        var $span = null;

        if (this.confirmMessage.length)
            $.each(this.confirmMessage, function (index, value) {
                $span = $('<span></span>').appendTo($confirmMessage)
                    .html(value);

                if (dialog.options.justifyText)
                    ShadowUI.addClass($span, JUSTIFY_TEXT_CLASS);
            });
        else {
            $span = $('<span></span>').appendTo($confirmMessage)
                .html(this.confirmMessage);

            if (dialog.options.justifyText)
                ShadowUI.addClass($span, JUSTIFY_TEXT_CLASS);
        }
        return $container;
    };


    //API
    ConfirmDialog.prototype.bindEnterPressHandler = function (handler) {
        this.popup.onkeydown(function (e) {
            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.enter) {
                handler();
                Util.preventDefault(e);
            }
        }, true, true);
    };

    ConfirmDialog.prototype.closeDialog = function (callback) {
        this.popup.close(callback);
    };

    ConfirmDialog.prototype.blind = function (blind) {
        this.popup.blind(blind);
    };
});
TestCafeClient.define('UI.RecorderWidgets.DialogProperty', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        EventSandbox = Hammerhead.EventSandbox,

        ValidationMessageFactory = require('UI.ValidationMessageFactory'),
        SharedConst = require('Shared.Const'),
        TextSelection = Hammerhead.TextSelection;

    //Const
    var PROPERTY_CLASS = 'dialog-property',
        MAXIMIZED_PROPERTY_CLASS = 'maximized',
        SMALL_PROPERTY_CLASS = 'small',
        FIELD_CLASS = 'field',
        VALUE_CLASS = 'value',
        READONLY_CLASS = 'readonly_property',
        INPUT_CLASS = 'input',
        DISABLED_CLASS = 'disabled',

        INCORRECT_KEYS_ERROR = 'Incorrect keys',

        CHANGE_PROPERTY_VALUE_EVENT_DELAY = 333,
        MAXIMIZED_INPUT_LEFT_INDENT = 52;

    //options:
    //isKeysProperty
    //isNumericProperty
    //isNotNegativeNumericProperty
    //isPositiveNumericProperty
    //isReadOnly
    //maximizeInput

    //DialogProperty
    var DialogProperty = this.exports = function ($container, labelText, value, options) {
        var property = this;

        this.options = options || {};
        this.labelText = labelText;
        this.isDisabled = false;
        this.hasError = false;

        this.$container = $container;
        this.$property = null;
        this.$field = null;
        this.$value = null;
        this.$input = null;

        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            property.eventEmitter.on(ev, listener);
        };

        this._createProperty(value);

        if (!this.options.isReadOnly) {
            this._initPropertyInput();
            this._validate();
        }
    };

    //Events
    DialogProperty.VALUE_CHANGED_EVENT = 'valueChangedEvent';

    //Markup
    DialogProperty.prototype._createProperty = function (value) {
        this.$property = $('<div></div>').appendTo(this.$container);
        ShadowUI.addClass(this.$property, PROPERTY_CLASS);

        if (this.options.maximizeInput)
            ShadowUI.addClass(this.$property, MAXIMIZED_PROPERTY_CLASS);

        if (this.options.smallInput)
            ShadowUI.addClass(this.$property, SMALL_PROPERTY_CLASS);

        var inputId = SharedConst.PROPERTY_PREFIX + this.labelText + Math.random().toString().replace('0.', '-');
        this._createLabel(inputId);

        if (!this.options.isReadOnly)
            this._createTextInput(inputId, value);
        else {
            ShadowUI.addClass(this.$property, READONLY_CLASS);
            this._createTextView(value);
        }
    };

    DialogProperty.prototype._createLabel = function (inputId) {
        this.$field = $('<label></label>')
            .appendTo(this.$property)
            .text(this.labelText === 'caretPos' ? 'caretPos:' : this.labelText);
        ShadowUI.addClass(this.$field, FIELD_CLASS);
        this.$field.attr('for', inputId);
    };

    DialogProperty.prototype._createTextView = function (value) {
        if (typeof value === 'string')
            value = [value];

        this.$value = $('<div>').appendTo(this.$property);

        for (var i = 0; i < value.length; i++) {
            $('<span>').text(value[i]).appendTo(this.$value);
            $('<br>').appendTo(this.$value);
        }

        ShadowUI.addClass(this.$value, VALUE_CLASS);
    };

    DialogProperty.prototype._createTextInput = function (inputId, inputValue) {
        this.$value = $('<div></div>').appendTo(this.$property);
        ShadowUI.addClass(this.$value, VALUE_CLASS);

        this.$input = $('<input type="text">')
            .appendTo(this.$value)
            .attr('id', inputId)
            .attr('value', inputValue);
        ShadowUI.addClass(this.$input, INPUT_CLASS);

        if (this.options.maximizeInput)
            this.$input.width(this.$container.width() - MAXIMIZED_INPUT_LEFT_INDENT);
    };

    //Behaviour
    DialogProperty.prototype._initPropertyInput = function () {
        var property = this,
            changeEventDelayTimerId = null;

        this.$input.bind('focus', function (e) {
            if (!property.isDisabled)
                return;

            var $inputs = ShadowUI.select('.' + INPUT_CLASS, property.$container),
                nextFocusableIndex = $.inArray(property.$input[0], $inputs);

            do
                nextFocusableIndex = nextFocusableIndex === $inputs.length - 1 ? 0 : nextFocusableIndex++;
            while
                ($inputs[nextFocusableIndex] !== property.$input[0] && ShadowUI.hasClass($inputs.eq(nextFocusableIndex), DISABLED_CLASS));

            if ($inputs[nextFocusableIndex] !== property.$input[0])
                $inputs.eq(nextFocusableIndex).focus();

            Util.preventDefault(e);
        });

        this.$input.bind('mousedown', function (e) {
            if (property.isDisabled)
                Util.preventDefault(e);
        });

        EventSandbox.addInternalEventListener(window, ['keydown'], function (e) {
            if (e.target !== property.$input[0])
                return;

            if (property.isDisabled) {
                Util.preventDefault(e);
                return false;
            }

            var keyCode = e.keyCode,
                isMinus = keyCode === 189 || keyCode === 109,
                isDigit = (!e.shiftKey && keyCode >= 48 && keyCode <= 57) || (keyCode >= 96 && keyCode <= 105),
                isChar = Util.isCharByKeyCode(keyCode);

            if (isChar) {
                if (property.options.isNumericProperty) {
                    if (!isDigit && !isMinus)
                        Util.preventDefault(e);
                    else if (property.options.isNotNegativeNumericProperty || property.options.isPositiveNumericProperty)
                        if (isMinus)
                            Util.preventDefault(e);
                }
            }
            else
                property._preventInputScrolling(e);
        });

        EventSandbox.addInternalEventListener(window, ['keypress', 'keyup'], function (e) {
            if (e.target === property.$input[0])
                Util.stopPropagation(e);
        });

        this.$input.bind('input', function () {
            if (changeEventDelayTimerId) {
                window.clearTimeout(changeEventDelayTimerId);
                changeEventDelayTimerId = null;
            }

            var isValid = property._isValid();

            if (isValid) {
                property._onSuccess();
                property._onChange();
            }
            else {
                changeEventDelayTimerId = window.setTimeout(function () {
                    property._onError();
                    property._onChange();
                }, CHANGE_PROPERTY_VALUE_EVENT_DELAY);
            }
        });
    };

    DialogProperty.prototype._validate = function () {
        if (!this._isValid())
            this._onError();
        else
            this._onSuccess();
    };

    DialogProperty.prototype._isValid = function () {
        if (this.isDisabled || (!this.options.isKeysProperty && !this.options.isNumericProperty))
            return true;

        var value = this.$input[0].value;

        if (!value.length)
            return !!this.options.isNotNegativeNumericProperty;

        if (this.options.isKeysProperty)
            if (Util.parseKeysString(value).error)
                return false;

        if (this.options.isNumericProperty)
            if (!(/^(-)?\d+$/.test($.trim(value))))
                return false;

        if (this.options.isNotNegativeNumericProperty || this.options.isPositiveNumericProperty) {
            var valueAsNumber = parseInt($.trim(value));

            if (valueAsNumber < 0)
                return false;

            if (this.options.isPositiveNumericProperty && valueAsNumber === 0)
                return false;
        }

        return true;
    };

    DialogProperty.prototype._onError = function () {
        ValidationMessageFactory.error(this.$input, this.options.isKeysProperty ? INCORRECT_KEYS_ERROR : null);
        this.hasError = true;
    };

    DialogProperty.prototype._onSuccess = function () {
        if (this.hasError) {
            ValidationMessageFactory.success(this.$input);
            this.hasError = false;
        }
    };

    DialogProperty.prototype._onChange = function () {
        var args = {};

        args.value = (this.options.isNumericProperty && this.$input[0].value.length) ? parseInt(this.$input[0].value) :
            this.$input[0].value;

        this.eventEmitter.emit(DialogProperty.VALUE_CHANGED_EVENT, args);
    };

    DialogProperty.prototype._preventInputScrolling = function (ev) {
        if (Util.isWebKit) {
            var startSelection = TextSelection.getSelectionStart(this.$input[0]),
                endSelection = TextSelection.getSelectionEnd(this.$input[0]);

            if (startSelection === endSelection)
                if ((ev.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.left && startSelection === 0) ||
                    (ev.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.right && startSelection === this.$input[0].value.length)) {
                    Util.preventDefault(ev);
                }
        }
    };

    DialogProperty.prototype.disable = function () {
        this.isDisabled = true;
        if (this.$input) {
            ShadowUI.addClass(this.$input, DISABLED_CLASS);
            //NOTE: In IE9 setting of 'disabled' attribute leads to the appearance of text decoration (white shadow)
            // that can not be removed. Therefore, we should emulate the setting of this attribute.
            if (!(Util.isIE && Util.browserVersion === 9))
                this.$input.attr('disabled', 'disabled');
        }
    };

    DialogProperty.prototype.enable = function () {
        this.isDisabled = false;
        if (this.$input) {
            ShadowUI.removeClass(this.$input, DISABLED_CLASS);
            if (!(Util.isIE && Util.browserVersion === 9))
                this.$input.removeAttr('disabled');
        }
    };

    DialogProperty.prototype.isValid = function () {
        return !this.hasError;
    };

    DialogProperty.prototype.getLabelText = function () {
        return this.labelText;
    };

    DialogProperty.prototype.getInputElement = function () {
        if (this.$input)
            return this.$input[0];
    };

    DialogProperty.prototype.getEditorText = function () {
        if (this.$input)
            return this.$input[0].value;
    };

    DialogProperty.prototype.setEditorText = function (text) {
        if (this.$input) {
            this.$input[0].value = text;
            this._onChange();
        }
    };
});
TestCafeClient.define('UI.RecorderWidgets.ElementsMarker', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        MessageSandbox = Hammerhead.MessageSandbox,
        RecorderUtil = require('Recorder.Util'),
        JavascriptExecutor = require('Base.JavascriptExecutor');

    //Consts
    var POINTERS_BASE_FRAME_WIDTH = 0,
        ELEMENT_FRAME_WIDTH = 4,
        ELEMENT_FRAME_PADDING = 3,
        SHADOW_OFFSET = 4,
        POINTER_START_WIDTH = 20,

        DRAWING_TIME_INTERVAL = 17,

        ELEMENTS_MARKER_CLASS = RecorderUtil.ELEMENTS_MARKER_CLASS,
    //following class names are used in tests for svg elements identifying
        BACKGROUND_CLASS = 'background',
        POINTERS_BASE_FRAME_CLASS = 'pointersBaseFrame',
        POINTERS_BASE_FRAME_SHADOW_CLASS = 'pointersBaseFrameShadow',
        ELEMENT_FRAME_CLASS = 'elementFrame',
        ELEMENT_FRAME_SHADOW_CLASS = 'elementFrameShadow',
        POINTER_CLASS = 'pointer',

        SVG_OPEN_TAG = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">',
        SVG_CLOSE_TAG = '</svg>';

    //Events
    exports.ELEMENT_RECTANGLES_COUNT_CHANGED = 'elementRectanglesCountChanged';

    //Global
    var $elementsMarker = null,
        $svgElement = null,
        elementsMarkerIntervalId = null,
        forceUpdateMarking = false,
        savedBaseRectangle = null,
        savedElementsRectangles = null,
        eventEmitter = null;

    //Rectangle
    var Rectangle = function (left, top, width, height) {
        this.top = top;
        this.left = left;
        this.width = width;
        this.height = height;
        this.right = left + width;
        this.bottom = top + height;
    };

    Rectangle.prototype.intersectsWith = function (rectangle) {
        return (rectangle.left < this.right && this.left < rectangle.right && rectangle.top < this.bottom && this.top < rectangle.bottom);
    };

    Rectangle.prototype.getIntersectionPoints = function (figure) {
        //figure may be a rectangle or a line
        var points = [];

        if (figure instanceof Rectangle) {
            if (figure.top < this.top && figure.bottom > this.top) {
                if (figure.left > this.left && figure.left < this.right)
                    points.push({left: figure.left, top: this.top, isTop: true, isIntersection: true});

                if (figure.right > this.left && figure.right < this.right)
                    points.push({left: figure.right, top: this.top, isTop: true, isIntersection: true});
            }

            if (figure.top < this.bottom && figure.bottom > this.bottom) {
                if (figure.left > this.left && figure.left < this.right)
                    points.push({left: figure.left, top: this.bottom, isBottom: true, isIntersection: true});

                if (figure.right > this.left && figure.right < this.right)
                    points.push({left: figure.right, top: this.bottom, isBottom: true, isIntersection: true});
            }

            if (figure.left < this.left && figure.right > this.left) {
                if (figure.top > this.top && figure.top < this.bottom)
                    points.push({left: this.left, top: figure.top, isLeft: true, isIntersection: true});

                if (figure.bottom > this.top && figure.bottom < this.bottom)
                    points.push({left: this.left, top: figure.bottom, isLeft: true, isIntersection: true});
            }

            if (figure.left < this.right && figure.right > this.right) {
                if (figure.top > this.top && figure.top < this.bottom)
                    points.push({left: this.right, top: figure.top, isRight: true, isIntersection: true});

                if (figure.bottom > this.top && figure.bottom < this.bottom)
                    points.push({left: this.right, top: figure.bottom, isRight: true, isIntersection: true});
            }
        }
        else if (figure.start && figure.end) {
            var start = figure.start,
                end = figure.end,
            //here we find the points of infinite lines intersection
                leftSideIntersectionTop = start.top + ((end.top - start.top) * (this.left - start.left)) / (end.left - start.left),
                rightSideIntersectionTop = start.top + ((end.top - start.top) * (this.right - start.left)) / (end.left - start.left),
                topSideIntersectionLeft = start.left + ((end.left - start.left) * (this.top - start.top)) / (end.top - start.top),
                bottomSideIntersectionLeft = start.left + ((end.left - start.left) * (this.bottom - start.top)) / (end.top - start.top);

            //and here we determine whether the points lay within the bounds of the figures
            if (leftSideIntersectionTop <= this.bottom && leftSideIntersectionTop >= this.top &&
                leftSideIntersectionTop <= Math.max(start.top, end.top) && leftSideIntersectionTop >= Math.min(start.top, end.top) &&
                this.left > Math.min(start.left, end.left) && this.left < Math.max(start.left, end.left)) {
                points.push({left: this.left, top: leftSideIntersectionTop, isLeft: true, isIntersection: true});
            }

            if (rightSideIntersectionTop <= this.bottom && rightSideIntersectionTop >= this.top &&
                rightSideIntersectionTop <= Math.max(start.top, end.top) && rightSideIntersectionTop >= Math.min(start.top, end.top) &&
                this.right > Math.min(start.left, end.left) && this.right < Math.max(start.left, end.left)) {
                points.push({left: this.right, top: rightSideIntersectionTop, isRight: true, isIntersection: true});
            }

            if (topSideIntersectionLeft <= this.right && topSideIntersectionLeft >= this.left &&
                topSideIntersectionLeft <= Math.max(start.left, end.left) && topSideIntersectionLeft >= Math.min(start.left, end.left) &&
                this.top > Math.min(start.top, end.top) && this.top < Math.max(start.top, end.top)) {
                points.push({left: topSideIntersectionLeft, top: this.top, isTop: true, isIntersection: true});
            }

            if (bottomSideIntersectionLeft <= this.right && bottomSideIntersectionLeft >= this.left &&
                bottomSideIntersectionLeft <= Math.max(start.left, end.left) && bottomSideIntersectionLeft >= Math.min(start.left, end.left) &&
                this.bottom > Math.min(start.top, end.top) && this.bottom < Math.max(start.top, end.top)) {
                points.push({left: bottomSideIntersectionLeft, top: this.bottom, isBottom: true, isIntersection: true});
            }
        }
        return points;
    };

    Rectangle.prototype.contains = function (figure, excludeBorders) {
        //figure may be a rectangle or a point
        if (figure instanceof Rectangle) {
            if (excludeBorders)
                return this.left < figure.left && figure.right < this.right && this.top < figure.top && figure.bottom < this.bottom;
            else
                return this.left <= figure.left && figure.right <= this.right && this.top <= figure.top && figure.bottom <= this.bottom;
        }
        else {
            if (excludeBorders)
                return this.left < figure.left && figure.left < this.right && this.top < figure.top && figure.top < this.bottom;
            else
                return this.left <= figure.left && figure.left <= this.right && this.top <= figure.top && figure.top <= this.bottom;
        }
    };

    Rectangle.prototype.equals = function (rectangle) {
        return rectangle && this.left === rectangle.left && this.top === rectangle.top &&
            this.width === rectangle.width && this.height === rectangle.height;
    };

    Rectangle.prototype.getCenter = function () {
        return {
            left: this.left + this.width / 2,
            top: this.top + this.height / 2
        };
    };

    function getRectangle($element, padding) {
        var rect = Util.getElementRectangleForMarking($element[0], padding, ELEMENT_FRAME_WIDTH);

        return new Rectangle(rect.left, rect.top, rect.width, rect.height);
    }

    function mergeArraysUnique() {
        var merged = [];

        $.each(arguments, function (index, array) {
            $.each(array, function (index, element) {
                if ($.inArray(element, merged) < 0)
                    merged.push(element);
            });
        });

        return merged;
    }

    function getFirstIndexOfArrayContainingJointElements(arrays, currentArrayIndex) {
        for (var i = currentArrayIndex + 1; i < arrays.length; i++) {
            for (var j = 0; j < arrays[currentArrayIndex].length; j++)
                if ($.inArray(arrays[currentArrayIndex][j], arrays[i]) >= 0) {
                    return i;
                }
        }

        return -1;
    }

    function mergeArraysContainingJointElements(arraysForMerging) {
        var merged = arraysForMerging.concat();

        for (var i = 0; i < merged.length; i++) {
            var indexOfArrayContainingJointElements = getFirstIndexOfArrayContainingJointElements(merged, i);

            if (indexOfArrayContainingJointElements > 0) {
                merged[i] = mergeArraysUnique(merged[i], merged[indexOfArrayContainingJointElements]);
                merged.splice(indexOfArrayContainingJointElements, 1);
                i--;
            }
        }

        return merged;
    }

    function getIntersectingRectanglesGroups(rectangles) {
        var groups = [];

        for (var i = 0; i < rectangles.length; i++) {
            var group = [rectangles[i]];

            for (var j = i + 1; j < rectangles.length; j++) {
                if (rectangles[i].intersectsWith(rectangles[j]))
                    group.push(rectangles[j]);
            }

            if (group.length > 1)
                groups.push(group);
        }

        return mergeArraysContainingJointElements(groups);
    }

    function getRectanglesIntersectionPoints(rectangles) {
        var intersectionPoints = [];

        for (var i = 0; i < rectangles.length; i++)
            for (var j = i + 1; j < rectangles.length; j++)
                intersectionPoints = intersectionPoints.concat(rectangles[i].getIntersectionPoints(rectangles[j]));

        for (var n = 0; n < intersectionPoints.length - 1; n++)
            for (var k = n + 1; k < intersectionPoints.length; k++) {
                if (intersectionPoints[n].left === intersectionPoints[k].left && intersectionPoints[n].right === intersectionPoints[k].left)
                    intersectionPoints.splice(k--, 1);
            }

        return intersectionPoints;
    }

    function isCornerNotLyingInsideRectangles(corner, cornerRectangle, rectangles) {
        for (var i = 0; i < rectangles.length; i++)
            if (rectangles[i] !== cornerRectangle) {

                if (rectangles[i].contains(corner, true))
                    return false;

                else if (rectangles[i].contains(corner)) {
                    if (corner.isTop && corner.isLeft) {
                        if (rectangles[i].top === corner.top ? rectangles[i].left !== corner.left : rectangles[i].left === corner.left)
                            return false;
                    }
                    else if (corner.isTop) {
                        if (rectangles[i].top === corner.top ? rectangles[i].right !== corner.left : rectangles[i].right === corner.left)
                            return false;
                    }
                    else if (corner.isLeft) {
                        if (rectangles[i].bottom === corner.top ? rectangles[i].left !== corner.left : rectangles[i].left === corner.left)
                            return false;
                    }
                    else {
                        if (rectangles[i].bottom === corner.top ? rectangles[i].right !== corner.left : rectangles[i].right === corner.left)
                            return false;
                    }
                }
            }

        return true;
    }

    function isCornerInArray(corner, corners) {
        for (var i = 0; i < corners.length; i++) {
            if (corners[i].left === corner.left && corners[i].top === corner.top && corners[i].isTop === corner.isTop && corners[i].isLeft === corner.isLeft)
                return true;
        }

        return false;
    }

    function getRectanglesCorners(rectangles) {
        var corners = [];

        for (var i = 0; i < rectangles.length; i++) {
            var topLeftCorner = {left: rectangles[i].left, top: rectangles[i].top, isLeft: true, isTop: true};
            var topRightCorner = {left: rectangles[i].right, top: rectangles[i].top, isTop: true};
            var bottomLeftCorner = {left: rectangles[i].left, top: rectangles[i].bottom, isLeft: true};
            var bottomRightCorner = {left: rectangles[i].right, top: rectangles[i].bottom};

            if (isCornerNotLyingInsideRectangles(topLeftCorner, rectangles[i], rectangles) && !isCornerInArray(topLeftCorner, corners))
                corners.push(topLeftCorner);

            if (isCornerNotLyingInsideRectangles(topRightCorner, rectangles[i], rectangles) && !isCornerInArray(topRightCorner, corners))
                corners.push(topRightCorner);

            if (isCornerNotLyingInsideRectangles(bottomLeftCorner, rectangles[i], rectangles) && !isCornerInArray(bottomLeftCorner, corners))
                corners.push(bottomLeftCorner);

            if (isCornerNotLyingInsideRectangles(bottomRightCorner, rectangles[i], rectangles) && !isCornerInArray(bottomRightCorner, corners))
                corners.push(bottomRightCorner);
        }

        return corners;
    }

    function getTopLeftPoint(points) {
        var topLeftPoint = points[0];
        for (var i = 1; i < points.length; i++) {
            if (points[i].top < topLeftPoint.top)
                topLeftPoint = points[i];

            else if (points[i].top === topLeftPoint.top && points[i].left < topLeftPoint.left)
                topLeftPoint = points[i];
        }

        return topLeftPoint;
    }

    function getClosestPointOnVector(vector, points) {
        var closestPoint = null;

        if (vector.directionRight)
            $.each(points, function (index, point) {
                if (point.top === vector.top)
                    if (point.left > vector.left && (!closestPoint || point.left < closestPoint.left))
                        closestPoint = point;
            });
        else if (vector.directionDown)
            $.each(points, function (index, point) {
                if (point.left === vector.left)
                    if (point.top > vector.top && (!closestPoint || point.top < closestPoint.top))
                        closestPoint = point;
            });
        else if (vector.directionLeft)
            $.each(points, function (index, point) {
                if (point.top === vector.top)
                    if (point.left < vector.left && (!closestPoint || point.left > closestPoint.left))
                        closestPoint = point;
            });
        else if (vector.directionUp)
            $.each(points, function (index, point) {
                if (point.left === vector.left)
                    if (point.top < vector.top && (!closestPoint || point.top > closestPoint.top))
                        closestPoint = point;
            });

        return closestPoint;
    }

    function getIntersectedRectanglesBackgroundHole(intersectedRectangles) {
        var points = getRectanglesIntersectionPoints(intersectedRectangles).concat(getRectanglesCorners(intersectedRectangles));
        var currentVector = getTopLeftPoint(points);

        points.splice(points.indexOf(currentVector), 1);
        currentVector.directionRight = true;

        var vectors = [currentVector];

        while (points.length) {
            var closestPoint = getClosestPointOnVector(currentVector, points);

            if (closestPoint) {
                closestPoint.directionRight = closestPoint.isIntersection ? currentVector.directionDown : currentVector.directionUp;
                closestPoint.directionLeft = closestPoint.isIntersection ? currentVector.directionUp : currentVector.directionDown;
                closestPoint.directionUp = closestPoint.isIntersection ? currentVector.directionRight : currentVector.directionLeft;
                closestPoint.directionDown = closestPoint.isIntersection ? currentVector.directionLeft : currentVector.directionRight;

                currentVector = closestPoint;
                points.splice(points.indexOf(closestPoint), 1);
                vectors.push(currentVector);
            }
            else
                break;
        }

        var figure = ' M ' + vectors[0].left + ',' + vectors[0].top;

        for (var i = 1; i < vectors.length; i++) {
            if (vectors[i - 1].directionLeft || vectors[i - 1].directionRight)
                figure += ' H ' + vectors[i].left;
            else
                figure += ' V ' + vectors[i].top;
        }

        figure += ' z ';

        return figure;
    }

    //Pointers coordinates calculating
    function getPointerStart(rectangle, baseRectangle) {
        var left = null,
            top = null,
            isHorizontal = null,

            intersectionPoints = baseRectangle.getIntersectionPoints({
                start: baseRectangle.getCenter(),
                end: rectangle.getCenter()
            });

        if (intersectionPoints.length) {
            var startPoint = intersectionPoints[0];
            if (startPoint.isLeft || startPoint.isRight) {
                left = startPoint.left;
                top = Math.min(
                    Math.max(startPoint.top, baseRectangle.top + POINTER_START_WIDTH / 2),
                    baseRectangle.bottom - POINTER_START_WIDTH / 2);
            }
            else if (startPoint.isTop || startPoint.isBottom) {
                top = startPoint.top;
                left = Math.min(
                    Math.max(startPoint.left, baseRectangle.left + POINTER_START_WIDTH / 2),
                    baseRectangle.right - POINTER_START_WIDTH / 2);
                isHorizontal = true;
            }
        }

        return {
            left: left,
            top: top,
            isHorizontal: isHorizontal
        };
    }

    function getPointerEnd(rectangle, baseRectangle) {
        var left = null,
            top = null,

            intersectionPoints = rectangle.getIntersectionPoints({
                start: baseRectangle.getCenter(),
                end: rectangle.getCenter()
            });

        if (intersectionPoints.length) {
            var endPoint = intersectionPoints[0];

            left = endPoint.left;
            top = endPoint.top;

            if (endPoint.isLeft)
                left -= ELEMENT_FRAME_WIDTH / 2;
            else if (endPoint.isRight)
                left += ELEMENT_FRAME_WIDTH / 2;
            else if (endPoint.isTop)
                top -= ELEMENT_FRAME_WIDTH / 2;
            else if (endPoint.isBottom)
                top += ELEMENT_FRAME_WIDTH / 2;
        }

        return {
            left: left,
            top: top
        };
    }

    function getPointerCoordinates(rectangle, baseRectangle) {
        var pointerStart = getPointerStart(rectangle, baseRectangle),
            pointerEnd = getPointerEnd(rectangle, baseRectangle);

        return {
            pointerStart: pointerStart,
            pointerEnd: pointerEnd
        };
    }

    //Markup
    function createElementsMarker() {
        $elementsMarker = $('<div></div>').appendTo(ShadowUI.getRoot());
        ShadowUI.addClass($elementsMarker, ELEMENTS_MARKER_CLASS);
        return $elementsMarker;
    }

    //SVG generation
    function createSvgString(baseRectangle, elementsRectangles) {
        var pointersCoordinates = [];

        $.each(elementsRectangles, function (index, rectangle) {
            if (!baseRectangle.intersectsWith(rectangle)) {
                pointersCoordinates.push(getPointerCoordinates(rectangle, baseRectangle));
            }
        });

        var svgStrings = [SVG_OPEN_TAG];

        svgStrings.push(getBackgroundSvgString(elementsRectangles));
        svgStrings.push(getFrameShadowSvgString(baseRectangle, POINTERS_BASE_FRAME_SHADOW_CLASS));

        $.each(elementsRectangles, function (index) {
            svgStrings.push(getFrameShadowSvgString(elementsRectangles[index], ELEMENT_FRAME_SHADOW_CLASS));
        });

        svgStrings.push(getFrameSvgString(baseRectangle, POINTERS_BASE_FRAME_CLASS));

        $.each(elementsRectangles, function (index) {
            svgStrings.push(getFrameSvgString(elementsRectangles[index], ELEMENT_FRAME_CLASS));
        });

        $.each(pointersCoordinates, function (index) {
            svgStrings.push(getPointerSvgString(pointersCoordinates[index]));
        });

        svgStrings.push(SVG_CLOSE_TAG);

        return svgStrings.join('');
    }

    function getBackgroundSvgString(rectangles) {
        var standaloneRectangles = [],
            intersectionGroups = getIntersectingRectanglesGroups(rectangles);

        for (var i = 0; i < rectangles.length; i++) {
            var intersected = false;

            for (var j = 0; j < intersectionGroups.length; j++) {
                if ($.inArray(rectangles[i], intersectionGroups[j]) >= 0) {
                    intersected = true;
                    break;
                }
            }
            if (!intersected)
                standaloneRectangles.push(rectangles[i]);
        }

        var background = ['<path class="' + ShadowUI.patchClassNames(BACKGROUND_CLASS) + '" d="M 0,0 H ', Util.getDocumentElementWidth(), ' V ', Util.getDocumentElementHeight(), ' H 0 z '];

        $.each(standaloneRectangles, function (index, rectangle) {
            background.push(getRectangleBackgroundHoleSvgString(rectangle));
        });
        $.each(intersectionGroups, function (index, intersectedRectangles) {
            background.push(getIntersectedRectanglesBackgroundHole(intersectedRectangles));
        });

        background.push('"/>');

        return background.join('');
    }

    function getRectangleBackgroundHoleSvgString(rectangle) {
        return ' M ' + rectangle.left + ',' + rectangle.top + ' H ' + rectangle.right + ' V ' + rectangle.bottom + ' H ' + rectangle.left + ' z ';
    }

    function getFrameSvgString(rectangle, className) {
        var width = className === ELEMENT_FRAME_CLASS ? ELEMENT_FRAME_WIDTH : POINTERS_BASE_FRAME_WIDTH;

        return [
            '<rect class="' + ShadowUI.patchClassNames(className) + '" x="', rectangle.left, '" y="', rectangle.top, '" width="', rectangle.width, '" height="', rectangle.height, '"',
            'style="stroke-width:', width, ';"/>'
        ].join('');
    }

    function getFrameShadowSvgString(rectangle, className) {
        var frameLineWidth = className === ELEMENT_FRAME_SHADOW_CLASS ? ELEMENT_FRAME_WIDTH : POINTERS_BASE_FRAME_WIDTH;

        return [
            '<path class="' + ShadowUI.patchClassNames(className) + '" d="M', rectangle.left + rectangle.width, rectangle.top + SHADOW_OFFSET,
            'H', rectangle.left + rectangle.width + SHADOW_OFFSET,
            'V', rectangle.bottom + SHADOW_OFFSET,
            'H', rectangle.left + SHADOW_OFFSET,
            'V', rectangle.bottom, '"',
            'style="stroke-width:', frameLineWidth, ';"/>'
        ].join(' ');
    }

    function getPointerSvgString(pointerCoordinates) {
        return [
            '<path class="' + ShadowUI.patchClassNames(POINTER_CLASS) + '" d="M', pointerCoordinates.pointerStart.isHorizontal ? pointerCoordinates.pointerStart.left - POINTER_START_WIDTH / 2 : pointerCoordinates.pointerStart.left,
            pointerCoordinates.pointerStart.isHorizontal ? pointerCoordinates.pointerStart.top : pointerCoordinates.pointerStart.top - POINTER_START_WIDTH / 2,

            'L', pointerCoordinates.pointerStart.isHorizontal ? pointerCoordinates.pointerStart.left + POINTER_START_WIDTH / 2 : pointerCoordinates.pointerStart.left,
            pointerCoordinates.pointerStart.isHorizontal ? pointerCoordinates.pointerStart.top : pointerCoordinates.pointerStart.top + POINTER_START_WIDTH / 2,

            'L', pointerCoordinates.pointerEnd.left, pointerCoordinates.pointerEnd.top, 'Z', '" />'
        ].join(' ');
    }

    //Behavior
    function needUpdateMarking(baseRectangle, elementsRectangles) {
        if (forceUpdateMarking) {
            forceUpdateMarking = false;
            return true;
        }

        if (!savedBaseRectangle || !savedElementsRectangles || !baseRectangle.equals(savedBaseRectangle))
            return true;

        if (elementsRectangles.length !== savedElementsRectangles.length)
            return true;
        else {
            for (var i = 0; i < elementsRectangles.length; i++) {
                if (!elementsRectangles[i].equals(savedElementsRectangles[i]))
                    return true;
            }
        }
        return false;
    }

    function rectanglesCountChanged(elementsRectangles, correctedRectangles) {
        return savedElementsRectangles &&
            (elementsRectangles.length !== correctedRectangles.length || elementsRectangles.length !== savedElementsRectangles.length);
    }

    function deleteEmptyRectangles($elements, elementsRectangles) {
        var correctedRectangles = [];
        for (var i = 0; i < elementsRectangles.length; i++) {
            if (elementsRectangles[i].width > 1 && elementsRectangles[i].height > 1 && Util.isElementVisible($elements[i]))
                correctedRectangles.push(elementsRectangles[i]);
        }
        return correctedRectangles;
    }

    function updateRectanglesMarking($base, elementsRectangles, correctedRectangles) {
        var baseRectangle = getRectangle($base);

        if (!needUpdateMarking(baseRectangle, correctedRectangles))
            return;

        if (rectanglesCountChanged(elementsRectangles, correctedRectangles))
            eventEmitter.emit(exports.ELEMENT_RECTANGLES_COUNT_CHANGED, {});

        savedBaseRectangle = baseRectangle;
        savedElementsRectangles = correctedRectangles;

        var svgString = createSvgString(baseRectangle, correctedRectangles);

        var $newSvgElement = $(svgString).width(Util.getDocumentElementWidth())
            .height(Util.getDocumentElementHeight())
            .css('position', 'absolute');

        $elementsMarker.append($newSvgElement);
        removeSvgElement();
        $svgElement = $newSvgElement;
    }

    function updateElementsMarking($base, $elements) {
        var elementsRectangles = $.map($elements, function (element) {
                return getRectangle($(element), ELEMENT_FRAME_PADDING);
            }),
            correctedRectangles = deleteEmptyRectangles($elements, elementsRectangles);

        updateRectanglesMarking($base, elementsRectangles, correctedRectangles);
    }

    function svgBoundsChanged() {
        forceUpdateMarking = true;
    }

    function clearMarkupUpdateInterval() {
        if (elementsMarkerIntervalId) {
            window.clearInterval(elementsMarkerIntervalId);
            elementsMarkerIntervalId = null;
        }
    }

    function removeSvgElement() {
        if ($svgElement)
            $svgElement.remove();
    }

    //API
    function initMarking() {
        if (!$elementsMarker)
            createElementsMarker();

        eventEmitter = new Util.EventEmitter();
        clearMarkupUpdateInterval();
    }

    exports.mark = function ($pointersBase, $elements) {
        initMarking();

        updateElementsMarking($pointersBase, $elements);
        elementsMarkerIntervalId = window.setInterval(function () {
            updateElementsMarking($pointersBase, $elements);
        }, DRAWING_TIME_INTERVAL);

        $(window).on('resize', svgBoundsChanged);
        $(window).on('scroll', svgBoundsChanged);
    };

    exports.markInContext = function ($pointersBase, selector, context, parseDomElementsOrJqueryObjectsOnly) {
        initMarking();

        currentContext = context;
        $currentBase = $pointersBase;

        var msg = {
            cmd: GET_ELEMENT_RECTANGLES_REQUEST_CMD,
            selector: selector,
            parseDomElementsOrJqueryObjectsOnly: parseDomElementsOrJqueryObjectsOnly
        };

        MessageSandbox.sendServiceMsg(msg, context);

        elementsMarkerIntervalId = window.setInterval(function () {
            MessageSandbox.sendServiceMsg(msg, context);
        }, DRAWING_TIME_INTERVAL);
    };

    exports.clear = function () {
        currentContext = null;
        $currentBase = null;

        clearMarkupUpdateInterval();
        removeSvgElement();
        savedBaseRectangle = null;
        savedElementsRectangles = null;

        $(window).unbind('resize', svgBoundsChanged);
        $(window).unbind('scroll', svgBoundsChanged);
    };

    exports.events = {
        on: function (ev, listener) {
            eventEmitter.on(ev, listener);
        }
    };

    //Cross-domain behavior
    var GET_ELEMENT_RECTANGLES_REQUEST_CMD = 'getElementRectanglesRequest',
        GET_ELEMENT_RECTANGLES_RESPONSE_CMD = 'getElementRectanglesResponse';

    var currentContext = null,
        $currentBase = null;

    MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, function (e) {
        var msg = e.message;

        switch (msg.cmd) {
            case GET_ELEMENT_RECTANGLES_REQUEST_CMD:
                var $elements = JavascriptExecutor.parseSelectorSync(msg.selector, msg.parseDomElementsOrJqueryObjectsOnly).$visibleElements,
                    elementRectangles = $.map($elements, function (element) {
                        var rect = getRectangle($(element), ELEMENT_FRAME_PADDING),
                            clientCoords = Util.offsetToClientCoords({
                                x: rect.left,
                                y: rect.top
                            });

                        rect.left = clientCoords.x;
                        rect.top = clientCoords.y;

                        return rect;
                    }),
                    correctedRectangles = deleteEmptyRectangles($elements, elementRectangles),

                    responseMsg = {
                        cmd: GET_ELEMENT_RECTANGLES_RESPONSE_CMD,
                        elementRectangles: elementRectangles,
                        correctedRectangles: correctedRectangles
                    };

                MessageSandbox.sendServiceMsg(responseMsg, window.top);
                break;

            case GET_ELEMENT_RECTANGLES_RESPONSE_CMD:
                if (currentContext === e.source) {
                    updateRectanglesMarking($currentBase,
                        $.map(msg.elementRectangles, function (rect) {
                            var fixedPoint = Util.getFixedPosition({
                                x: rect.left,
                                y: rect.top
                            }, e.source);

                            return new Rectangle(fixedPoint.x, fixedPoint.y, rect.width, rect.height);
                        }),
                        $.map(msg.correctedRectangles, function (rect) {
                            var fixedPoint = Util.getFixedPosition({
                                x: rect.left,
                                y: rect.top
                            }, e.source);

                            return new Rectangle(fixedPoint.x, fixedPoint.y, rect.width, rect.height);
                        }));
                }


                break;
        }
    });
});
TestCafeClient.define('Recorder.IFrameContextLabel', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        ShadowUI = Hammerhead.ShadowUI;

    var CLOSE_BUTTON_CLASS = 'remove-icon',
        LABEL_CLASS = 'context-label',

        LABEL = 'IFrame: ';

    exports.create = function ($container, selector, onDeleted, showRemoveButton) {
        var $label = $('<label></label>').text(LABEL + selector).appendTo($container),
            $closeButton = showRemoveButton ? $('<div></div>').appendTo($container) : null;

        ShadowUI.addClass($label, LABEL_CLASS);

        if ($closeButton) {
            ShadowUI.addClass($closeButton, CLOSE_BUTTON_CLASS);

            $closeButton.click(function () {
                $container.remove();

                if (typeof onDeleted === 'function')
                    onDeleted();
            });
        }
    };
});
TestCafeClient.define('UI.RecorderWidgets.ObjectViewer', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        MessageSandbox = Hammerhead.MessageSandbox,
        JavascriptExecutor = require('Base.JavascriptExecutor'),
        IFrameMessages = require('Base.CrossDomainMessages'),


        ARGUMENT_VALUE_CONTAINER_CLASS = 'container',
        ARGUMENT_VALUE_SPAN_CLASS = 'argument-value-span',
        ARGUMENT_VALUE_DIV_CLASS = 'argument-value-div',
        EMBEDDED_IN_OBJECT_CLASS = 'embedded-in-object',
        OBJECT_TITLE_CLASS = 'title';

    //Util
    function isInstanceOf(className, target) {
        var targetClass = Object.prototype.toString.call(target).slice(8, -1);

        return typeof(target) !== 'undefined' && target !== null && targetClass === className;
    }

    function createRow(str, title) {
        return {
            str: str,
            title: title || ''
        };
    }

    function getArrayRows(array, stringValue, context) {
        var rows = [createRow('[')],
            itemView = null;

        $.each(array, function (i) {
            itemView = getObjectViewSync(stringValue + '[' + i + ']', context);

            if (itemView.type === 'Object')
                itemView.rows[0].str = itemView.rows[0].str.substring(0, itemView.rows[0].str.length - 1);

            rows.push(itemView.type === 'String' ? itemView.rows[0] : itemView);

            if (i !== array.length - 1)
                rows.push(createRow(', '));
        });

        rows.push(createRow(']'));

        return rows;
    }

    function getObjectWithSortedProperties(object) {
        var objectArray = [];

        for (var prop in object) {
            //NOTED: properties 'fileCreatedDate', 'fileModifiedDate' and 'external' raise errors in IE
            if (prop !== 'fileCreatedDate' && prop !== 'fileModifiedDate') {
                if (Util.isIE && prop === 'external')
                    objectArray.push([prop, 'Object {}']);
                else
                    objectArray.push([prop, object[prop]]);
            }
        }

        objectArray.sort();

        var sortedObject = {};
        $.each(objectArray, function (i, prop) {
            sortedObject[prop[0]] = prop[1];
        });

        return sortedObject;
    }

    function getObjectRows(object, className) {
        var objectString = className || 'Object';
        objectString += (Object.getOwnPropertyNames(object).length ? ' {...} ' : ' {} ');

        return [createRow(objectString)];
    }

    function getDomElementString(element) {
        var tagName = element.tagName.toLowerCase();

        return '<' + tagName + '> ... </' + tagName + '>';
    }

    function getDomElementTitle(element) {
        return element.outerHTML.replace(element.innerHTML, '');
    }

    function createSpan($container, text, title) {
        var $span = $('<span></span>').text(text).appendTo($container);
        ShadowUI.addClass($span, ARGUMENT_VALUE_SPAN_CLASS);

        if (title)
            $span.attr('title', title);

        return $span;
    }

    function createArrayMarkup($container, objectView, embedded, context) {
        var $array = embedded ? createDiv($container, '') : createSpan($container, '');

        $.each(objectView.rows, function (i, row) {
            if (row.type) {
                if (row.type === 'Array')
                    createArrayMarkup($array, row, false, context);
                else
                    createObjectMarkup($array, row, false, context);
            }
            else
                createSpan($array, row.str, row.title);
        });

        return $array;
    }

    function createObjectMarkup($container, objectView, embedded, context) {
        var $object = embedded ? createDiv($container, '') : createSpan($container, ''),
            $objectTitle = createDiv($object, objectView.rows[0].str);

        ShadowUI.addClass($objectTitle, OBJECT_TITLE_CLASS);

        initObject($object, objectView.stringValue, objectView.getInheritedProperties, context);

        return $object;
    }

    function initObject($object, stringValue, getInheritedProperties, context) {
        var $objectTitle = ShadowUI.select('.' + OBJECT_TITLE_CLASS, $object),
            titleText = $objectTitle.text();

        ShadowUI.bind($objectTitle, 'click', function () {
            if ($.data($object, 'state') !== 'opened') {
                ObjectViewer.getObjectPropertiesRows(stringValue, getInheritedProperties, context, function (rows) {
                    if (rows.length) {
                        $objectTitle.text(titleText.substring(0, titleText.indexOf('{') + 1) + '    ');

                        if (titleText.indexOf(',') !== -1)
                            rows[rows.length - 1].str += ',';

                        createObjectPropertiesMarkup($object, rows, context);

                        $.data($object, 'state', 'opened');
                    }
                });
            }
            else {
                var $children = $object.children('span, div'),
                    $lastChild = $children.last(),
                    $lastChildText = $lastChild.text();

                $objectTitle.text(titleText.substring(0, titleText.indexOf('{') + 1) + '...}' +
                    ($lastChildText.indexOf(',') !== -1 ? ', ' : ''));

                $.each($children, function (i, child) {
                    if (child !== $objectTitle[0])
                        $(child).remove();
                });

                $.data($object, 'state', 'closed');
            }
        });
    }

    function createObjectPropertiesMarkup($object, rows, context) {
        var $property = null;

        $.each(rows, function (i, stringObj) {
            if (stringObj.type) {
                if (stringObj.type === 'Array')
                    $property = createArrayMarkup($object, stringObj, true, context);
                else {
                    $property = createObjectMarkup($object, stringObj, true, context);
                    ShadowUI.addClass($property, EMBEDDED_IN_OBJECT_CLASS);
                }

                addIndentToElement($property);
            }
            else {
                $property = createDiv($object, stringObj.str, stringObj.title);

                if (i !== rows.length - 1)
                    addIndentToElement($property);
            }
        });
    }

    function createDiv($container, string, title) {
        var $div = $('<div></div>').text(string).appendTo($container);
        ShadowUI.addClass($div, ARGUMENT_VALUE_DIV_CLASS);

        if (title)
            $div.attr('title', title);

        return $div;
    }

    function addIndentToElement($el) {
        $el.css({
            position: 'relative',
            left: '25px'
        });
    }

    //cross-domain functions
    function getObjectViewSync(stringValue, context) {
        var view = {
                rows: [],
                type: '',
                stringValue: stringValue,
                parsedValue: null,
                getInheritedProperties: false,
                error: null,
                isReproducibleValue: false
            },
            row = createRow('');

        view.parsedValue = JavascriptExecutor.eval(stringValue, function (err) {
            view.error = err.message;
        });

        //cross-domain access error protection (for example 'window.top' stringValue in iFrame context in webkit)
        if (!view.error && view.parsedValue)
            try {
                void view.parsedValue.constructor;
            }
            catch (e) {
                view.error = e.message;
            }

        if (view.error)
            return view;

        view.isReproducibleValue = isReproducibleValue(view.parsedValue);

        if (isInstanceOf('Array', view.parsedValue) || Util.isJQueryObj(view.parsedValue)) {
            view.type = 'Array';
            view.rows = getArrayRows(view.parsedValue, stringValue, context);
        }

        else if (Util.isDocumentInstance(view.parsedValue) || Util.isWindowInstance(view.parsedValue)) {
            var sortedObject = getObjectWithSortedProperties(view.parsedValue);
            view.type = 'Object';

            view.getInheritedProperties = true;
            view.rows = getObjectRows(sortedObject, view.parsedValue.constructor ? view.parsedValue.constructor.name : 'Object');
        }

        else if (isInstanceOf('Object', view.parsedValue)) {
            view.type = 'Object';
            view.rows = getObjectRows(view.parsedValue, view.parsedValue.constructor ? view.parsedValue.constructor.name : 'Object');
        }
        else {
            view.type = 'String';

            if (view.parsedValue === null)
                row.str = 'null';
            else if (typeof view.parsedValue === 'undefined')
                row.str = 'undefined';
            else if (Util.isDomElement(view.parsedValue)) {
                row.str = getDomElementString(view.parsedValue);
                row.title = getDomElementTitle(view.parsedValue);
            }

            else if (isInstanceOf('String', view.parsedValue)) {
                var result = view.parsedValue.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\xA0/g, '\\xA0');

                if (result.indexOf('"') < 0)
                    result = '"' + result + '"';
                else if (result.indexOf("'") < 0)
                    result = "'" + result + "'";
                else
                    result = '"' + result.replace(/"/g, '\\"') + '"';

                row.str = result;
            }
            else
                row.str = view.parsedValue.toString();

            view.rows.push(row);
        }

        return view;
    }

    function getObjectPropertiesRowsSync(stringValue, getInheritedProperties) {
        var rows = [],
            propView = null,
            propertyPrefix = null,
            object = getObjectWithSortedProperties(JavascriptExecutor.eval(stringValue));

        if (Object.getOwnPropertyNames(object).length === 0)
            return rows;

        for (var item in object) {
            if (object.hasOwnProperty(item) || getInheritedProperties) {
                propertyPrefix = item + ': ';
                propView = getObjectViewSync(stringValue + '["' + item + '"]');

                if (propView.type === 'String') {
                    if (isInstanceOf('Function', object[item])) {
                        var functionStr = propView.rows[0].str;

                        functionStr = propertyPrefix + functionStr.substring(0, functionStr.indexOf('{') + 1) + ' ... ,';
                        rows.push(createRow(functionStr));
                    }
                    else
                        rows.push(createRow(propertyPrefix + propView.rows[0].str + ',', propView.rows[0].title));
                }
                else {
                    if (propView.type === 'Object')
                        propView.rows[0].str = propertyPrefix + propView.rows[0].str.substring(0, propView.rows[0].str.length - 1) + ', ';
                    else {
                        propView.rows[0].str = propertyPrefix + propView.rows[0].str;
                        propView.rows[propView.rows.length - 1].str += ', ';
                    }

                    rows.push(propView);
                }
            }
        }

        var lastIndex = rows.length - 1;

        if (rows[lastIndex].type) {
            if (rows[lastIndex].type === 'Object')
                rows[lastIndex].rows[0].str = rows[lastIndex].rows[0].str.substring(0, rows[lastIndex].rows[0].str.length - 2);
            else {
                var lastStringNum = rows[lastIndex].rows.length - 1,
                    lastString = rows[lastIndex].rows[lastStringNum].str;

                rows[lastIndex].rows[lastStringNum].str = lastString.substring(0, lastString.length - 2);
            }
        }
        else
            rows[lastIndex].str = rows[lastIndex].str.substring(0, rows[lastIndex].str.length - 1);


        rows.push(createRow('}'));

        return rows;
    }

    //reproducible value - the value for which you can easily create an equal value
    function isReproducibleValue(value) {
        return isPrimitiveValue(value) || isArrayOfReproducibleValues(value);
    }

    function isPrimitiveValue(value) {
        return /^(string|number|boolean|undefined)$/.test(typeof value);
    }

    function isArrayOfReproducibleValues(value) {
        if ($.isArray(value)) {
            for (var i = 0; i < value.length; i++)
                if (!isReproducibleValue(value[i]))
                    return false;
            return true;
        }
        else
            return false;
    }

    //ObjectViewer
    var ObjectViewer = this.exports = function ($container) {
        this.$viewer = $('<div></div>').appendTo($container);
        ShadowUI.addClass(this.$viewer, ARGUMENT_VALUE_CONTAINER_CLASS);

        this._init();
    };

    ObjectViewer.prototype._init = function () {
        ShadowUI.bind(this.$viewer, typeof document.onwheel !== 'undefined' ? 'wheel' : 'mousewheel', function (e) {
            var delta = e.wheelDelta || (e.originalEvent ? (-e.originalEvent.deltaY * 8) : -e.deltaY * 100),
                top = parseInt($(this).css('top').replace('px', '')),
                sizeDifference = this.scrollHeight - this.clientHeight,
                newTop = Math.max(Math.min(top + delta, 0), -sizeDifference);

            $(this).css('top', newTop + 'px');
            Util.preventDefault(e);

            return false;
        });
    };

    ObjectViewer.getObjectView = function (stringValue, context, callback) {
        function onMessage(e) {
            if (e.message.cmd === IFrameMessages.OBJECT_VIEWER_GET_OBJECT_VIEW_RESPONSE_CMD && e.message.stringValue === stringValue) {
                callback(e.message.objectView);
                MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
            }
        }

        if (context) {
            var msg = {
                cmd: IFrameMessages.OBJECT_VIEWER_GET_OBJECT_VIEW_REQUEST_CMD,
                stringValue: stringValue
            };

            MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
            MessageSandbox.sendServiceMsg(msg, context);
        }
        else
            callback(getObjectViewSync(stringValue, context));
    };

    ObjectViewer.getObjectPropertiesRows = function (stringValue, getInheritedProperties, context, callback) {
        function onMessage(e) {
            if (e.message.cmd === IFrameMessages.OBJECT_VIEWER_GET_OBJECT_PROPERTIES_ROWS_RESPONSE_CMD && e.message.stringValue === stringValue) {
                callback(e.message.rows);
                MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
            }
        }

        if (context) {
            var msg = {
                cmd: IFrameMessages.OBJECT_VIEWER_GET_OBJECT_PROPERTIES_ROWS_REQUEST_CMD,
                getInheritedProperties: getInheritedProperties,
                stringValue: stringValue
            };

            MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
            MessageSandbox.sendServiceMsg(msg, context);
        }
        else
            callback(getObjectPropertiesRowsSync(stringValue, getInheritedProperties));
    };

    ObjectViewer.prototype.show = function (stringValue, context, callback) {
        var viewer = this;

        ObjectViewer.getObjectView(stringValue, context, function (objectView) {
            viewer.$viewer[0].innerHTML = '';
            viewer.$viewer.css('top', 0);

            if (!objectView.error) {
                if (objectView.type === 'String')
                    createSpan(viewer.$viewer, objectView.rows[0].str, objectView.rows[0].title);

                else if (objectView.type === 'Array')
                    createArrayMarkup(viewer.$viewer, objectView, false, context);

                else if (objectView.type === 'Object')
                    createObjectMarkup(viewer.$viewer, objectView, false, context);
            }

            callback(objectView);
        });
    };

    ObjectViewer.prototype.clear = function () {
        this.$viewer[0].innerHTML = '';
        this.$viewer.css('top', 0);
    };

    ObjectViewer.prototype.getText = function () {
        return this.$viewer.text();
    };
});
TestCafeClient.define('UI.RecorderWidgets.PlaybackErrorMessages', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        ShadowUI = Hammerhead.ShadowUI,
        Util = Hammerhead.Util,
        PageState = Hammerhead.PageState,
        PopupWidget = require('UI.RecorderWidgets.Popup'),
        ButtonWidget = require('UI.RecorderWidgets.Button');

    var PLAYBACK_RESULT_CLASS = 'playback-result',
        ERROR_CLASS = 'error',
        ERROR_MESSAGE_CLASS = 'error-message',
        BUTTON_CONTAINER_CLASS = 'button-container',
        BUTTON_TEXT = 'Resume playback';

    var MAX_VISIBLE_ERRORS = 5;

    var popup = null,
        pageState = null;

    exports.show = function (errors, callback) {
        if (popup)
            close();

        pageState = PageState.saveState();

        var onClosed = callback,
            $container = $('<div></div>');

        ShadowUI.addClass($container, PLAYBACK_RESULT_CLASS);
        ShadowUI.addClass($container, ERROR_CLASS);

        createText($container);
        createErrors($container, errors);
        createButton($container, onClosed);

        popup = new PopupWidget(ShadowUI.getRoot(), {
            width: 530,
            content: $container,
            showAtWindowCenter: true,
            defaultStyle: false
        });

        popup.onkeydown(function (e) {
            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.enter) {
                close(onClosed);
                Util.preventDefault(e);
            }
        }, true, true);
    };

    function createText($container) {
        var $text = $('<div></div>').text('The following unhandled JavaScript errors occurred within the page: ').appendTo($container);

        ShadowUI.addClass($text, ERROR_MESSAGE_CLASS);
    }

    function createErrors($container, errors) {
        var $list = $('<ul></ul>').appendTo($container);

        for (var i = 0; i < errors.length; i++) {
            if (i < MAX_VISIBLE_ERRORS)
                $('<li></li>').text(errors[i]).appendTo($list);
            else {
                $('<li></li>').text('...').appendTo($list);
                break;
            }
        }
    }

    function close(onClosed) {
        popup.close();
        popup = null;

        PageState.restoreState(pageState, true, function () {
            if (typeof onClosed === 'function')
                onClosed();
        });
    }

    function createButton($container, onClosed) {
        var $buttonContainer = $('<div></div>').appendTo($container);
        ShadowUI.addClass($buttonContainer, BUTTON_CONTAINER_CLASS);

        ButtonWidget.create($buttonContainer, BUTTON_TEXT).click(function () {
            close(onClosed);
        });
    }
});
TestCafeClient.define('UI.RecorderWidgets.PlaybackResult', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        ShadowUI = Hammerhead.ShadowUI,
        Util = Hammerhead.Util,
        PageState = Hammerhead.PageState,
        PopupWidget = require('UI.RecorderWidgets.Popup'),
        ButtonWidget = require('UI.RecorderWidgets.Button');

    var PLAYBACK_RESULT_CLASS = 'playback-result',
        SUCCESS_CLASS = 'success',
        FAILED_CLASS = 'failed',
        HEADER_CLASS = 'header',
        SEPARATOR_CLASS = 'separator',
        COUNT_CLASS = 'count',
        TEXT_CLASS = 'text',
        TOP_TEXT_CLASS = 'top',
        ERROR_TEXT_CLASS = 'error-text',

        HEADER_TEXT_COMPLETED = 'Test completed',
        HEADER_TEXT_FAILED = 'Test failed',
        PLAYBACK_SUCCESS_TEXT = 'steps played successfully',
        PLAYBACK_FAILED_TEXT = 'steps failed',
        STEP_FAILED_TEXT = 'failed with an error:',
        BUTTON_TEXT = 'Return to recording';

    var popup = null,
        pageState = null;

    exports.STATES = {
        FINISHED: 'finished',
        FAILED: 'failed'
    };

    exports.show = function (state, options) {
        var total = options.total,
            failed = options.failed,
            onClosed = options.onClosed,
            failedStepNum = options.failedStepNum,
            error = options.error;

        if (popup)
            close();

        pageState = PageState.saveState();

        var $container = $('<div></div>');

        ShadowUI.addClass($container, PLAYBACK_RESULT_CLASS);
        ShadowUI.addClass($container, (failed || failedStepNum) ? FAILED_CLASS : SUCCESS_CLASS);

        createHeader($container, state);
        createSeparator($container);

        if (state === exports.STATES.FINISHED)
            createCount($container, total, failedStepNum || failed, state);

        createTextBlock($container, state, failedStepNum || failed, state === exports.STATES.FAILED ? TOP_TEXT_CLASS : null);

        if (error)
            createError($container, error);

        createSeparator($container);
        createButton($container, onClosed);

        popup = new PopupWidget(ShadowUI.getRoot(), {
            width: 530,
            content: $container,
            showAtWindowCenter: true,
            defaultStyle: false
        });

        popup.onkeydown(function (e) {
            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.enter) {
                close(onClosed);
                Util.preventDefault(e);
            }
        }, true, true);
    };

    function createHeader($container, state) {
        var $header = $('<div></div>').text(state === exports.STATES.FINISHED ? HEADER_TEXT_COMPLETED : HEADER_TEXT_FAILED).appendTo($container);

        ShadowUI.addClass($header, HEADER_CLASS);
    }

    function createSeparator($container) {
        var $separator = $('<div></div>').appendTo($container);

        ShadowUI.addClass($separator, SEPARATOR_CLASS);
    }

    function createCount($container, total, failed, state) {
        var $count = $('<div></div>').appendTo($container);

        ShadowUI.addClass($count, COUNT_CLASS);

        if (state === exports.STATES.FINISHED)
            $count.text(failed ? failed + '/' + total : total);
        else
            $count.text(failed);
    }

    function createTextBlock($container, state, failed, className) {
        if (state === exports.STATES.FINISHED)
            createText($container, failed ? PLAYBACK_FAILED_TEXT : PLAYBACK_SUCCESS_TEXT, className);
        else
            createText($container, 'Step ' + failed + ' ' + STEP_FAILED_TEXT, className);
    }

    function createText($container, text, className) {
        var $message = $('<div></div>').appendTo($container);
        ShadowUI.addClass($message, TEXT_CLASS);

        if (className)
            ShadowUI.addClass($message, className);

        $message.text(text);
    }

    function createError($container, error) {
        var $errorMessage = $('<div></div>').appendTo($container);
        ShadowUI.addClass($errorMessage, ERROR_TEXT_CLASS);

        $errorMessage.text(error);
    }

    function close(onClosed) {
        popup.close();
        popup = null;

        PageState.restoreState(pageState, true, function () {
            if (typeof onClosed === 'function')
                onClosed();
        });
    }

    function createButton($container, onClosed) {
        ButtonWidget.create($container, BUTTON_TEXT).click(function () {
            close(onClosed);
        });
    }
});
TestCafeClient.define('UI.RecorderWidgets.Popup', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        NativeMethods = Hammerhead.NativeMethods,
        ShadowUI = Hammerhead.ShadowUI,
        EventSandbox = Hammerhead.EventSandbox,
        PageState = Hammerhead.PageState,
        TextSelection = Hammerhead.TextSelection,
        DraggingBehavior = require('UI.DraggingBehavior');

    //Const
    var POPUP_CLASS = 'popup',
        HEADER_CLASS = 'header',
        CONTENT_CLASS = 'content',
        FOOTER_CLASS = 'footer',
        BLIND_CLASS = 'blind',
        DEFAULT_STYLE_CLASS = 'default',
        NO_BORDERS_CLASS = 'no-borders',
        NO_TOP_MARGIN_CLASS = 'no-top-margin',

        SEPARATOR_CLASS = 'separator',
        TITLE_CLASS = 'title',
        CLOSE_BUTTON_CLASS = 'close-button',
        HIDE_ICON_CLASS = 'hide-icon',
        OPACITY_CLASS = 'opacity';

    //Globals
    var windowResizeHandler = null;

    var Popup = this.exports = function ($container, options) {
        var popup = this;

        options = options || {};

        this.options = {
            width: options.width || '',
            headerText: options.headerText || '',
            headerIconText: options.headerIconText || '',
            headerIconClass: options.headerIconClass || '',
            headerCloseButton: options.headerCloseButton || false,
            headerHideIcon: options.headerHideIcon || false,
            headerTextSize: options.headerTextSize || '',
            content: options.content,
            footerContent: options.footerContent || null,
            backgroundOpacity: options.backgroundOpacity || false,
            showAtWindowCenter: options.showAtWindowCenter || false,
            notDialog: options.notDialog || false,
            prevActiveElement: options.prevActiveElement || Util.getActiveElement(),
            restoreActiveElement: typeof options.restoreActiveElement === 'undefined' ? true : options.restoreActiveElement,
            defaultStyle: typeof options.defaultStyle === 'undefined' ? true : options.defaultStyle,
            noBordersStyle: options.noBordersStyle || false,
            prependToContainer: options.prependToContainer || false,
            footerWithoutTopMargins: options.footerWithoutTopMargins || false,
            hasParentPopup: options.hasParentPopup || false
        };

        this.$popup = null;
        this.$header = null;
        this.$headerTitle = null;
        this.$content = null;
        this.$footer = null;

        this.$closeButton = null;
        this.$hideIcon = null;

        this.selectionState = null;

        this.$focusableElement = null;
        this.popupBlurHandler = null;

        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            popup.eventEmitter.on(ev, listener);
        };

        this._createPopup($container);
        this._init();
    };

    //Events
    Popup.CLOSE_BUTTON_CLICK_EVENT = 'closeButtonClick';
    Popup.HIDE_BUTTON_CLICK_EVENT = 'hideButtonClick';
    Popup.DRAG_STARTED_EVENT = 'dragStarted';
    Popup.MOVED_EVENT = 'moved';

    //Utils
    Popup.prototype._getPopupRelativePosition = function ($baseElement) {
        var MIN_WINDOW_PADDING = 10,
            MARGIN = 50,
            VERTICAL_POSITION_PREFERENCE = 500;

        var $window = $(window),
            windowHeight = $window.height(),
            windowWidth = $window.width(),
            scrollTop = $window.scrollTop(),
            scrollLeft = $window.scrollLeft(),

            baseRectangle = Util.getElementRectangle($baseElement[0]),

            baseClientLeft = Math.max(baseRectangle.left - scrollLeft, 0),
            baseClientRight = Math.min(baseRectangle.left + baseRectangle.width - scrollLeft, windowWidth),
            baseClientWidth = baseClientRight - baseClientLeft,
            baseClientCenterX = Math.floor(baseClientWidth / 2 + baseClientLeft),

            baseClientTop = Math.max(baseRectangle.top - scrollTop, 0),
            baseClientBottom = Math.min(baseRectangle.top + baseRectangle.height - scrollTop, windowHeight),
            baseClientHeight = baseClientBottom - baseClientTop,
            baseClientCenterY = Math.floor(baseClientHeight / 2 + baseClientTop),

            popupWidth = this.$popup.width(),
            popupHeight = this.$popup.height(),
            top = 0,
            left = 0,

            verticalPosition = '',
            verticalSpace = 0,
            horizontalPosition = '',
            horizontalSpace = 0;


        var topSpace = baseClientTop,
            bottomSpace = windowHeight - baseClientTop - baseClientHeight;
        if (topSpace - bottomSpace >= 0) {
            if (topSpace >= popupHeight + MIN_WINDOW_PADDING)
                verticalPosition = 'top';
            verticalSpace = topSpace;
        }
        else {
            if (bottomSpace >= popupHeight + MIN_WINDOW_PADDING)
                verticalPosition = 'bottom';
            verticalSpace = bottomSpace;
        }

        var leftSpace = baseClientLeft,
            rightSpace = windowWidth - baseClientLeft - baseClientWidth;
        if (leftSpace - rightSpace >= 0) {
            if (leftSpace >= popupWidth + MIN_WINDOW_PADDING)
                horizontalPosition = 'left';
            horizontalSpace = leftSpace;
        }
        else {
            if (rightSpace >= popupWidth + MIN_WINDOW_PADDING)
                horizontalPosition = 'right';
            horizontalSpace = rightSpace;
        }

        if (verticalPosition && !(horizontalPosition && (horizontalSpace - verticalSpace > VERTICAL_POSITION_PREFERENCE))) {
            top = verticalPosition === 'top' ?
                Math.max(baseClientTop - MARGIN - popupHeight, MIN_WINDOW_PADDING) :
                Math.min(baseClientTop + baseClientHeight + MARGIN, windowHeight - popupHeight - MIN_WINDOW_PADDING);
            left = Math.floor((windowWidth - popupWidth) * (baseClientCenterX / windowWidth));
        }
        else if (horizontalPosition) {
            left = horizontalPosition === 'left' ?
                Math.max(baseClientLeft - MARGIN - popupWidth, MIN_WINDOW_PADDING) :
                Math.min(baseClientLeft + baseClientWidth + MARGIN, windowWidth - popupWidth - MIN_WINDOW_PADDING);
            top = Math.floor((windowHeight - popupHeight) * (baseClientCenterY / windowHeight));
        }
        else {
            left = Math.floor((windowWidth - popupWidth) * (baseClientCenterX / windowWidth));
            top = Math.floor((windowHeight - popupHeight) * (baseClientCenterY / windowHeight));
        }

        return {
            left: left,
            top: top
        };
    };

    //Markup
    Popup.prototype._createPopup = function ($container) {
        var popup = this,
            popupOpened = this.options.hasParentPopup || !!(ShadowUI.select('.' + POPUP_CLASS).length);

        this.$popup = $('<div></div>')
            .width(this.options.width)
            .attr('tabindex', 1);

        if (this.options.prependToContainer)
            this.$popup.prependTo($container);
        else
            this.$popup.appendTo($container);

        ShadowUI.addClass(this.$popup, POPUP_CLASS);

        if (this.options.noBordersStyle)
            ShadowUI.addClass(this.$popup, NO_BORDERS_CLASS);

        if (this.options.defaultStyle)
            ShadowUI.addClass(this.$popup, DEFAULT_STYLE_CLASS);

        if (!this.options.notDialog) {
            if (!popupOpened)
                this.selectionState = PageState.saveState();

            //B238660 - Wrong behavior of selection in editable elements (during the show recorder's dialogs) in IE
            if (Util.isIE && Util.isTextEditableElement(popup.options.prevActiveElement))
                TextSelection.select(popup.options.prevActiveElement, 0, 0);

            EventSandbox.disableOuterFocusHandlers();
            this._bindPopupBlurHandler(this.$popup);
        }

        if (this.options.headerIconText || this.options.headerText || this.options.headerIconClass)
            this._createHeader();
        this._createContent();

        if (this.options.footerContent)
            this._createFooter();

        if (this.options.showAtWindowCenter)
            this._disposeRelativeToWindowCenter();
    };

    Popup.prototype._createHeader = function () {
        var popup = this,
            $number = null,
            headerElementsWidth = 0;

        this.$header = $('<div></div>').appendTo(this.$popup);
        ShadowUI.addClass(this.$header, HEADER_CLASS);

        if (this.options.headerIconClass) {
            $number = $('<div></div>').appendTo(this.$header);

            if (this.options.headerIconText)
                $number.text(this.options.headerIconText);

            ShadowUI.addClass($number, this.options.headerIconClass);
            headerElementsWidth += $number.width();

            if (this.options.headerTextSize)
                this.$headerTitle.css('fontSize', this.options.headerTextSize);

            var $separator = $('<div></div>').appendTo(this.$header);
            ShadowUI.addClass($separator, SEPARATOR_CLASS);
            headerElementsWidth += $separator.width();
        }

        this.$headerTitle = $('<div></div>').appendTo(this.$header);
        ShadowUI.addClass(this.$headerTitle, TITLE_CLASS);

        if ($.browser.webkit || $.browser.opera) {
            if ($number)
                $number.css('marginTop', '-1px');
            this.$headerTitle.css('marginTop', '-1px');
        }

        if (this.options.headerTextSize)
            this.$headerTitle.css('fontSize', this.options.headerTextSize);

        if (this.options.headerCloseButton) {
            this.$closeButton = $('<div></div>').appendTo(this.$header);
            ShadowUI.addClass(this.$closeButton, CLOSE_BUTTON_CLASS);
            headerElementsWidth += this.$closeButton.width();
        }

        if (this.options.headerHideIcon) {
            this.$hideIcon = $('<div></div>').appendTo(this.$header);
            ShadowUI.addClass(this.$hideIcon, HIDE_ICON_CLASS);
            headerElementsWidth += this.$hideIcon.width();
        }

        //NOTE: set max width for header title
        window.setTimeout(function () {
            var popupPadding = Util.getElementPadding(popup.$popup),
                titlePadding = Util.getElementPadding(popup.$headerTitle),
                titleWidth = popup.$popup.width() - (popupPadding.left + popupPadding.right) -
                    headerElementsWidth - (titlePadding.left + titlePadding.right);

            popup.$headerTitle.css('max-width', titleWidth);
            popup.setHeaderText(popup.options.headerText);
        }, 0);
    };

    Popup.prototype._createContent = function () {
        this.$content = $('<div></div>').appendTo(this.$popup);
        ShadowUI.addClass(this.$content, CONTENT_CLASS);

        if (this.options.backgroundOpacity)
            ShadowUI.addClass(this.$content, OPACITY_CLASS);

        if (this.options.content)
            $(this.options.content).appendTo(this.$content);
    };

    Popup.prototype._createFooter = function () {
        this.$footer = $('<div></div>').appendTo(this.$content);
        ShadowUI.addClass(this.$footer, FOOTER_CLASS);

        if (this.options.footerWithoutTopMargins)
            ShadowUI.addClass(this.$footer, NO_TOP_MARGIN_CLASS);

        $(this.options.footerContent).appendTo(this.$footer);
    };

    //Behavior
    Popup.prototype._onResizeHandler = function () {
        if (this.options.showAtWindowCenter)
            this._disposeRelativeToWindowCenter();

        if (this.positionElement && Util.isElementVisible(this.positionElement)) {
            var popupPosition = Util.getOffsetPosition(this.$popup[0]);
            if (popupPosition.left >= 0 && popupPosition.top >= 0)
                this.disposeRelativeToElement($(this.positionElement));
        }
    };

    Popup.prototype._init = function () {
        var popup = this;

        if (this.$closeButton)
            this.$closeButton.click(function () {
                popup.close();
                popup.eventEmitter.emit(Popup.CLOSE_BUTTON_CLICK_EVENT, {});
            });
        if (this.$hideIcon)
            this.$hideIcon.click(function () {
                popup.eventEmitter.emit(Popup.HIDE_BUTTON_CLICK_EVENT, {});
            });
        if (this.$header) {
            new DraggingBehavior(this.$header, this.$popup, {
                onDragStart: function () {
                    popup.eventEmitter.emit(Popup.DRAG_STARTED_EVENT, {});
                },
                onMove: function () {
                    popup.eventEmitter.emit(Popup.MOVED_EVENT, {});
                }
            });
        }

        windowResizeHandler = function () {
            popup._onResizeHandler();
        };

        ShadowUI.bind($(window), 'resize', windowResizeHandler);

        //NOTE: we can use the popup widget without EventSandbox initializing
        if (typeof EventSandbox.fixHoveredElement === 'function')
            EventSandbox.fixHoveredElement();
    };

    Popup.prototype._disposeRelativeToWindowCenter = function () {
        var $window = $(window),
            top = Math.round($window.height() / 2 - (this.$popup.height() / 2)),
            left = Math.round($window.width() / 2 - (this.$popup.width() / 2));
        this.$popup.css({
            top: top,
            left: left
        });
    };

    Popup.prototype._bindPopupBlurHandler = function ($focusableElement) {
        var popup = this,
            activeElement = null;

        popup.$focusableElement = $focusableElement;

        //NOTE: to prevent blur handlers on active element on the page we make it unfocusable without handlers
        EventSandbox.focus(popup.$focusableElement[0], function () {
            popup.popupBlurHandler = function () {
                //NOTE: timeout to define focused element (to ensure 'tab')
                window.setTimeout(function () {
                    activeElement = document.activeElement;
                    if (activeElement === $('body')[0] ||
                        (popup.$focusableElement !== popup.$popup && activeElement === popup.$popup[0]) ||
                        (Util.isIE && Util.isShadowUIElement(activeElement) &&
                            (ShadowUI.hasClass($(activeElement), 'modal-background') || activeElement.tagName.toLowerCase() === 'svg' || activeElement === ShadowUI.getRoot()[0]))) {
                        NativeMethods.focus.call(popup.$focusableElement[0]);
                    }
                }, 50);
            };
            ShadowUI.bind(popup.$focusableElement, 'blur', popup.popupBlurHandler);
        }, true);
    };

    //API
    Popup.prototype.close = function (callback) {
        var popupCallback = callback ? callback : function () {
        };

        if (!this.options.notDialog)
            ShadowUI.unbind(this.$focusableElement, 'blur', this.popupBlurHandler);

        EventSandbox.enableOuterFocusHandlers();

        if (this.keydownHandler)
            NativeMethods.removeEventListener.call(this.$popup[0], 'keydown', this.keydownHandler, false);

        this.$popup.remove();

        ShadowUI.unbind($(window), 'resize', windowResizeHandler);

        if (this.options.restoreActiveElement) {
            if (this.selectionState)
                PageState.restoreState(this.selectionState, true, popupCallback);
            else if (this.options.prevActiveElement) {
                if (Util.isShadowUIElement(this.options.prevActiveElement)) {
                    NativeMethods.focus.call(this.options.prevActiveElement);
                    popupCallback();
                }
                else
                    EventSandbox.focus(this.options.prevActiveElement, popupCallback, true);
            }
        }
        else
            popupCallback();

        //NOTE: we can use the popup widget without EventSandbox initializing
        if (typeof EventSandbox.freeHoveredElement === 'function')
            EventSandbox.freeHoveredElement();
    };

    Popup.prototype.getContainer = function () {
        return this.$popup;
    };

    Popup.prototype.setHeaderText = function (text) {
        if (this.$headerTitle) {
            this.$headerTitle.text(text);
        }
    };

    Popup.prototype.getHeaderHeight = function () {
        return this.$header.outerHeight();
    };

    Popup.prototype.blind = function (blind) {
        if (blind) {
            ShadowUI.addClass(this.$popup, BLIND_CLASS);
            this.$popup.css('zIndex', this.$popup.css('zIndex') - 3);
        }
        else {
            ShadowUI.removeClass(this.$popup, BLIND_CLASS);
            this.$popup.css('zIndex', '');
        }
    };

    Popup.prototype.hide = function () {
        ShadowUI.unbind(this.$focusableElement, 'blur', this.popupBlurHandler);
        this.$popup.css('visibility', 'hidden');
        EventSandbox.enableOuterFocusHandlers();
    };

    Popup.prototype.show = function () {
        this.$popup.css('visibility', '');
        EventSandbox.disableOuterFocusHandlers();
        this._bindPopupBlurHandler(this.$focusableElement);
    };

    Popup.prototype.isHidden = function () {
        return this.$popup.css('visibility') === 'hidden';
    };

    Popup.prototype.moveTo = function (left, top, minLeft) {
        var $window = $(window),
            windowWidth = $window.width(),
            windowHeight = $window.height(),
            popupWidth = this.$popup.width(),
            popupHeight = this.$popup.height();

        if (typeof minLeft !== 'undefined' && minLeft !== null)
            left = Math.max(left, minLeft);
        else if (left + popupWidth > windowWidth)
            left = windowWidth - popupWidth;

        if (top + popupHeight > windowHeight)
            top = windowHeight - popupHeight;

        this.$popup.css({
            'left': left,
            'top': top
        });
    };

    Popup.prototype.getPosition = function () {
        return {
            left: parseInt(this.$popup.css('left').replace('px', '')),
            top: parseInt(this.$popup.css('top').replace('px', ''))
        };
    };

    Popup.prototype.disposeRelativeToElement = function ($elements) {
        this.positionElement = $elements[0];
        var popupPos = this._getPopupRelativePosition($elements);
        this.moveTo(popupPos.left, popupPos.top);
    };

    Popup.prototype.showAtWindowCenter = function () {
        this._disposeRelativeToWindowCenter();
    };

    Popup.prototype.changeFocusableElement = function ($focusableElement) {
        if (!this.options.notDialog && $focusableElement.length) {
            ShadowUI.unbind(this.$focusableElement, 'blur', this.popupBlurHandler);
            this._bindPopupBlurHandler($focusableElement);
        }
    };

    Popup.prototype.onkeydown = function (handler, preventBackspace, preventScrolling) {
        var popup = this;

        this.keydownHandler = function(e){
            if(preventBackspace && e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.backspace && e.target === popup.$popup[0])
                Util.preventDefault(e);
            else if(preventScrolling && e.target === popup.$popup[0] && Util.isArrowKey(e.keyCode))
                Util.preventDefault(e);
            else
                handler(e);

            Util.stopPropagation(e);
        };

        NativeMethods.addEventListener.call(this.$popup[0], 'keydown', this.keydownHandler, false);

        //T202650
        NativeMethods.addEventListener.call(this.$popup[0], 'keypress', function (e) {
            Util.stopPropagation(e);
        });
        NativeMethods.addEventListener.call(this.$popup[0], 'keyup', function (e) {
            Util.stopPropagation(e);
        });
    };
});
TestCafeClient.define('UI.RecorderWidgets.RadioGroup', function () {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI;

    //Const
    var RADIO_GROUP_CLASS = 'radio-group',
        RADIO_BUTTON_CLASS = 'radio-button',
        RADIO_BUTTON_ICON_CLASS = 'icon',
        RADIO_BUTTON_TITLE_CLASS = 'title',
        PRESSED_CLASS = 'pressed',
        DISABLED_CLASS = 'disabled';

    var RadioGroup = this.exports = function ($container, titles, checkedIndex) {
        var radioGroup = this;

        this.$radioGroup = null;
        this.$radioButtons = [];

        this.titles = titles;
        this.checkedIndex = titles && titles.length ? Math.min(Math.max(0, checkedIndex), titles.length - 1) : -1;
        this.isDisabled = false;

        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            radioGroup.eventEmitter.on(ev, listener);
        };

        this._create($container);
        this._init();
    };

    //Events
    RadioGroup.CHECKED_INDEX_CHANGED = 'checkedIndexChanged';

    //Markup
    RadioGroup.prototype._create = function ($container) {
        var radioGroup = this,

            $button = null,
            $icon = null,
            $title = null;

        this.$radioGroup = $('<div></div>').appendTo($container);
        ShadowUI.addClass(this.$radioGroup, RADIO_GROUP_CLASS);

        $.each(this.titles, function (index, title) {
            $button = $('<div></div>').appendTo(radioGroup.$radioGroup);
            radioGroup.$radioButtons.push($button);
            ShadowUI.addClass($button, RADIO_BUTTON_CLASS);

            $icon = $('<div></div>').appendTo($button);
            ShadowUI.addClass($icon, RADIO_BUTTON_ICON_CLASS);

            $title = $('<span></span>').html(title).appendTo($button);
            ShadowUI.addClass($title, RADIO_BUTTON_TITLE_CLASS);

            if (Util.isIE && Util.browserVersion === 9)
                $title[0].setAttribute('unselectable', 'on');
        });

        if (this.checkedIndex !== -1)
            ShadowUI.addClass(radioGroup.$radioButtons[this.checkedIndex], PRESSED_CLASS);

        this._init();
    };

//Behavior
    RadioGroup.prototype._init = function () {
        var radioGroup = this;

        $.each(this.$radioButtons, function (index, button) {
            ShadowUI.bind($(button), 'click', function (e) {
                radioGroup.changeState(index);
                Util.preventDefault(e);
            });
        });
    };

    //API
    RadioGroup.prototype.changeState = function (newIndex) {
        if (!this.isDisabled && newIndex !== this.checkedIndex) {
            ShadowUI.removeClass(this.$radioButtons[this.checkedIndex], PRESSED_CLASS);
            ShadowUI.addClass(this.$radioButtons[newIndex], PRESSED_CLASS);
            this.checkedIndex = newIndex;

            this.eventEmitter.emit(RadioGroup.CHECKED_INDEX_CHANGED, {
                checkedIndex: this.checkedIndex
            });
        }
    };

    RadioGroup.prototype.disable = function () {
        this.isDisabled = true;

        ShadowUI.addClass(this.$radioGroup, DISABLED_CLASS);
    };

    RadioGroup.prototype.enable = function () {
        this.isDisabled = false;

        ShadowUI.removeClass(this.$radioGroup, DISABLED_CLASS);
    };
});
TestCafeClient.define('UI.RecorderWidgets.ScrollBar', function () {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI;

    //Const
    var SCROLL_CONTAINER_CLASS = 'scrollContainer',
        SCROLL_CLASS = 'scroll';

    var ScrollBar = this.exports = function ($container, onScroll) {
        this.$container = $container;
        this.state = {
            disabled: false,
            containerInnerHeight: 0,
            scrollBarHeight: 0,
            sizeDifference: 0,
            factor: 0,

            //scroll moving
            inScroll: false,
            startY: 0,
            startScrollTop: 0
        };
        this.onScroll = onScroll;
        this.minScroll = null;
        this.maxScroll = null;

        this.$scrollBarContainer = $('<div></div>').appendTo(this.$container);
        ShadowUI.addClass(this.$scrollBarContainer, SCROLL_CONTAINER_CLASS);

        this.$scrollBar = $('<div></div>').appendTo(this.$scrollBarContainer);
        ShadowUI.addClass(this.$scrollBar, SCROLL_CLASS);

        this.$scrollBarContainer.css('display', 'none');
    };

    ScrollBar.prototype._setScroll = function (newTop) {
        var scrollContentTop = Math.max(newTop, -this.state.sizeDifference);

        if (this.minScroll !== null && Math.abs(scrollContentTop) < this.minScroll)
            scrollContentTop = (scrollContentTop / Math.abs(scrollContentTop)) * this.minScroll;

        if (this.maxScroll !== null && Math.abs(scrollContentTop) > this.maxScroll)
            scrollContentTop = (scrollContentTop / Math.abs(scrollContentTop)) * this.maxScroll;

        var scrollBarTop = -scrollContentTop * this.state.factor;

        this.$scrollBar.css('top', Math.floor(scrollBarTop));
        this.$scrollableContent.css('top', Math.floor(scrollContentTop));

        if (typeof this.onScroll === 'function')
            this.onScroll();
    };

    ScrollBar.prototype._getRelativeItemTop = function ($item) {
        var itemOffset = Util.getOffsetPosition($item[0]),
            $itemParents = $item.parents(),
            newItemTop = itemOffset.top;

        $itemParents.each(function (i, parent) {
            if ($(parent).css('position') !== 'static' && (!Util.isMozilla || $(parent).css('display') !== 'table')) {
                var parentOffset = Util.getOffsetPosition(parent);
                newItemTop -= parentOffset.top;
                return false;
            }
        });

        return newItemTop;
    };

    ScrollBar.prototype.init = function ($scrollableContainer, $scrollableContent) {
        this.$scrollableContainer = $scrollableContainer;
        this.$scrollableContent = $scrollableContent;

        var scrollBar = this;

        this.recalculateSize();

        if (this.state.sizeDifference <= 0)
            this.state.disabled = true;

        ShadowUI.bind(scrollBar.$container, typeof document.onwheel !== 'undefined' ? 'wheel' : 'mousewheel', function (e) {
            scrollBar.updateOnMouseWheel(e);
        });

        //mouse
        ShadowUI.bind(scrollBar.$scrollBarContainer, 'mousedown', function (e) {
            if (scrollBar.state.disabled)
                return;

            scrollBar.state.startY = e.clientY;
            scrollBar.state.startScrollTop = parseInt(scrollBar.$scrollBar.css('top').replace('px', ''));
            scrollBar.state.inScroll = true;
            Util.preventDefault(e);

            return false;
        });

        ShadowUI.bind($(document), 'mouseup', function () {
            if (scrollBar.state.disabled)
                return;

            scrollBar.state.inScroll = false;
            return false;
        });

        ShadowUI.bind($(document), 'mousemove', function (e) {
            if (!scrollBar.state.inScroll || scrollBar.state.disabled)
                return;

            var newTop = Math.min(Math.max(e.clientY - scrollBar.state.startY + scrollBar.state.startScrollTop, 0),
                scrollBar.state.containerInnerHeight - scrollBar.state.scrollBarHeight);

            scrollBar._setScroll(-newTop / scrollBar.state.factor);
            Util.preventDefault(e);

            return false;
        });
    };

    ScrollBar.prototype.isVisible = function () {
        return this.$scrollBarContainer.css('display') !== 'none';
    };

    ScrollBar.prototype.updateScroll = function (item) {
        if (this.state.disabled)
            return;

        var $newItem = $(item),
            newItemOffset = Util.getOffsetPosition($newItem[0]),
            newItemHeight = $newItem.height() + Util.getElementMargin($newItem).bottom,

            scrollBarTop = parseInt(this.$scrollBar.css('top').replace('px', '')),
            containerPadding = Util.getElementPadding(this.$scrollableContainer),
            containerInnerHeight = this.$container.height() - (containerPadding.top + containerPadding.bottom),

            containerOffset = Util.getOffsetPosition(this.$container),
            containerHeight = this.$container.height(),

            needTopScroll = newItemOffset.top < containerOffset.top,
            needBottomScroll = newItemOffset.top + newItemHeight > containerOffset.top + containerHeight,

            newTop = null;

        this.state.factor = containerInnerHeight / this.$scrollableContent.height();

        if (this._getRelativeItemTop($newItem) === 0) {
            needTopScroll = true;
            newTop = 0;
        }

        if (needTopScroll || needBottomScroll) {
            var scrollIndent = needTopScroll ? newItemOffset.top - containerOffset.top :
                newItemOffset.top + newItemHeight - containerOffset.top - containerHeight;

            newTop = newTop === 0 ? 0 :
                Math.min(Math.max(this.state.factor * scrollIndent + scrollBarTop, 0), containerInnerHeight - Math.floor(containerInnerHeight * this.state.factor));

            this._setScroll(-newTop / this.state.factor);
        }
    };

    ScrollBar.prototype.restoreScroll = function (scrollBarTop) {
        var containerPadding = Util.getElementPadding(this.$scrollableContainer),
            containerInnerHeight = this.$container.height() - (containerPadding.top + containerPadding.bottom),
            factor = containerInnerHeight / this.$scrollableContent.height(),

            newTop = Math.min(scrollBarTop, containerInnerHeight - Math.floor(containerInnerHeight * factor));

        this.$scrollBar.css('top', newTop);
        this.$scrollableContent.css('top', Math.floor(-newTop / factor));
    };

    ScrollBar.prototype.recalculateSize = function () {
        var containerPadding = Util.getElementPadding(this.$scrollableContainer),
            contentHeight = this.$scrollableContent.height();

        this.state.containerInnerHeight = this.$container.height() - (containerPadding.top + containerPadding.bottom);
        this.state.sizeDifference = contentHeight - this.state.containerInnerHeight;

        this.state.factor = this.state.containerInnerHeight / contentHeight;

        if (this.state.sizeDifference <= 0) {
            if (this.$scrollBarContainer.css('display') !== 'none')
                this.$scrollBarContainer.css('display', 'none');

            if (this.$scrollBar.height() !== 0)
                this.$scrollBar.height(0);

            this.state.disabled = true;

            return;
        }

        this.state.disabled = false;
        this.$scrollBarContainer.css('display', '');

        this.state.scrollBarHeight = Math.floor(this.state.containerInnerHeight * this.state.factor);

        this.$scrollBarContainer.height(this.state.containerInnerHeight);
        this.$scrollBar.height(this.state.scrollBarHeight);

        this.restoreScroll(parseInt(this.$scrollBar.css('top').replace('px', '')));
    };

    ScrollBar.prototype.updateOnMouseWheel = function (e) {
        if (this.state.disabled)
            return;

        var delta = e.wheelDelta || (e.originalEvent ? (-e.originalEvent.deltaY * 8) : -e.deltaY * 100),
            top = parseInt(this.$scrollableContent.css('top').replace('px', '')),
            newTop = Math.min(top + delta, 0);


        this._setScroll(newTop);
        Util.preventDefault(e);

        return false;
    };

    ScrollBar.prototype.setMinScroll = function (value) {
        this.minScroll = value;
    };

    ScrollBar.prototype.setMaxScroll = function (value) {
        this.maxScroll = value;
    };
});
TestCafeClient.define('UI.RecorderWidgets.SelectorEditor', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        ShadowUI = Hammerhead.ShadowUI,
        Util = Hammerhead.Util,

        GeneratorRules = require('Recorder.SelectorGenerator.Rules'),

        CodeEditorWidget = require('UI.RecorderWidgets.CodeEditor'),
        SelectorSwitcherWidget = require('UI.RecorderWidgets.SelectorSwitcher'),
        PopupWidget = require('UI.RecorderWidgets.Popup'),
        ElementsMarkerWidget = require('UI.RecorderWidgets.ElementsMarker'),
        JavascriptExecutor = require('Base.JavascriptExecutor'),
        ValidationMessageFactory = require('UI.ValidationMessageFactory');

    //Const
    var SELECTOR_EDITOR_CLASS = 'selector-editor',
        SELECTOR_SWITCHER_CONTAINER_CLASS = 'selector-switcher-container',
        CODE_EDITOR_CONTAINER_CLASS = 'code-editor-container',
        ACTIVE_CLASS = 'active',

        SELECTOR_EDITOR_POPUP_TITLE = 'Target selector',
        SELECTOR_EDITOR_HEADER_FONT_SIZE = 18,

    //Selector editor validation errors/warnings
        EMPTY_SELECTOR = 'Selector doesn\'t contain any element',
        SEVERAL_ELEMENTS = 'Selector contains more than one element',
        SEVERAL_ELEMENTS_WITH_INVISIBLE = 'Selector contains more than one element (one or more are invisible)',
        INVISIBLE_ELEMENT = 'Selector contains an invisible element',

        CUSTOM_SELECTOR_DESCRIPTION = 'Custom expression';

    //SelectorEditor
    var SelectorEditor = this.exports = function ($container, options) {
        var selectorEditor = this;

        this.options = {
            width: options.width || '100%',
            height: options.height || '100%',
            selectors: options.selectors || [],
            currentSelectorIndex: options.currentSelectorIndex || 0,
            allowEdit: options.allowEdit || false,
            expandDirection: options.expandDirection || 'right',
            enableFloatMode: options.enableFloatMode || false,
            enableValidation: options.enableValidation || false,
            $floatingParent: options.$floatingParent || null,
            enableElementsMarking: options.enableElementsMarking || false,
            allowVisibleElementsOnly: options.allowVisibleElementsOnly || false,
            context: options.context || null,
            parseDomElementsOrJqueryObjectsOnly: options.parseDomElementsOrJqueryObjectsOnly || false,
            allowMultipleElements: options.allowMultipleElements || false
        };

        if (typeof this.options.width === 'string' && this.options.width.indexOf('%') > -1) {
            var width = parseInt(this.options.width.replace('%', ''));

            if (!isNaN(width))
                this.options.width = Math.round($container.width() * width / 100);
        }

        if (typeof this.options.height === 'string' && this.options.height.indexOf('%') > -1) {
            var height = parseInt(this.options.height.replace('%', ''));

            if (!isNaN(height))
                this.options.height = Math.round($container.height() * height / 100);
        }

        this.$selectorEditor = null;
        this.$selectorSwitcherContainer = null;
        this.$codeEditorContainer = null;

        this.selectorSwitcher = null;
        this.codeEditor = null;
        this.selectorEditorPopup = null;

        this.parsedSelector = null;
        this.hasJSErrors = false;
        this.hasVisibilityErrors = false;

        this.eventEmitter = new Util.EventEmitter();

        this.$container = $container;

        this._createMarkup();
        this._initBehavior();

        JavascriptExecutor.parseSelector(this.codeEditor.getText(), selectorEditor.options.parseDomElementsOrJqueryObjectsOnly, function (parsedSelector) {
            selectorEditor.parsedSelector = parsedSelector;
            selectorEditor._validate();
            selectorEditor._markElements();
        }, this.options.context);
    };

    //Events
    SelectorEditor.INIT_EVENT = 'init';
    SelectorEditor.SELECTOR_CHANGED_EVENT = 'selectorChanged';
    SelectorEditor.FOCUS_EVENT = 'focus';
    SelectorEditor.BLUR_EVENT = 'blur';

    //Markup
    SelectorEditor.prototype._createMarkup = function () {
        this.$selectorEditor = $('<div></div>').appendTo(this.$container);
        ShadowUI.addClass(this.$selectorEditor, SELECTOR_EDITOR_CLASS);

        this.$selectorSwitcherContainer = $('<div></div>').appendTo(this.$selectorEditor);
        ShadowUI.addClass(this.$selectorSwitcherContainer, SELECTOR_SWITCHER_CONTAINER_CLASS);

        this.$codeEditorContainer = $('<div></div>').appendTo(this.$selectorEditor);
        ShadowUI.addClass(this.$codeEditorContainer, CODE_EDITOR_CONTAINER_CLASS);

        this.selectorSwitcher = new SelectorSwitcherWidget(this.$selectorEditor, this.$selectorSwitcherContainer,
            this.options.selectors, this.options.currentSelectorIndex, this.options.height);

        var $codeEditor = $('<div></div>').appendTo(this.$codeEditorContainer);

        this.codeEditor = new CodeEditorWidget($codeEditor, {
            width: this.options.width - this.$selectorSwitcherContainer.width(),
            height: this.options.height,
            text: this.options.selectors[this.options.currentSelectorIndex].selector,
            allowEdit: this.options.allowEdit,
            expandDirection: this.options.expandDirection
        });
    };

    //Behavior
    SelectorEditor.prototype._markElements = function () {
        var selectorEditor = this;

        if (this.options.enableElementsMarking) {
            var $base = (this.selectorEditorPopup && this.selectorEditorPopup.getContainer()) || this.options.$floatingParent || this.$selectorEditor;

            if (this.parsedSelector && this.parsedSelector.visibleLength) {
                if (this.options.context)
                    ElementsMarkerWidget.markInContext($base, this.parsedSelector.selector, this.options.context, this.options.parseDomElementsOrJqueryObjectsOnly);
                else
                    ElementsMarkerWidget.mark($base, this.parsedSelector.$visibleElements);
            }
            else
                ElementsMarkerWidget.mark($base, $());

            ElementsMarkerWidget.events.on(ElementsMarkerWidget.ELEMENT_RECTANGLES_COUNT_CHANGED, function () {
                //NOTE: we need reparse selector because the ELEMENT_RECTANGLES_COUNT_CHANGED event means than
                //count of visible elements changed
                JavascriptExecutor.parseSelector(selectorEditor.codeEditor.getText(), selectorEditor.options.parseDomElementsOrJqueryObjectsOnly, function (parsedSelector) {
                    selectorEditor.parsedSelector = parsedSelector;
                    selectorEditor._validate();
                }, selectorEditor.options.context);
            });
        }
    };

    SelectorEditor.prototype._onCodeEditorChange = function () {
        var selectorEditor = this,
            text = this.codeEditor.getText();

        selectorEditor.inChanging = true;

        var selectors = selectorEditor.options.selectors,
            curIndex = selectorEditor.options.currentSelectorIndex;

        if (selectors[curIndex].selector !== text) {
            var i = 0,
                exist = false;

            for (; i < selectors.length; i++) {
                if (selectors[i].selector === text) {
                    selectorEditor.selectorSwitcher._setValue(selectors[i]);
                    selectorEditor.options.currentSelectorIndex = i;
                    exist = true;
                }
            }

            if (!exist) {
                for (i = 0; i < selectors.length; i++) {
                    if (selectors[i].id === GeneratorRules.ruleIDs.USER_INPUT) {
                        selectors[i].selector = text;
                        selectorEditor.selectorSwitcher._setValue(selectors[i]);
                        selectorEditor.options.currentSelectorIndex = i;
                        exist = true;
                    }
                }
            }

            if (!exist) {
                var customSelector = {id: GeneratorRules.ruleIDs.USER_INPUT, selector: text, description: CUSTOM_SELECTOR_DESCRIPTION};

                selectors.splice(0, 0, customSelector);
                selectorEditor.selectorSwitcher._setValue(selectors[0]);
                selectorEditor.options.currentSelectorIndex = 0;
            }
        }

        JavascriptExecutor.parseSelector(text, selectorEditor.options.parseDomElementsOrJqueryObjectsOnly, function (parsedSelector) {
            selectorEditor.parsedSelector = parsedSelector;
            selectorEditor._validate();

            selectorEditor.eventEmitter.emit(SelectorEditor.SELECTOR_CHANGED_EVENT, {
                text: text,
                index: selectorEditor.options.currentSelectorIndex,
                selectors: selectorEditor.options.selectors,
                parsedSelector: selectorEditor.parsedSelector
            });

            selectorEditor._markElements();

            selectorEditor.inChanging = false;
        }, selectorEditor.options.context);
    };

    SelectorEditor.prototype._initBehavior = function () {
        var selectorEditor = this;
        this.inChanging = false;

        this.selectorSwitcher.on(SelectorSwitcherWidget.VALUE_CHANGED_EVENT, function (e) {
            if (e.value) {
                selectorEditor.options.currentSelectorIndex = selectorEditor.options.selectors.indexOf(e.value);

                if (!selectorEditor.inChanging) {
                    selectorEditor.codeEditor.setText(e.value.selector);
                    selectorEditor.codeEditor._textChanged();
                }
            }
        });

        this.codeEditor.events.on(CodeEditorWidget.CHANGE_EVENT, function (e) {
            selectorEditor._onCodeEditorChange(e.text);
        });


        if (this.options.enableFloatMode) {
            this.codeEditor.events.on(CodeEditorWidget.FOCUS_EVENT, function () {
                selectorEditor._enableFloat();

                if (!selectorEditor.floatModifications)
                    selectorEditor.eventEmitter.emit(SelectorEditor.FOCUS_EVENT, {});
            });

            this.codeEditor.events.on(CodeEditorWidget.BLUR_EVENT, function () {
                selectorEditor._disableFloat();

                if (!selectorEditor.floatModifications)
                    selectorEditor.eventEmitter.emit(SelectorEditor.BLUR_EVENT, {});
            });
        }
    };

    SelectorEditor.prototype._enableFloat = function () {
        if (this.float || this.floatModifications)
            return;

        this.floatModifications = true;
        this.float = true;

        var selectorEditor = this,
            $window = $(window),
            codeEditorPosition = this.$codeEditorContainer.offset();

        this.selectorEditorPopup = new PopupWidget(ShadowUI.getRoot(), {
            headerText: SELECTOR_EDITOR_POPUP_TITLE,
            headerHideIcon: true,
            content: this.$codeEditorContainer,
            headerTextSize: SELECTOR_EDITOR_HEADER_FONT_SIZE,
            notDialog: true,
            restoreActiveElement: false
        });

        //NOTE: we should call it async because of async 'focus' function in IE
        window.setTimeout(function () {
            selectorEditor.floatModifications = false;
            selectorEditor.codeEditor.focus();
        }, 0);

        var $popupContainer = this.selectorEditorPopup.getContainer(),
            topCorrection = this.selectorEditorPopup.getHeaderHeight() +
                ($popupContainer.outerHeight() - $popupContainer.innerHeight()) / 2,
            leftCorrection = ($popupContainer.outerWidth() - $popupContainer.innerWidth()) / 2;

        this.selectorEditorPopup.moveTo(codeEditorPosition.left - leftCorrection - $window.scrollLeft(),
            codeEditorPosition.top - topCorrection - $window.scrollTop());

        ShadowUI.addClass(this.selectorEditorPopup.getContainer(), ACTIVE_CLASS);

        selectorEditor.selectorEditorPopup.on(PopupWidget.HIDE_BUTTON_CLICK_EVENT, function () {
            selectorEditor._disableFloat(true);
        });

        if (this.options.$floatingParent) {
            var parentOffset = {
                left: codeEditorPosition.left - this.options.$floatingParent.offset().left,
                top: codeEditorPosition.top - this.options.$floatingParent.offset().top
            };

            selectorEditor.selectorEditorPopup.on(PopupWidget.MOVED_EVENT, function () {
                var curEditorPos = selectorEditor.$codeEditorContainer.offset();

                selectorEditor.options.$floatingParent.css({
                    left: curEditorPos.left - parentOffset.left - $window.scrollLeft(),
                    top: curEditorPos.top - parentOffset.top - $window.scrollTop()
                });
            });
        }

        this._markElements();
    };

    SelectorEditor.prototype._disableFloat = function (forceBlur) {
        if (!this.float || this.floatModifications)
            return;

        this.floatModifications = true;
        this.float = false;

        //NOTE: we call it to correct focus/blur events raising
        if (Util.isIE || Util.isMozilla)
            this.codeEditor.blur();

        this.$codeEditorContainer.css({
            left: 0,
            top: 0,
            position: ''
        }).appendTo(this.$selectorEditor);

        this.selectorEditorPopup.close();
        this.selectorEditorPopup = null;

        this._markElements();

        this.floatModifications = false;

        //NOTE: we call it to correct focus/blur events raising
        if (forceBlur && !Util.isIE)
            this.codeEditor.blur();
    };

    SelectorEditor.prototype._validate = function () {
        this._jsValidation();

        if (!this.hasJSErrors && this.options.enableValidation)
            this._elementsValidation();
    };

    SelectorEditor.prototype._jsValidation = function () {
        if (this.parsedSelector.error) {
            ValidationMessageFactory.error(this.codeEditor.getContainer(), this.parsedSelector.error);
            this.hasJSErrors = true;
        }
        else {
            ValidationMessageFactory.success(this.codeEditor.getContainer(), this.parsedSelector.error);
            this.hasJSErrors = false;
        }
    };

    SelectorEditor.prototype._elementsValidation = function () {
        this.hasVisibilityErrors = false;

        if (!this.parsedSelector)
            return;

        if (!this.parsedSelector.length) {
            if (this.options.allowVisibleElementsOnly) {
                this.hasVisibilityErrors = true;
                ValidationMessageFactory.error(this.codeEditor.getContainer(), EMPTY_SELECTOR);
            }
            else
                ValidationMessageFactory.warning(this.codeEditor.getContainer(), EMPTY_SELECTOR);
            return;
        }

        if (this.parsedSelector.length > 1) {
            if (!this.options.allowMultipleElements)
                this.hasVisibilityErrors = true;

            var errMsg = this.parsedSelector.length !== this.parsedSelector.visibleLength ? SEVERAL_ELEMENTS_WITH_INVISIBLE : SEVERAL_ELEMENTS;

            if (this.options.allowMultipleElements)
                ValidationMessageFactory.warning(this.codeEditor.getContainer(), errMsg);
            else
                ValidationMessageFactory.error(this.codeEditor.getContainer(), errMsg);
            return;
        }

        if (this.parsedSelector.length !== this.parsedSelector.visibleLength) {
            if (this.options.allowVisibleElementsOnly) {
                this.hasVisibilityErrors = true;
                ValidationMessageFactory.error(this.codeEditor.getContainer(), INVISIBLE_ELEMENT);
            }
            else
                ValidationMessageFactory.warning(this.codeEditor.getContainer(), INVISIBLE_ELEMENT);
            return;
        }

        ValidationMessageFactory.success(this.codeEditor.getContainer());
    };

    //API
    SelectorEditor.prototype.on = function (event, handler) {
        this.eventEmitter.on(event, handler);
    };

    SelectorEditor.prototype.getParsedSelector = function () {
        return this.parsedSelector;
    };

    SelectorEditor.prototype.isValid = function (skipVisibilityErrors) {
        if (skipVisibilityErrors)
            return !this.hasJSErrors;
        else
            return !this.hasJSErrors && !this.hasVisibilityErrors;
    };

    SelectorEditor.prototype.destroy = function () {
        ElementsMarkerWidget.clear();
    };

    SelectorEditor.prototype.setContext = function (context) {
        this.options.context = context;

        this._onCodeEditorChange();
    };

    SelectorEditor.prototype.enableElementsMarking = function () {
        this.options.enableElementsMarking = true;
        this._markElements();
    };
});
TestCafeClient.define('UI.RecorderWidgets.SelectorSwitcher', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        ScrollBarWidget = require('UI.RecorderWidgets.ScrollBar');

    //Const
    var SELECTOR_SWITCHER_CLASS = 'selector-switcher',
        BAR_CLASS = 'bar',
        ARROW_CLASS = 'arrow',
        DROP_DOWN_CLASS = 'drop-down',
        ITEM_HOVERED_CLASS = 'hovered',
        ITEM_LIST_CLASS = 'item-list',
        ITEMS_CLASS = 'items',
        ITEM_CLASS = 'item',
        ICON_CLASS = 'icon',
        ITEM_DESCRIPTION_CLASS = 'description',
        TEXT_CONTAINER_CLASS = 'text-container',
        HIGHLIGHTED_TEXT_CLASS = 'highlighted',
        ICON_CLASS_PREFIX = 'icon-',
        ICON_GREY_CLASS_PREFIX = 'icon-grey-',
        SEPARATOR_CLASS = 'separator',
        GRADIENT_CLASS = 'gradient',

        MIN_GRADIENT_HEIGHT = 80,
        MIN_DROPDOWN_HEIGHT = 150;

    var SelectorSwitcher = this.exports = function ($selectorArea, $selectorSwitcherContainer, items, currentIndex, height) {
        var switcher = this;

        this.$selectorArea = $selectorArea;
        this.$selectorSwitcherContainer = $selectorSwitcherContainer;

        this.$switcher = $('<div></div>')
            .appendTo($selectorSwitcherContainer);
        ShadowUI.addClass(this.$switcher, SELECTOR_SWITCHER_CLASS);

        if (height)
            this.$switcher.height(height);

        this.$bar = null;
        this.$dropDown = null;
        this.$items = null;
        this.items = items.slice(0);
        this.value = null;
        this.dropDownOpened = false;

        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            switcher.eventEmitter.on(ev, listener);
        };

        this._createBar();
        this._setValue(items[currentIndex]);
    };

    //Events
    SelectorSwitcher.VALUE_CHANGED_EVENT = 'valueChanged';

    //Markup
    SelectorSwitcher.prototype._createBar = function () {
        var switcher = this,
            $gradient = null;

        this.$bar = $('<div></div>')
            .appendTo(this.$switcher);
        ShadowUI.addClass(this.$bar, BAR_CLASS);

        var $icon = $('<div></div>')
            .appendTo(this.$bar);
        ShadowUI.addClass($icon, ICON_CLASS);

        switcher.$barIconImg = $('<div></div>')
            .appendTo($icon);

        var $arrow = $('<div></div>')
            .appendTo(this.$bar);
        ShadowUI.addClass($arrow, ARROW_CLASS);

        if (this.$bar.height() >= MIN_GRADIENT_HEIGHT) {
            $gradient = $('<div></div>').appendTo(this.$bar);

            ShadowUI.addClass($gradient, GRADIENT_CLASS);

            $gradient.css('left', this.$selectorSwitcherContainer.position().left + 'px');
            $gradient.css('top', (this.$selectorSwitcherContainer.position().top + this.$selectorSwitcherContainer.height() - $gradient.height()) + 'px');
        }

        var onClick = function (e) {
            if (e.button === Util.BUTTON.LEFT || Util.hasTouchEvents) {
                if (switcher.dropDownOpened) {
                    switcher._hideItemList();
                }
                else {
                    switcher._showItemList();
                }
            }
            Util.preventDefault(e);
        };

        ShadowUI.bind(this.$bar, 'click', onClick);

        ShadowUI.bind(this.$switcher, 'keydown', function (e) {
            var keyCode = e.keyCode;
            if (Util.isCharByKeyCode(keyCode, Util.isShadowUIElement) || /^(backspace|delete)$/.test(Util.KEYS_MAPS.REVERSED_SPECIAL_KEYS[keyCode])) {
                Util.preventDefault(e);
                return;
            }

            if (/^(down|right)$/.test(Util.KEYS_MAPS.REVERSED_SPECIAL_KEYS[keyCode])) {
//TODO
                Util.preventDefault(e);
            }
            else if (/^(up|left)$/.test(Util.KEYS_MAPS.REVERSED_SPECIAL_KEYS[keyCode])) {
//TODO
                Util.preventDefault(e);
            }
            else if (/^(enter|esc)$/.test(Util.KEYS_MAPS.REVERSED_SPECIAL_KEYS[keyCode]) && switcher.dropDownOpened) {
                switcher._hideItemList();
                Util.preventDefault(e);
            }
        });
    };

    SelectorSwitcher.prototype._createItemList = function () {
        var switcher = this;

        this.$dropDown = $('<div></div>');
        this.$dropDown.css('visibility', 'hidden');
        this.$dropDown.appendTo(this.$switcher);

        ShadowUI.addClass(this.$dropDown, DROP_DOWN_CLASS);
        var dropDownPadding = Util.getElementPadding(this.$dropDown);
        var dropDownBorders = Util.getBordersWidth(this.$dropDown);
        this.$dropDown.css('width', (this.$selectorArea.width() - dropDownPadding.left - dropDownPadding.right - dropDownBorders.left - dropDownBorders.right) + 'px');
        this.$dropDown.css('max-height', Math.max(MIN_DROPDOWN_HEIGHT,
            (this.$selectorArea.height() - dropDownPadding.top - dropDownPadding.bottom - dropDownBorders.top - dropDownBorders.bottom)) + 'px');
        var barArrowPosition = ShadowUI.select('.' + ARROW_CLASS, switcher.$bar).position();
        this.$dropDown.css({
            left: barArrowPosition.left,
            top: barArrowPosition.top
        });

        this.scrollBar = new ScrollBarWidget(this.$dropDown);

        var $itemList = $('<div></div>').appendTo(this.$dropDown);
        ShadowUI.addClass($itemList, ITEM_LIST_CLASS);

        this.$items = $('<div></div>').appendTo($itemList);
        ShadowUI.addClass(this.$items, ITEMS_CLASS);

        $.each(switcher.items, function (index, item) {
            var $item = $('<div></div>')
                .data('item', item)
                .appendTo(switcher.$items);
            ShadowUI.addClass($item, ITEM_CLASS);

            $item.mouseenter(function () {
                switcher._setHoveredItem($item);
            });

            $item.click(function () {
                switcher._setValue($item.data('item'));
                switcher._hideItemList();
            });

            var $icon = $('<div></div>').appendTo($item);
            ShadowUI.addClass($icon, ICON_CLASS);

            var $iconImg = $('<div></div>').appendTo($icon);
            ShadowUI.addClass($iconImg, ICON_GREY_CLASS_PREFIX + item.id);

            var $description = $('<div></div>').appendTo($item);
            ShadowUI.addClass($description, ITEM_DESCRIPTION_CLASS);
            var $textContainer = $('<div>' + item.description + '</div>');
            ShadowUI.addClass($textContainer, TEXT_CONTAINER_CLASS);
            //we have to set width here manually to make 'word-wrap' css property work
            $textContainer.width($description.width());
            $textContainer.appendTo($description);
            ShadowUI.addClass($textContainer.find('span'), HIGHLIGHTED_TEXT_CLASS);

            if (index !== switcher.items.length - 1) {
                var $separator = $('<div></div>').appendTo(switcher.$items);
                ShadowUI.addClass($separator, SEPARATOR_CLASS);
            }
        });

        this.scrollBar.init($itemList, this.$items);
        if (this.scrollBar.isVisible())
            $.each(this.$items.children(), function () {
                $(this).css('padding-right', '0px');
            });

        this._setDropDownSelectedItem(this.value);
        this._setHoveredItem(this._getDropDownItem(this.value));
    };

    SelectorSwitcher.prototype._setValue = function (value) {
        if (this.value === value)
            return;
        if (this.items.indexOf(value) < 0) {
            this.items.splice(0, 0, value);
            if (this.$dropDown) {
                this.$dropDown.remove();
                this.$dropDown = null;
            }
        }
        this._setBarSelectedItem(value);
        if (this.$dropDown) {
            this._setDropDownSelectedItem(value);
            this._setHoveredItem(this._getDropDownItem(value));
        }
        this.value = value;
        this.eventEmitter.emit(SelectorSwitcher.VALUE_CHANGED_EVENT, { value: value });
    };

    SelectorSwitcher.prototype._setBarSelectedItem = function (value) {
        if (this.value)
            ShadowUI.removeClass(this.$barIconImg, ICON_CLASS_PREFIX + this.value.id);
        ShadowUI.addClass(this.$barIconImg, ICON_CLASS_PREFIX + value.id);
    };

    SelectorSwitcher.prototype._setDropDownSelectedItem = function (value) {
        if (this.value) {
            var $selectedItemIcon = ShadowUI.select('.' + ICON_CLASS_PREFIX + this.value.id, this.$items);
            ShadowUI.removeClass($selectedItemIcon, ICON_CLASS_PREFIX + this.value.id);
            ShadowUI.addClass($selectedItemIcon, ICON_GREY_CLASS_PREFIX + this.value.id);
        }
        var $iconForSelect = ShadowUI.select('.' + ICON_GREY_CLASS_PREFIX + value.id, this.$items);
        ShadowUI.removeClass($iconForSelect, ICON_GREY_CLASS_PREFIX + value.id);
        ShadowUI.addClass($iconForSelect, ICON_CLASS_PREFIX + value.id);
    };

    SelectorSwitcher.prototype._getDropDownItem = function (value) {
        var $itemsCollection = this.$items.children();
        for (var i = 0; i < $itemsCollection.length; i++)
            if ($itemsCollection.eq(i).data('item') === value)
                return $itemsCollection.eq(i);
    };

    SelectorSwitcher.prototype._setHoveredItem = function ($item) {
        var $hoveredItem = ShadowUI.select('.' + ITEM_HOVERED_CLASS, this.$items);
        ShadowUI.removeClass($hoveredItem, ITEM_HOVERED_CLASS);
        ShadowUI.addClass($item, ITEM_HOVERED_CLASS);
    };

    SelectorSwitcher.prototype._showItemList = function () {
        var switcher = this;

        if (!switcher.$dropDown)
            switcher._createItemList();

        var unbindAndHideItemList = function () {
            switcher._hideItemList();
            ShadowUI.unbind($(document), 'mousedown', onDocumentMouseDown);
        };

        var onDocumentMouseDown = function (e) {
            var target = e.target || e.srcElement;
            if (!switcher.$switcher.has(target).length)
                unbindAndHideItemList();
        };

        this.$dropDown.css('visibility', '');

        ShadowUI.bind($(document), 'mousedown', onDocumentMouseDown);

        this.dropDownOpened = true;
    };

    SelectorSwitcher.prototype._hideItemList = function () {
        this.$dropDown.css('visibility', 'hidden');
        this.dropDownOpened = false;
    };
});
TestCafeClient.define('UI.RecorderWidgets.SetTestNameDialog', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        NativeMethods = Hammerhead.NativeMethods,
        TextSelection = Hammerhead.TextSelection,
        ValidationMessageFactory = require('UI.ValidationMessageFactory'),
        PopupWidget = require('UI.RecorderWidgets.Popup'),
        ButtonWidget = require('UI.RecorderWidgets.Button');

    //Const
    var TEST_NAME_INPUT_ID = '989b5ac6-476f-4c86-a53b-37c9decad66b-test-name',
        BUTTONS_CLASS = 'buttons',
        BUTTON_SMALL_CLASS = 'small',

        TEST_NAME_AREA_CLASS = 'test-name-area',
        TEST_NAME_CLASS = 'test-name',

        FIELD_CLASS = 'field',
        VALUE_CLASS = 'value',
        INPUT_CLASS = 'input',

    //Popup header text
        HEADER_TEXT = 'Save test',
        POPUP_MESSAGE_TEXT = 'Test name:';

    //Events
    exports.SAVE_TEST_BUTTON_CLICK_EVENT = 'saveTestButtonClick';
    exports.CANCEL_SAVE_BUTTON_CLICK_EVENT = 'cancelSaveButtonClick';

    //Globals
    var eventEmitter = null,
        popup = null,
        $saveTestButton = null,
        $cancelSaveButton = null,
        $testNameInput = null,
        selectedStepNum = null,
        actualStepNum = null;


    //Markup
    var createDialog = function ($container, args) {
        selectedStepNum = args.selectedStepNum;
        actualStepNum = args.actualStepNum;

        var popupOptions = {
            width: 608,
            content: createTestNameArea($('<div></div>')),
            headerText: HEADER_TEXT,
            footerContent: createButtons(),
            showAtWindowCenter: true
        };

        popup = new PopupWidget($container, popupOptions);

        init();
    };

    var createTestNameArea = function ($testNameArea) {
        ShadowUI.addClass($testNameArea, TEST_NAME_AREA_CLASS);

        var $testName = $('<div></div>').appendTo($testNameArea);
        ShadowUI.addClass($testName, TEST_NAME_CLASS);

        var $label = $('<label></label>').appendTo($testName)
            .text(POPUP_MESSAGE_TEXT)
            .attr('for', TEST_NAME_INPUT_ID);
        ShadowUI.addClass($label, FIELD_CLASS);

        if ($.browser.webkit || $.browser.opera) {
            $label.css('position', 'relative');
            $label.css('top', '1px');
        }

        var $value = $('<div></div>').appendTo($testName);
        ShadowUI.addClass($value, VALUE_CLASS);

        $testNameInput = $('<input type="text">')
            .appendTo($value)
            .attr('id', TEST_NAME_INPUT_ID);
        ShadowUI.addClass($testNameInput, INPUT_CLASS);

        window.setTimeout(function () {
            NativeMethods.focus.call($testNameInput[0]);
            window.setTimeout(function () {
                popup.changeFocusableElement($testNameInput);
            }, 0);
        }, 0);

        return $testNameArea;
    };

    var createButtons = function () {
        var $buttons = $('<div></div>');
        ShadowUI.addClass($buttons, BUTTONS_CLASS);

        $saveTestButton = ButtonWidget.create($buttons, 'Save');
        $cancelSaveButton = ButtonWidget.create($buttons, 'Cancel');

        ShadowUI.addClass($saveTestButton, BUTTON_SMALL_CLASS);
        ShadowUI.addClass($cancelSaveButton, BUTTON_SMALL_CLASS);

        return $buttons;
    };

//Behavior
    var init = function () {
        ShadowUI.bind($cancelSaveButton, 'click', function () {
            closeDialog(function () {
                eventEmitter.emit(exports.CANCEL_SAVE_BUTTON_CLICK_EVENT, {
                    selectedStepNum: selectedStepNum,
                    actualStepNum: actualStepNum
                });
            });
        });

        ShadowUI.bind($saveTestButton, 'click', function () {
            eventEmitter.emit(exports.SAVE_TEST_BUTTON_CLICK_EVENT, {testName: $testNameInput.val()});
        });

        popup.onkeydown(function (e) {
            var testNameStartSelection = TextSelection.getSelectionStart($testNameInput[0]),
                testNameEndSelection = TextSelection.getSelectionEnd($testNameInput[0]);

            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.enter) {
                $saveTestButton.trigger('click');
                Util.preventDefault(e);
            }

            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.esc) {
                $cancelSaveButton.trigger('click');
                Util.preventDefault(e);
            }

            //NOTE: we should prevent page scrolling in Chrome
            if ($.browser.webkit && testNameStartSelection === testNameEndSelection) {
                if ((e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.left && testNameStartSelection === 0) ||
                    (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.right && testNameStartSelection === $testNameInput[0].value.length))
                    Util.preventDefault(e);
            }
        }, true);
    };

    var closeDialog = function (callback) {
        popup.close(callback);
    };

    //API
    exports.onError = function (err) {
        ValidationMessageFactory.error($testNameInput, err);
        NativeMethods.focus.call($testNameInput[0]);
    };


    exports.blind = function (blind) {
        popup.blind(blind);
    };

    exports.init = function ($container, args) {
        eventEmitter = new Util.EventEmitter();
        createDialog($container, args);
    };

    exports.closeDialog = function (callback) {
        popup.close(callback);
    };

    exports.events = {
        on: function (ev, listener) {
            eventEmitter.on(ev, listener);
        }
    };
});
TestCafeClient.define('UI.RecorderWidgets.StepsPanel', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        EventSandbox = Hammerhead.EventSandbox,
        ScrollBarWidget = require('UI.RecorderWidgets.ScrollBar'),
        BaseStepWidget = require('UI.RecorderWidgets.BaseStep'),
        AssertionsStepWidget = require('UI.RecorderWidgets.AssertionsStep'),
        ActionStepWidget = require('UI.RecorderWidgets.ActionStep'),
        SortingBehavior = require('UI.SortingBehavior'),
        ButtonWidget = require('UI.RecorderWidgets.Button'),
        ModalBackground = require('UI.ModalBackground'),
        TooltipWidget = require('UI.RecorderWidgets.Tooltip'),
        PopupWidget = require('UI.RecorderWidgets.Popup'),

        UXLog = require('UI.UXLog');

    var STEPS_PANEL_CLASS = 'steps-panel',
        STEP_LIST_CLASS = 'step-list-panel',
        SCROLLABLE_CLASS = 'scrollable',
        STEPS_PANEL_HIDDEN_CLASS = 'hidden',

        DISABLED_CLASS = 'disabled',
        LIST_CONTAINER_CLASS = 'container',
        LIST_CONTENT_CLASS = 'content',
        LIST_ITEM_CLASS = 'item',
        LIST_ITEM_SORTABLE_AREA = 'sortable-area',
        LIST_ITEM_SORTABLE_ICON_CONTAINER_AREA = 'sortable-icon-container',
        LIST_ITEM_SORTABLE_AREA_ICON = 'sortable-icon',
        LIST_ITEM_NUMBER_CLASS = 'number',
        LIST_ITEM_SEPARATOR_CLASS = 'list-separator',
        LIST_ITEM_ICON_CONTAINER_CLASS = 'icon-container',
        ACTION_ICON_CLASS = 'action-icon',
        ASSERTION_ICON_CLASS = 'assertion',
        LIST_ITEM_NAME_CLASS = 'name',
        ITEM_ARROW_RIGHT_CLASS = 'item-arrow-right',
        ITEM_ARROW_LEFT_CLASS = 'item-arrow-left',
        DRAGGING_ITEM_SHADOW_CLASS = 'dragging-item-shadow',

        DELETE_STEP_BUTTON_AREA_CLASS = 'delete-step-button-area',
        DELETE_STEP_BUTTON_CLASS = 'delete-step-button',
        DELETE_STEP_ICON_CLASS = 'delete-step-icon',
        DELETE_STEP_LABEL_CLASS = 'label',

        LIST_ITEM_OPENED_CLASS = 'opened',
        LIST_ITEM_SELECTED_CLASS = 'selected',
        LIST_ITEM_HIGHLIGHTED_CLASS = 'highlighted',
        FAILED_ITEM_CLASS = 'failed',

        STEP_INFO_PANEL_CLASS = 'stepInfo-panel',
        NO_STEPS_TITLE_CLASS = 'no-steps-title',
        DELETE_STEP_LABEL_TEXT = 'Delete step(s)',

        LAST_STEP_DELETION_WARNING = 'Deletion of the last step might affect the tested page\'s state making it not actual.' +
            '<br>Before adding new test steps, it is recommended to replay the test to check its integrity.',

        BLIND_CLASS = 'blind',
        BUTTONS_CLASS = 'buttons',

        DIALOG_POPUP_WIDTH = 475,
        MAXIMUM_MOUSE_MOVE_INDENT = 5;

    //Events
    exports.STEPS_INFO_CHANGED_EVENT = 'stepsInfoChanged';
    exports.ALL_STEPS_DELETED_EVENT = 'allStepsDeleted';
    exports.EDIT_ASSERTION_COMPLETE_EVENT = 'editAssertionComplete';
    exports.EDIT_ASSERTION_START_EVENT = 'editAssertionStart';
    exports.START_PICKING_ELEMENT_EVENT = 'startPickingElement';
    exports.SKIP_STEP_BUTTON_CLICK_EVENT = 'skipStepButtonClick';
    exports.REPLAY_STEP_BUTTON_CLICK_EVENT = 'replayStepButtonClick';
    exports.STEP_INFO_SHOWN_EVENT = 'stepInfoShown';
    exports.STEP_INFO_HIDDEN_EVENT = 'stepInfoHidden';
    exports.STEPS_PANEL_BLINDED_EVENT = 'stepsPanelBlinded';

    //Globals
    var eventEmitter = null,

        $stepsPanel = null,
        $stepList = null,
        $stepsContainer = null,
        $stepsContent = null,
        $deleteStepButtonArea = null,
        $deleteStepButton = null,
        $noStepsTitleDiv = null,
        scrollBar = null,
        $itemArrow = null,
        $dragItemShadow = null,
        $replayStepButton = null,
        $skipStepButton = null,

        popup = null,
        $stepInfo = null,
        step = null,

        stepsInfo = null,
        listItems = [],
        items = [],

        validateStepNum = null,
        validatedStepItem = null,

        openedStepNum = null,
        highlightedStepNum = null,
        selectedStepNums = [],
        startItemSelectionNum = null,

        playbackMode = false,
        stepHasChanges = false,
        stepPanelHasChanges = false,
        isVisible = false,
        codeEditorSelectionStarted = false,

        $window = $(window),
        updateStepInfoPanelPosition = null,
        holdStepInfo = false,
        mousedownCoordY = null,
        mousedownEvent = null;

    //Markup
    function initHandlers() {
        setListItemsHandlers();

        SortingBehavior.init($stepsContent, {
            itemClass: LIST_ITEM_CLASS,
            draggableClass: LIST_ITEM_CLASS,
            waitSortingStart: true,
            handlers: {
                onItemMoved: function ($item) {
                    scrollBar.updateScroll($item[0]);
                    $dragItemShadow.css('top', $item.offset().top - $window.scrollTop());
                },

                onMouseWheel: function (e) {
                    scrollBar.updateOnMouseWheel(e);
                },

                onDragStart: function ($item, index) {
                    selectItem(index);

                    var borderWidth = 2,
                        borderRule = borderWidth + 'px solid ' + $item.css('backgroundColor'),
                        itemOffset = $item.offset();

                    $dragItemShadow = $('<div></div>')
                        .css({
                            width: $item.width(),
                            height: $item.height(),
                            top: itemOffset.top - $window.scrollTop(),
                            left: itemOffset.left - $window.scrollLeft() - borderWidth,
                            borderLeft: borderRule,
                            borderRight: borderRule
                        })
                        .appendTo(ShadowUI.getRoot());

                    ShadowUI.addClass($dragItemShadow, DRAGGING_ITEM_SHADOW_CLASS);
                },

                onDragEnd: function (oldIndex, newIndex) {
                    $dragItemShadow.remove();
                    $dragItemShadow = null;
                    validateStepNum = null;

                    var item = stepsInfo.splice(oldIndex, 1)[0];
                    stepsInfo.splice(newIndex, 0, item);

                    item = listItems.splice(oldIndex, 1)[0];
                    listItems.splice(newIndex, 0, item);

                    item = items.splice(oldIndex, 1)[0];
                    items.splice(newIndex, 0, item);

                    if (openedStepNum !== null)
                        openedStepNum = $.inArray(getOpenedItem()[0], listItems);
                    else if (selectedStepNums.length) {
                        var $selectedItems = getSelectedItems();

                        $.each($selectedItems, function (index, item) {
                            selectedStepNums[index] = $.inArray(item, listItems);
                        });
                    }

                    if (playbackMode)
                        validateStepNum = $.inArray(validatedStepItem, listItems);

                    updateStepsNumbering();
                    UXLog.write('Steps panel: an item is moved');
                    eventEmitter.emit(exports.STEPS_INFO_CHANGED_EVENT, {});
                }
            }
        });
    }

    function createStepsPanel($container, enableHandlers) {
        $stepList = $('<div></div>').appendTo($container);
        ShadowUI.addClass($stepList, STEP_LIST_CLASS);
        ShadowUI.addClass($stepList, SCROLLABLE_CLASS);

        createStepList(enableHandlers);

        if (enableHandlers)
            initHandlers();
    }

    function createStepList(enableHandlers) {
        $stepsContainer = $('<div></div>').appendTo($stepList);
        ShadowUI.addClass($stepsContainer, LIST_CONTAINER_CLASS);

        $stepsContent = $('<div></div>').appendTo($stepsContainer);
        ShadowUI.addClass($stepsContent, LIST_CONTENT_CLASS);

        $.each(stepsInfo, function (index) {
            createItem(index);
        });

        scrollBar = new ScrollBarWidget($stepList, function () {
            if (updateStepInfoPanelPosition)
                updateStepInfoPanelPosition();
        });
        scrollBar.init($stepsContainer, $stepsContent);

        if (selectedStepNums.length && listItems.length)
            selectItem(selectedStepNums[0]);
        else
            showNoStepsTitle();

        createDeleteStepButton();

        if (listItems.length && enableHandlers)
            showDeleteStepButton();
        else
            hideDeleteStepButton();
    }

    function createItem(stepNum) {
        var stepInfo = stepsInfo[stepNum];

        var $item = $('<div></div>').appendTo($stepsContent);
        ShadowUI.addClass($item, LIST_ITEM_CLASS);

        if (stepInfo.failed)
            ShadowUI.addClass($item, FAILED_ITEM_CLASS);

        var $sortableArea = $('<div></div>').appendTo($item);
        ShadowUI.addClass($sortableArea, LIST_ITEM_SORTABLE_AREA);

        var $sortableIconContainer = $('<div></div>').appendTo($sortableArea);
        ShadowUI.addClass($sortableIconContainer, LIST_ITEM_SORTABLE_ICON_CONTAINER_AREA);

        var $sortableAreaIcon = $('<div></div>').appendTo($sortableIconContainer);
        ShadowUI.addClass($sortableAreaIcon, LIST_ITEM_SORTABLE_AREA_ICON);

        var $number = $('<div>').appendTo($sortableArea);
        ShadowUI.addClass($number, LIST_ITEM_NUMBER_CLASS);
        $number.text(stepNum + 1);

        var $separator = $('<div></div>').appendTo($sortableArea);
        ShadowUI.addClass($separator, LIST_ITEM_SEPARATOR_CLASS);

        var $icon = $('<div></div>').appendTo($item);
        ShadowUI.addClass($icon, LIST_ITEM_ICON_CONTAINER_CLASS);
        var $iconImg = $('<div></div>').appendTo($icon);

        ShadowUI.addClass($iconImg, ACTION_ICON_CLASS);

        if (stepInfo.isAssertion)
            ShadowUI.addClass($iconImg, ASSERTION_ICON_CLASS);
        else
            ShadowUI.addClass($iconImg, stepInfo.actionDescriptor.type.toLocaleLowerCase());

        var $name = $('<div></div>').appendTo($item);
        ShadowUI.addClass($name, LIST_ITEM_NAME_CLASS);
        $name.text(stepInfo.name);

        listItems.push($item[0]);
        items.push({
            $item: $item,
            $sortableArea: $sortableArea,
            $number: $number,
            $separator: $separator,
            $icon: $icon,
            $name: $name
        });
    }

    function createDeleteStepButton() {
        $deleteStepButtonArea = $('<div></div>').appendTo($stepsPanel);
        $deleteStepButton = $('<div></div>').appendTo($deleteStepButtonArea);

        var $icon = $('<div></div>').appendTo($deleteStepButton),
            $title = $('<div></div>').text(DELETE_STEP_LABEL_TEXT).appendTo($deleteStepButton);

        ShadowUI.addClass($deleteStepButtonArea, DELETE_STEP_BUTTON_AREA_CLASS);
        ShadowUI.addClass($deleteStepButton, DELETE_STEP_BUTTON_CLASS);
        ShadowUI.addClass($icon, DELETE_STEP_ICON_CLASS);
        ShadowUI.addClass($title, DELETE_STEP_LABEL_CLASS);

        ShadowUI.bind($deleteStepButton, 'click', deleteItems);
    }

    function showDeleteStepButton() {
        if ($deleteStepButtonArea)
            $deleteStepButtonArea.css('visibility', 'visible');
    }

    function hideDeleteStepButton() {
        if ($deleteStepButtonArea)
            $deleteStepButtonArea.css('visibility', 'hidden');
    }

    function showNoStepsTitle() {
        $noStepsTitleDiv = $('<div></div>').appendTo($stepsContent);
        ShadowUI.addClass($noStepsTitleDiv, NO_STEPS_TITLE_CLASS);

        $('<div></div>').appendTo($noStepsTitleDiv).text('There are');
        $('<div></div>').appendTo($noStepsTitleDiv).text('no recorded steps');
    }

    function removeNoStepsTitleDiv() {
        if ($noStepsTitleDiv && $noStepsTitleDiv.length) {
            $noStepsTitleDiv.remove();
            $noStepsTitleDiv = null;
        }
    }

    function getParentItem(el) {
        var $parents = $(el).parents(),
            $item = null;

        if (ShadowUI.hasClass($(el), LIST_ITEM_CLASS))
            return $(el);

        $.each($parents, function (index, parent) {
            if (ShadowUI.hasClass($(parent), LIST_ITEM_CLASS)) {
                $item = $(parent);
                return false;
            }
        });

        return $item;
    }

    function getOpenedItem() {
        return ShadowUI.select('.' + LIST_ITEM_CLASS + '.' + LIST_ITEM_OPENED_CLASS);
    }

    function getSelectedItems() {
        return ShadowUI.select('.' + LIST_ITEM_CLASS + '.' + LIST_ITEM_SELECTED_CLASS);
    }

    function getHighlightedItem() {
        return ShadowUI.select('.' + LIST_ITEM_CLASS + '.' + LIST_ITEM_HIGHLIGHTED_CLASS);
    }

    function updateStepsNumbering() {
        $.each(items, function (index, item) {
            if ($.trim(item.$number.text()) !== (index + 1).toString())
                item.$number.text(index + 1);
        });
    }

    function updateItemArrow() {
        var $openedItem = getOpenedItem();

        if ($itemArrow) {
            $itemArrow.remove();
            $itemArrow = null;
        }

        if (isVisible && $openedItem.length) {
            var itemOffset = $openedItem.offset(),
                itemPos = $openedItem.position(),
                isRight = popup.getPosition().left >= itemOffset.left;

            $itemArrow = $('<div></div>').appendTo(ShadowUI.getRoot());
            ShadowUI.addClass($itemArrow, isRight ? ITEM_ARROW_RIGHT_CLASS : ITEM_ARROW_LEFT_CLASS);

            if (ShadowUI.hasClass($openedItem, FAILED_ITEM_CLASS))
                ShadowUI.addClass($itemArrow, FAILED_ITEM_CLASS);

            $itemArrow.css({
                left: (isRight ? itemOffset.left + $openedItem.width() : itemOffset.left - $itemArrow.width()) - $window.scrollLeft(),
                top: itemOffset.top - $window.scrollTop()
            });

            scrollBar.setMinScroll($openedItem.height() + itemPos.top - $stepsPanel.height() + $deleteStepButtonArea[0].offsetHeight);
            scrollBar.setMaxScroll(itemPos.top);
        }
        else {
            scrollBar.setMinScroll(null);
            scrollBar.setMaxScroll(null);
        }
    }

    //Behavior
    function mousemoveEventHandler(e) {
        var coordY = e.pageY || e.y;

        if (Math.abs(coordY - mousedownCoordY) > MAXIMUM_MOUSE_MOVE_INDENT) {
            SortingBehavior.startSorting(mousedownEvent);
            mouseupEventHandler();
        }
    }

    function mouseupEventHandler() {
        mousedownEvent = null;
        mousedownCoordY = null;
        ShadowUI.unbind($stepsContent, 'mousemove', mousemoveEventHandler);
        ShadowUI.unbind($(document), 'mouseup', mouseupEventHandler);
    }

    function setListItemsHandlers() {
        ShadowUI.bind($stepsContent, 'mousedown', function (e) {
            var $curTarget = getParentItem(e.target),
                index = $curTarget && $curTarget.length ? $.inArray($curTarget[0], listItems) : -1;

            if (e.button !== Util.BUTTON.LEFT || index === -1)
                return;

            if (ShadowUI.hasClass($(e.target), LIST_ITEM_SORTABLE_AREA) || items[index].$sortableArea.has(e.target).length) {
                SortingBehavior.startSorting(e);
                return;
            }

            if (!e.ctrlKey && !e.shiftKey) {
                mousedownEvent = e;
                mousedownCoordY = e.pageY || e.y;

                ShadowUI.bind($stepsContent, 'mousemove', mousemoveEventHandler);
                ShadowUI.bind($(document), 'mouseup', mouseupEventHandler);
            }
        });

        ShadowUI.bind($stepsContent, 'click', function (e) {
            var $curTarget = getParentItem(e.target),
                index = $curTarget && $curTarget.length ? $.inArray($curTarget[0], listItems) : -1;

            if (e.button !== Util.BUTTON.LEFT || index === -1 ||
                ShadowUI.hasClass($(e.target), LIST_ITEM_SORTABLE_AREA) ||
                items[index].$sortableArea.has(e.target).length)
                return;

            if (e.ctrlKey || e.shiftKey) {
                if (!playbackMode && index !== openedStepNum) {
                    if (e.ctrlKey) {
                        if ($.inArray(index, selectedStepNums) === -1) {
                            UXLog.write('Steps panel: an item is selected');
                            addItemToSelected(index, true);
                        }
                        else if (selectedStepNums.length > 1) {
                            UXLog.write('Steps panel: an item is unselected');
                            removeItemFromSelected(index, true);
                        }

                        startItemSelectionNum = index;
                    }
                    else if ($.inArray(index, selectedStepNums) === -1 || selectedStepNums.length > 1) {
                        UXLog.write('Steps panel: several items are selected');
                        addItemsToSelected(startItemSelectionNum, index);
                    }
                }
            }
            else {
                if (openedStepNum === null || index !== openedStepNum || !popup) {
                    UXLog.write('Steps panel: an item is opened');
                    openItem(index);
                }
                else {
                    UXLog.write('Steps panel: an item is closed');
                    exports.closeItem();
                    if (playbackMode)
                        highlightItem(index);
                    else
                        selectItem(index);
                }
            }

            Util.preventDefault(e, true);
        });
    }

    function deleteItem($item) {
        var index = $.inArray($item[0], listItems),
            scrollBarTop = parseInt(scrollBar.$scrollBar.css('top').replace('px', '')),
            scrollContentTop = parseInt($stepsContent.css('top').replace('px', '')),

            itemHeight = $item.height(),
            itemMargin = Util.getElementMargin($item),

            openedStepItem = getOpenedItem(),

            isOpenedItem = index === openedStepNum;

        if (index <= validateStepNum)
            validateStepNum = null;

        if (index === stepsInfo.length - 1) {
            if (stepsInfo.length === 1)
                eventEmitter.emit(exports.ALL_STEPS_DELETED_EVENT);
            else if (!stepsInfo[index].isAssertion)
                TooltipWidget.show(LAST_STEP_DELETION_WARNING);
        }

        stepsInfo.splice(index, 1);

        if (isOpenedItem) {
            //NOTE: to save changed stepsInfo
            stepHasChanges = true;
            exports.closeItem();
        }

        $(listItems[index]).remove();
        listItems.splice(index, 1);
        items.splice(index, 1);

        updateStepsNumbering();

        if (!isOpenedItem && openedStepNum !== null)
            openedStepNum = $.inArray(openedStepItem, listItems);

        if (scrollContentTop < 0)
            $stepsContent.css('top', Math.min(scrollContentTop + itemHeight + itemMargin.top + itemMargin.bottom, 0));

        scrollBar.recalculateSize();

        if (stepsInfo.length && listItems && listItems.length) {
            index = Math.min(index, stepsInfo.length - 1);
            selectItem(index);

            //NOTE: we should  try to restore previous scroll value
            scrollBar.restoreScroll(scrollBarTop);
            scrollBar.updateScroll(listItems[index]);
        }
        else {
            selectedStepNums = [];
            startItemSelectionNum = null;
            showNoStepsTitle();
            hideDeleteStepButton();
        }
    }

    function deleteItems() {
        var $deletedItems = getSelectedItems();

        if (playbackMode || !$deletedItems.length)
            return;

        UXLog.write('Steps panel: delete step button is pressed');
        $.each($deletedItems, function (index, item) {
            deleteItem($(item));
        });


        eventEmitter.emit(exports.STEPS_INFO_CHANGED_EVENT, {});
    }

    function openItem(newIndex, stepError) {
        var $newOpenedItem = $(listItems[newIndex]),
            $oldSelectedItems = getSelectedItems(),
            $oldHighlightedItem = getHighlightedItem();

        exports.closeItem();

        openedStepNum = newIndex;
        selectedStepNums = [];
        startItemSelectionNum = newIndex;

        $.each($oldSelectedItems, function (index, item) {
            ShadowUI.removeClass($(item), LIST_ITEM_SELECTED_CLASS);
        });

        if ($oldHighlightedItem)
            ShadowUI.removeClass($oldHighlightedItem, LIST_ITEM_HIGHLIGHTED_CLASS);

        ShadowUI.addClass($newOpenedItem, LIST_ITEM_OPENED_CLASS);
        scrollBar.updateScroll($newOpenedItem[0]);

        if (stepError)
            ShadowUI.addClass($newOpenedItem, FAILED_ITEM_CLASS);

        showStepInfo(stepError);
    }

    function addItemToSelected(index, needUpdateScroll) {
        if ($.inArray(index, selectedStepNums) === -1) {
            selectedStepNums.push(index);
            ShadowUI.addClass($(listItems[index]), LIST_ITEM_SELECTED_CLASS);
        }

        if (needUpdateScroll)
            scrollBar.updateScroll($(listItems[index]));
    }

    function addItemsToSelected(startIndex, endIndex) {
        var isInverted = startIndex > endIndex,
            start = Math.min(startIndex, endIndex),
            end = Math.max(startIndex, endIndex),
            $oldSelectedItems = getSelectedItems(),
            itemIndex = null;

        $.each($oldSelectedItems, function (index, item) {
            itemIndex = $.inArray(item, listItems);

            if ((isInverted && (itemIndex > startIndex || itemIndex < endIndex)) ||
                (!isInverted && (itemIndex < startIndex || itemIndex > endIndex)))
                removeItemFromSelected(itemIndex);
        });

        for (var i = start; i <= end; i++)
            addItemToSelected(i);

        scrollBar.updateScroll($(listItems[endIndex]));
    }

    function removeItemFromSelected(index, needUpdateScroll) {
        var oldIndex = $.inArray(index, selectedStepNums);

        if (oldIndex !== -1)
            selectedStepNums.splice(oldIndex, 1);

        ShadowUI.removeClass($(listItems[index]), LIST_ITEM_SELECTED_CLASS);

        if (needUpdateScroll)
            scrollBar.updateScroll($(listItems[index]));
    }

    function selectItem(newIndex) {
        var $oldSelectedItems = getSelectedItems(),
            $oldHighlightedItem = getHighlightedItem();

        $.each($oldSelectedItems, function (index, item) {
            ShadowUI.removeClass($(item), LIST_ITEM_SELECTED_CLASS);
        });

        selectedStepNums = [];
        selectedStepNums.push(newIndex);
        startItemSelectionNum = newIndex;
        ShadowUI.addClass($(listItems[newIndex]), LIST_ITEM_SELECTED_CLASS);

        if ($oldHighlightedItem)
            ShadowUI.removeClass($oldHighlightedItem, LIST_ITEM_HIGHLIGHTED_CLASS);

        exports.closeItem();
        scrollBar.updateScroll($(listItems[newIndex]));
    }

    function highlightItem(newIndex) {
        var $newItem = $(listItems[newIndex]),
            $oldItem = getHighlightedItem(),
            $oldSelectedItems = getSelectedItems();

        highlightedStepNum = newIndex;
        selectedStepNums = [];
        startItemSelectionNum = null;

        if ($oldItem)
            ShadowUI.removeClass($oldItem, LIST_ITEM_HIGHLIGHTED_CLASS);

        $.each($oldSelectedItems, function (index, item) {
            ShadowUI.removeClass($(item), LIST_ITEM_SELECTED_CLASS);
        });

        ShadowUI.addClass($newItem, LIST_ITEM_HIGHLIGHTED_CLASS);
        scrollBar.updateScroll($newItem[0]);
    }

    function getPopupPosition($item, popupWidth) {
        var POPUP_OFFSET_TOP = -15,
            MIN_SPACE_FOR_POPUP_ON_THE_RIGHT = 90;

        var itemPos = $item.offset(),
            itemClientPos = Util.offsetToClientCoords({x: itemPos.left, y: itemPos.top}),
            itemWidth = $item.width(),
            windowWidth = $window.width(),

            left = itemClientPos.x + itemWidth,
            top = itemClientPos.y + POPUP_OFFSET_TOP,

            isLeft = (left + popupWidth > windowWidth && itemClientPos.x - popupWidth >= 0) ||
                $window.width() - left <= MIN_SPACE_FOR_POPUP_ON_THE_RIGHT;

        return {
            top: top,
            left: isLeft ? itemClientPos.x - popupWidth : left,
            minLeft: isLeft ? null : left
        };
    }

    function preventEvent(e, dispatched, prevent, cancelHandlers, stopPropagation) {
        //NOTE: we need to check is this event for ending of step list scrolling
        if (!Util.isShadowUIElement(e.target || e.srcElement) && !(e.type === 'mouseup' && scrollBar && scrollBar.state.inScroll)) {

            if (Util.isMozilla && e.type === 'mouseup' && codeEditorSelectionStarted) {
                codeEditorSelectionStarted = false;
                step.selectorEditor.codeEditor.stopSelectionProcess();
            }

            stopPropagation();
            prevent();
        }
    }

    function onPageUnload() {
        selectItem(openedStepNum);
        exports.closeItem();
    }

    function onStepPanelMousedownHandler(e, dispatched, prevent, cancelHandlers, stopPropagation) {
        var target = e.target || e.srcElement,
            $openedItem = getOpenedItem();

        if (step.selectorEditor && step.selectorEditor.codeEditor &&
            (step.selectorEditor.codeEditor.$editor[0] === e.target || step.selectorEditor.codeEditor.$editor.has(e.target).length))
            codeEditorSelectionStarted = true;

        //NOTE: we need prevent this event to prevent setting selection on testing page
        if (Util.isShadowUIElement(target) && $stepsPanel.has(target).length && !($openedItem.has(target).length || target === $openedItem[0])) {
            prevent();
            stopPropagation();
        }
    }

    function onClickOutsideStepInfoPanel(e, dispatched, prevent, cancelHandlers, stopPropagation) {
        var target = e.target || e.srcElement,
            $openedItem = getOpenedItem();

        if (!Util.isMozilla && codeEditorSelectionStarted) {
            codeEditorSelectionStarted = false;
            step.selectorEditor.codeEditor.stopSelectionProcess();
            prevent();
            stopPropagation();
        }
        else if (Util.isShadowUIElement(target)) {
            if (holdStepInfo || $stepInfo.has(target).length || ($openedItem[0] === target || $openedItem.has(target).length))
                return;
            else {
                selectItem(openedStepNum);
                UXLog.write('Steps panel: an item is closed');
                exports.closeItem();
            }
        }
        else {
            selectItem(openedStepNum);
            UXLog.write('Steps panel: an item is closed');
            exports.closeItem();
            prevent();
            stopPropagation();
        }
    }

    function showStepInfo(stepError, skipPageStateSaving) {
        $stepInfo = $('<div></div>');
        ShadowUI.addClass($stepInfo, STEP_INFO_PANEL_CLASS);

        var popupOptions = {
                width: DIALOG_POPUP_WIDTH,
                content: $stepInfo,
                footerContent: playbackMode ? createButtons() : null,
                noBordersStyle: true,
                prependToContainer: true,
                hasParentPopup: skipPageStateSaving
            },
            popupPosition = getPopupPosition(items[openedStepNum].$item, popupOptions.width);

        popup = new PopupWidget(ShadowUI.getRoot(), popupOptions);

        var validate = ((playbackMode || validateStepNum !== null) && openedStepNum === validateStepNum) ||
            (stepsInfo[openedStepNum].isAssertion && openedStepNum === stepsInfo.length - 1);

        if (stepError) {
            stepsInfo[openedStepNum].failed = true;

            if (stepError.dialog)
                stepsInfo[openedStepNum].dialogError = stepError;
        }

        if (stepsInfo[openedStepNum].isAssertion) {
            step = new AssertionsStepWidget($stepInfo, openedStepNum, stepsInfo[openedStepNum], {
                enableAssertionsValidation: validate,
                updateAssertionsState: validate && !!stepError,
                parentPopup: popup
            });

            step.on(AssertionsStepWidget.START_PICKING_ELEMENT_EVENT, function (e) {
                eventEmitter.emit(exports.START_PICKING_ELEMENT_EVENT, e);
            });

            step.on(AssertionsStepWidget.EDIT_ASSERTION_START_EVENT, function () {
                eventEmitter.emit(exports.EDIT_ASSERTION_START_EVENT, {
                    showBackground: true
                });
            });

            step.on(AssertionsStepWidget.EDIT_ASSERTION_COMPLETE_EVENT, function () {
                eventEmitter.emit(exports.EDIT_ASSERTION_COMPLETE_EVENT, {
                    hideBackground: !playbackMode
                });

                if ($replayStepButton && step.isValid(true))
                    $replayStepButton.removeAttr('disabled');
            });

            if (playbackMode)
                ModalBackground.show();
        }
        else {
            step = new ActionStepWidget($stepInfo, openedStepNum, stepsInfo[openedStepNum], {
                enableFloatMode: validate && playbackMode,
                enableSelectorValidation: validate && !(stepError && stepError.dialog), //NOTE: we should not check selector if we have dialog error, because step may lead redirect
                enableElementsMarking: validate && playbackMode,
                stretchSelectorEditor: true,
                allowVisibleElementsOnly: true,
                dialogError: validate ? stepError : null
            });

            step.on(ActionStepWidget.SELECTOR_EDITOR_FOCUSED_EVENT, function () {
                setBlind(true);
                holdStepInfo = true;
            });

            step.on(ActionStepWidget.SELECTOR_EDITOR_BLURED_EVENT, function () {
                setBlind(false);
                holdStepInfo = false;
            });

            if (playbackMode) {
                if (openedStepNum !== validateStepNum)
                    ModalBackground.show();
                else
                    ModalBackground.hide();
            }
            else
                step.$step.css('paddingBottom', '18px');

            popup.$content.css('minHeight', '234px');
        }

        step.on(BaseStepWidget.STEP_NAME_CHANGED_EVENT, function (e) {
            stepHasChanges = true;
            stepPanelHasChanges = true;
            items[openedStepNum].$name.text(e.name);
        });

        step.on(BaseStepWidget.STEP_INFO_CHANGED_EVENT, function () {
            stepHasChanges = true;
            stepPanelHasChanges = true;

            if (!step.isValid(openedStepNum !== validateStepNum)) {
                ShadowUI.addClass(items[openedStepNum].$item, FAILED_ITEM_CLASS);

                if ($itemArrow)
                    ShadowUI.addClass($itemArrow, FAILED_ITEM_CLASS);

                stepsInfo[openedStepNum].failed = true;
                stepsInfo[openedStepNum].error = !step.isValid(true);

                if ($replayStepButton)
                    $replayStepButton.attr('disabled', 'disabled');

                if ($skipStepButton && (!stepsInfo[openedStepNum].isAssertion || !stepsInfo[openedStepNum].blocks.length))
                    $skipStepButton.attr('disabled', 'disabled');
            }
            else {
                var isAssertionsValid = true;

                if (stepsInfo[openedStepNum].isAssertion) {
                    for (var i = 0; i < stepsInfo[openedStepNum].blocks.length && isAssertionsValid; i++) {
                        for (var j = 0; j < stepsInfo[openedStepNum].blocks[i].assertions.length; j++) {
                            if (stepsInfo[openedStepNum].blocks[i].assertions[j].failed)
                                isAssertionsValid = false;
                        }
                    }
                }

                if (!playbackMode && isAssertionsValid) {
                    ShadowUI.removeClass(items[openedStepNum].$item, FAILED_ITEM_CLASS);

                    if ($itemArrow)
                        ShadowUI.removeClass($itemArrow, FAILED_ITEM_CLASS);

                    if (step && step.dialogsEditor)
                        step.dialogsEditor.removeError();
                }

                stepsInfo[openedStepNum].failed = !isAssertionsValid;
                stepsInfo[openedStepNum].error = false;

                if ($replayStepButton)
                    $replayStepButton.removeAttr('disabled');

                if ($skipStepButton)
                    $skipStepButton.removeAttr('disabled');
            }

            eventEmitter.emit(exports.STEPS_INFO_CHANGED_EVENT, {
                draft: true
            });
        });

        popup.moveTo(popupPosition.left, popupPosition.top, popupPosition.minLeft);
        popupPosition = popup.getPosition();

        if (!updateStepInfoPanelPosition) {
            updateStepInfoPanelPosition = function () {
                var requiredPopupPosition = getPopupPosition(items[openedStepNum].$item, popupOptions.width),
                    currentPosition = popup.getPosition();

                if (requiredPopupPosition.left !== currentPosition.left || requiredPopupPosition.top !== currentPosition.top) {
                    popupPosition = requiredPopupPosition;
                    popup.moveTo(popupPosition.left, popupPosition.top, popupPosition.minLeft);
                    updateItemArrow();
                }
            };

            ShadowUI.bind($window, 'resize', updateStepInfoPanelPosition);
        }

        updateItemArrow();
        eventEmitter.emit(exports.STEP_INFO_SHOWN_EVENT, {
            $el: popup ? popup.$popup : null
        });

        if (!playbackMode) {
            EventSandbox.addInternalEventListener(window, ['mousedown'], onStepPanelMousedownHandler);
            EventSandbox.addInternalEventListener(window, ['click'], onClickOutsideStepInfoPanel);
            EventSandbox.addInternalEventListener(window, ['unload'], onPageUnload);
            EventSandbox.addInternalEventListener(window, Util.RECORDING_LISTENED_EVENTS, preventEvent);
        }
    }

    function createButtons() {
        var $buttons = $('<div></div>');
        ShadowUI.addClass($buttons, BUTTONS_CLASS);

        if (playbackMode) {
            var curStep = openedStepNum;

            $skipStepButton = ButtonWidget.create($buttons, 'Skip step');
            $replayStepButton = ButtonWidget.create($buttons, 'Replay step').attr('disabled', 'disabled');

            ShadowUI.bind($skipStepButton, 'click', function () {
                exports.closeItem();
                highlightItem(curStep);
                eventEmitter.emit(exports.SKIP_STEP_BUTTON_CLICK_EVENT, {
                    hasChanges: stepPanelHasChanges
                });
                stepPanelHasChanges = false;
            });

            ShadowUI.bind($replayStepButton, 'click', function () {
                exports.closeItem();
                highlightItem(curStep);

                ShadowUI.removeClass(items[validateStepNum].$item, FAILED_ITEM_CLASS);

                eventEmitter.emit(exports.REPLAY_STEP_BUTTON_CLICK_EVENT, {
                    hasChanges: stepPanelHasChanges
                });
                stepPanelHasChanges = false;
            });
        }

        return $buttons;
    }

    function hideStepInfo() {
        var callback = function () {
            popup = null;

            if (step)
                step.destroy();

            if (stepHasChanges) {
                UXLog.write('Steps panel: step info is changed');
                eventEmitter.emit(exports.STEPS_INFO_CHANGED_EVENT, {});
            }

            stepHasChanges = false;

            if (playbackMode)
                ModalBackground.hide();

            if (updateStepInfoPanelPosition)
                ShadowUI.unbind($window, 'resize', updateStepInfoPanelPosition);
            updateStepInfoPanelPosition = null;
        };

        if (popup) {
            popup.close(callback);
            eventEmitter.emit(exports.STEP_INFO_HIDDEN_EVENT, {
                editingFinished: openedStepNum === null
            });
            EventSandbox.removeInternalEventListener(window, ['click'], onClickOutsideStepInfoPanel);
            EventSandbox.removeInternalEventListener(window, ['mousedown'], onStepPanelMousedownHandler);
            EventSandbox.removeInternalEventListener(window, ['unload'], onPageUnload);
            EventSandbox.removeInternalEventListener(window, Util.RECORDING_LISTENED_EVENTS, preventEvent);
        }
        else
            callback();
    }

    function onBeforeItemClosed() {
        var $oldOpenedItem = getOpenedItem();

        if ($oldOpenedItem.length)
            ShadowUI.removeClass($oldOpenedItem, LIST_ITEM_OPENED_CLASS);
    }

    function setBlind(blind) {
        popup.blind(blind);

        if ($itemArrow) {
            if (blind)
                ShadowUI.addClass($itemArrow, BLIND_CLASS);
            else
                ShadowUI.removeClass($itemArrow, BLIND_CLASS);
        }

        eventEmitter.emit(exports.STEPS_PANEL_BLINDED_EVENT, {
            blind: blind
        });
    }

    //API
    exports.init = function ($container, options) {
        eventEmitter = new Util.EventEmitter();
        isVisible = options.show;

        stepsInfo = options.stepsInfo;

        if (stepsInfo && stepsInfo.length)
            selectedStepNums.push(stepsInfo.length - 1);

        $stepsPanel = $('<div></div>').appendTo($container || ShadowUI.getRoot());
        ShadowUI.addClass($stepsPanel, STEPS_PANEL_CLASS);

        if (!options.show)
            ShadowUI.addClass($stepsPanel, STEPS_PANEL_HIDDEN_CLASS);

        createStepsPanel($stepsPanel, options.enableHandlers);

        if (!options.enableHandlers)
            ShadowUI.addClass($stepsPanel, DISABLED_CLASS);
    };

    exports.events = {
        on: function (ev, listener) {
            eventEmitter.on(ev, listener);
        }
    };

    exports.activateInteractive = function () {
        initHandlers();
        showDeleteStepButton();
        ShadowUI.removeClass($stepsPanel, DISABLED_CLASS);
    };

    exports.turnOffPlaybackMode = function () {
        playbackMode = false;
        validateStepNum = null;
        validatedStepItem = null;
        SortingBehavior.resumeSorting();

        if (stepsInfo && stepsInfo.length)
            selectItem(stepsInfo.length - 1);
    };

    exports.openStepWithError = function (stepNum, error, recordingMode) {
        isVisible = true;

        playbackMode = !recordingMode;
        validateStepNum = stepNum;
        validatedStepItem = listItems[stepNum];

        if ($stepsPanel && $stepsPanel.length)
            ShadowUI.removeClass($stepsPanel, STEPS_PANEL_HIDDEN_CLASS);

        if (!recordingMode)
            SortingBehavior.stopSorting();

        openItem(stepNum, error);
    };

    exports.hide = function () {
        isVisible = false;

        if ($stepsPanel && $stepsPanel.length) {
            ShadowUI.addClass($stepsPanel, STEPS_PANEL_HIDDEN_CLASS);

            if (openedStepNum !== null) {
                hideStepInfo();
                updateItemArrow();
            }
        }
    };

    exports.show = function (skipPageStateSaving) {
        isVisible = true;

        if ($stepsPanel && $stepsPanel.length) {
            ShadowUI.removeClass($stepsPanel, STEPS_PANEL_HIDDEN_CLASS);

            scrollBar.recalculateSize();

            var $selectedItems = getSelectedItems();
            if ($selectedItems.length)
                scrollBar.updateScroll($selectedItems.last()[0]);

            if (openedStepNum !== null) {
                showStepInfo(null, skipPageStateSaving);
                updateItemArrow();
            }
        }
    };

    exports.addItem = function () {
        var newItemIndex = stepsInfo.length - 1;
        validateStepNum = null;

        removeNoStepsTitleDiv();
        createItem(newItemIndex);
        showDeleteStepButton();

        scrollBar.recalculateSize();
        selectItem(newItemIndex);
    };

    exports.highlightItem = function (itemNum) {
        if (itemNum >= listItems.length)
            return;

        if (itemNum !== highlightedStepNum)
            highlightItem(itemNum);
    };

    exports.closeItem = function () {
        if (openedStepNum !== null) {
            onBeforeItemClosed();
            openedStepNum = null;
            updateItemArrow();
            hideStepInfo();

            if ($replayStepButton)
                $replayStepButton.remove();

            if ($skipStepButton)
                $skipStepButton.remove();
        }
    };

    exports.isVisible = function () {
        return !ShadowUI.hasClass($stepsPanel, STEPS_PANEL_HIDDEN_CLASS);
    };

    exports.updateStepInfoPanelPosition = function () {
        if (updateStepInfoPanelPosition)
            updateStepInfoPanelPosition();
    };

    exports.updateSteps = function () {
        for (var i = 0; i < items.length; i++) {
            if (stepsInfo[i].failed)
                ShadowUI.addClass(items[i].$item, FAILED_ITEM_CLASS);
            else
                ShadowUI.removeClass(items[i].$item, FAILED_ITEM_CLASS);
        }
    };
});
TestCafeClient.define('UI.RecorderWidgets.Tabs', function () {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI;

    var TABS_PANEL_CLASS = 'tabs-panel',
        TAB_CLASS = 'tab',
        SELECTED_CLASS = 'selected';

    var Tabs = this.exports = function ($container, options) {
        var tabs = this;

        this.titles = options.titles || [];
        this.getContentCallback = options.getContentCallback || null;

        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            tabs.eventEmitter.on(ev, listener);
        };

        this.$tabs = [];
        this.$contentContainer = null;
        this.$contents = [];
        this.activeTabIndex = -1;

        this._createTabs($container);
        this._createContentContainer($container);

        this._init();
    };

    function _createTab($container, text) {
        var $tab = $('<div></div>').text(text).appendTo($container);
        ShadowUI.addClass($tab, TAB_CLASS);

        var $underline = $('<div></div>').appendTo($tab);
        ShadowUI.addClass($underline, 'tab-underline');

        return $tab;
    }

    Tabs.prototype._createTabs = function ($container) {
        var $panel = $('<div></div>').appendTo($container);
        ShadowUI.addClass($panel, TABS_PANEL_CLASS);

        for (var i = 0; i < this.titles.length; i++)
            this.$tabs.push(_createTab($panel, this.titles[i]));
    };

    Tabs.prototype._createContentContainer = function ($container) {
        this.$contentContainer = $('<div></div>').appendTo($container);

        for (var i = 0; i < this.titles.length; i++)
            this.$contents.push($('<div></div>').css('display', 'none').appendTo(this.$contentContainer));
    };

    Tabs.prototype._init = function () {
        var tabs = this;

        $.each(this.$tabs, function (index, $tab) {
            $tab.click(function () {
                tabs._selectTab(index);
            });
        });

        this._selectTab(0);
    };

    Tabs.prototype._selectTab = function (index) {
        var tabs = this,
            prevActiveTabIndex = this.activeTabIndex,
            $activeContent = this.$contents[index];

        function hidePrevTab() {
            if (prevActiveTabIndex > -1) {
                tabs.$contents[prevActiveTabIndex].css('display', 'none');
                ShadowUI.removeClass(tabs.$tabs[prevActiveTabIndex], SELECTED_CLASS);
            }
        }

        this.activeTabIndex = index;
        if (!$activeContent.data('filled') && typeof this.getContentCallback === 'function') {
            this.getContentCallback(this.activeTabIndex, function ($content, callback) {
                $content.appendTo($activeContent);

                hidePrevTab();
                tabs.$contents[tabs.activeTabIndex].css('display', '');

                callback();
            });

            $activeContent.data('filled', true);
        }
        else {
            hidePrevTab();
            this.$contents[this.activeTabIndex].css('display', '');
        }

        ShadowUI.addClass(this.$tabs[this.activeTabIndex], SELECTED_CLASS);
    };
});
TestCafeClient.define('UI.RecorderWidgets.Toolbar', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        Settings = require('Settings'),
        TextSelection = Hammerhead.TextSelection,
        DraggingBehavior = require('UI.DraggingBehavior'),
        StepsPanel = require('UI.RecorderWidgets.StepsPanel'),

        UXLog = require('UI.UXLog');

    var ADD_HOVER_ACTION_TITLE = 'Add a step containing the hover action',
        ADD_WAIT_ACTION_TITLE = 'Add a step containing the wait action',
        ADD_ASSERTIONS_TITLE = 'Add a step containing one or more assertions',
        ADD_SCREENSHOT_TITLE = 'Add a step containing the screenshot action',
        ADD_SCREENSHOT_TITLE_LINUX = 'This action is not supported in the Linux version',
        RUN_PLAYBACK_TITLE = 'Playback the test step by step from the beginning',
        DISABLE_SAVE_TEST_TITLE = 'No changes to save',
        DISABLE_PLAYBACK_TEST_TITLE = 'No steps to playback',
        HAS_INCORRECT_STEP_PLAYBACK_TITLE = 'Cannot start playback due to one or more incorrect step(s)',
        HAS_INCORRECT_STEP_SAVE_TEST_TITLE = 'Cannot save the test due to one or more incorrect step(s)',
        SAVE_TEST_TITLE = 'Save the test',
        EXIT_TITLE = 'Exit test recording',
        EXPAND_BUTTON_SHOW_STEPS_TITLE = 'Display a list of the recorded steps',
        EXPAND_BUTTON_HIDE_STEPS_TITLE = 'Hide a list of the recorded steps',

        ADD_HOVER_ACTION_TEXT = 'Add hover',
        ADD_WAIT_ACTION_TEXT = 'Add wait',
        ADD_ASSERTIONS_TEXT = 'Add assertions',
        ADD_SCREENSHOT_TEXT = 'Add screenshot',
        RUN_PLAYBACK_TEXT = 'Playback',
        SAVE_TEST_TEXT = 'Save',
        EXIT_TEXT = 'Exit',
        SHOW_STEPS_TEXT = 'Show steps',
        HIDE_STEPS_TEXT = 'Hide steps',

        TOOLBAR_AREA_CLASS = 'toolbar-area',
        TOOLBAR_CLASS = 'toolbar',
        TOOLBAR_TOP_CONTAINER_CLASS = 'top-container',
        DRAG_AREA_CLASS = 'drag-area',
        TEST_CAFE_LOGO_CLASS = 'logo-icon',
        STATE_ICON_CLASS = 'state-icon',
        RECORD_ICON_CLASS = 'icon record',
        PLAYBACK_ICON_CLASS = 'icon playback',
        DISABLE_BUTTON_AREA_CLASS = 'disable',
        BUTTON_BAR_CLASS = 'button-bar',
        BUTTON_BAR_CONTENT_CLASS = 'content',
        BUTTONS_CONTAINER = 'buttons-container',
        ADD_ACTIONS_AREA_CLASS = 'add-actions-area',
        BOTTOM_BUTTONS_AREA_CLASS = 'bottom-buttons-area',
        SHOW_STEPS_BUTTON_AREA_CLASS = 'show-steps-buttons-area',
        HIDE_STEPS_BUTTON_AREA_CLASS = 'hide-steps-buttons-area',
        BUTTON_AREA_CLASS = 'button-area',
        AREA_TITLE_CLASS = 'title',
        SEPARATOR_CLASS = 'separator',

        CLEAR_CLASS = 'clear',
        TOOLBAR_HIDDEN_CLASS = 'hidden',
        TOOLBAR_BLINDED_CLASS = 'blind',
        BUTTONS_BAR_HIDDEN_CLASS = 'buttons-hidden',

        ACTION_INDICATOR_CLASS = 'action-indicator',
        ACTION_ICON_CLASS = 'action-icon',
        INDICATOR_WIDE_SIZE = 'wide-size',

        ADD_HOVER_ACTION_ICON_CLASS = 'toolbar-icon hover',
        ADD_WAIT_ACTION_ICON_CLASS = 'toolbar-icon wait',
        ADD_ASSERTIONS_ICON_CLASS = 'toolbar-icon add-assertions',
        ADD_SCREENSHOT_ICON_CLASS = 'toolbar-icon screenshot',
        RUN_PLAYBACK_ICON_CLASS = 'toolbar-icon playback',
        SAVE_TEST_ICON_CLASS = 'toolbar-icon save',
        EXIT_ICON_CLASS = 'toolbar-icon exit',
        SHOW_STEPS_ICON_CLASS = 'toolbar-icon show-steps',
        HIDE_STEPS_ICON_CLASS = 'toolbar-icon hide-steps',

        TOOLBAR_ELEMENTS_FADING_DELAY = 2000,
        ACTION_INDICATOR_FADING_TIME = 3000;

    //Events
    exports.ADD_HOVER_ACTION_BUTTON_PRESSED_EVENT = 'addHoverActionButtonPressed';
    exports.ADD_WAIT_ACTION_BUTTON_PRESSED_EVENT = 'addWaitActionButtonPressed';
    exports.ADD_ASSERTIONS_STEP_EVENT = 'addAssertionsStepButtonPressed';
    exports.ADD_SCREENSHOT_ACTION_BUTTON_PRESSED_EVENT = 'addScreenshotActionButtonPressed';
    exports.RUN_PLAYBACK_BUTTON_PRESSED_EVENT = 'runPlaybackButtonPressed';
    exports.SAVE_TEST_BUTTON_PRESSED_EVENT = 'saveTestButtonPressed';
    exports.EXIT_RECORDING_BUTTON_PRESSED_EVENT = 'exitRecordingButtonPressed';
    exports.TOOLBAR_MOVED_EVENT = 'toolbarMoved';
    exports.STEPS_PANEL_VISIBILITY_CHANGED = 'stepsPanelVisibilityChanged';

    //Globals
    var eventEmitter = null,
        draggingBehavior = null,
        dragging = false,
        prevActiveElement = null,
        prevSelectionStart = null,
        prevSelectionEnd = null,
        prevSelectionInverse = null,
        $toolbarArea = null,
        $toolbar = null,
        $topContainer = null,
        $dragArea = null,
        $stateIcon = null,
        $buttonBar = null,

        $addHoverActionArea = null,
        $addWaitActionArea = null,
        $addAssertionArea = null,
        $addScreenshotActionArea = null,
        $runPlaybackArea = null,
        $saveTestArea = null,
        $exitRecordingArea = null,
        $expandStepsArea = null,

        buttonShortcuts = null;

    //Util
    function getButtonTitlePostfix(shortcut) {
        return shortcut ? ' (' + shortcut + ')' : '';
    }

    //Markup
    function addClearElement($to) {
        ShadowUI.addClass($('<div></div>').appendTo($to), CLEAR_CLASS);
    }

    function createDragArea() {
        $dragArea = $('<div></div>').appendTo($topContainer);
        ShadowUI.addClass($dragArea, DRAG_AREA_CLASS);

        var $logotype = $('<div></div>').appendTo($dragArea);
        ShadowUI.addClass($logotype, TEST_CAFE_LOGO_CLASS);

        $stateIcon = $('<div></div>').appendTo($dragArea);
        ShadowUI.addClass($stateIcon, STATE_ICON_CLASS);
    }

    function createSeparator($parent, isVertical) {
        var $separator = $('<div></div>').appendTo($parent);
        ShadowUI.addClass($separator, SEPARATOR_CLASS);

        if (isVertical)
            ShadowUI.addClass($separator, 'vertical');
    }

    function createButtonArea($parent, areaTitle, iconClass, title) {
        var $buttonArea = $('<div></div>').appendTo($parent);
        ShadowUI.addClass($buttonArea, BUTTON_AREA_CLASS);
        $buttonArea.attr('title', areaTitle);

        var $icon = $('<div></div>').appendTo($buttonArea);
        ShadowUI.addClass($icon, iconClass);

        var $span = $('<span></span>').html(title).appendTo($buttonArea);
        ShadowUI.addClass($span, AREA_TITLE_CLASS);

        return $buttonArea;
    }

    function createButtonBar() {
        $buttonBar = $('<div></div>').appendTo($topContainer);
        ShadowUI.addClass($buttonBar, BUTTON_BAR_CLASS);

        addClearElement($toolbar);

        var $buttonBarContent = $('<div></div>').appendTo($buttonBar);
        ShadowUI.addClass($buttonBarContent, BUTTON_BAR_CONTENT_CLASS);

        var $topButtonsArea = $('<div></div>').appendTo($buttonBarContent);
        ShadowUI.addClass($topButtonsArea, BUTTONS_CONTAINER);
        ShadowUI.addClass($topButtonsArea, ADD_ACTIONS_AREA_CLASS);

        $addAssertionArea = createButtonArea($topButtonsArea, ADD_ASSERTIONS_TITLE + getButtonTitlePostfix(buttonShortcuts.addAssertion), ADD_ASSERTIONS_ICON_CLASS, ADD_ASSERTIONS_TEXT);
        $addHoverActionArea = createButtonArea($topButtonsArea, ADD_HOVER_ACTION_TITLE + getButtonTitlePostfix(buttonShortcuts.addHover), ADD_HOVER_ACTION_ICON_CLASS, ADD_HOVER_ACTION_TEXT);
        $addWaitActionArea = createButtonArea($topButtonsArea, ADD_WAIT_ACTION_TITLE + getButtonTitlePostfix(buttonShortcuts.addWait), ADD_WAIT_ACTION_ICON_CLASS, ADD_WAIT_ACTION_TEXT);

        var addScreenshotTitle = Settings.LINUX_PLATFORM ?
            ADD_SCREENSHOT_TITLE_LINUX :
            ADD_SCREENSHOT_TITLE + getButtonTitlePostfix(buttonShortcuts.addScreenshot);

        $addScreenshotActionArea = createButtonArea($topButtonsArea, addScreenshotTitle, ADD_SCREENSHOT_ICON_CLASS, ADD_SCREENSHOT_TEXT);

        if (Settings.LINUX_PLATFORM)
            ShadowUI.addClass($addScreenshotActionArea, DISABLE_BUTTON_AREA_CLASS);

        createSeparator($buttonBarContent);

        var $bottomButtonsArea = $('<div></div>').appendTo($buttonBarContent);
        ShadowUI.addClass($bottomButtonsArea, BUTTONS_CONTAINER);
        ShadowUI.addClass($bottomButtonsArea, BOTTOM_BUTTONS_AREA_CLASS);

        $runPlaybackArea = createButtonArea($bottomButtonsArea, RUN_PLAYBACK_TITLE + getButtonTitlePostfix(buttonShortcuts.playback), RUN_PLAYBACK_ICON_CLASS, RUN_PLAYBACK_TEXT);
        createSeparator($bottomButtonsArea, true);
        $saveTestArea = createButtonArea($bottomButtonsArea, '', SAVE_TEST_ICON_CLASS, SAVE_TEST_TEXT);
        createSeparator($bottomButtonsArea, true);
        $exitRecordingArea = createButtonArea($bottomButtonsArea, EXIT_TITLE + getButtonTitlePostfix(buttonShortcuts.exitRecording), EXIT_ICON_CLASS, EXIT_TEXT);

        createSeparator($buttonBarContent);
    }

    function createToolbarArea($recorder, toolbarPosition) {
        $toolbarArea = $('<div></div>').appendTo($recorder);
        ShadowUI.addClass($toolbarArea, TOOLBAR_AREA_CLASS);

        if (toolbarPosition && toolbarPosition.left && toolbarPosition.top) {
            $toolbarArea.css({
                left: toolbarPosition.left,
                top: toolbarPosition.top
            });
        }
    }

    function createToolbar(stepsInfo, showSteps, enableStepListInteractive) {
        $toolbar = $('<div></div>').appendTo($toolbarArea);
        ShadowUI.addClass($toolbar, TOOLBAR_CLASS);

        $topContainer = $('<div></div>').appendTo($toolbar);
        ShadowUI.addClass($topContainer, TOOLBAR_TOP_CONTAINER_CLASS);

        createDragArea();
        addClearElement($topContainer);
        createButtonBar(stepsInfo, showSteps, enableStepListInteractive);

        var $expandStepsButtonArea = $('<div></div>').appendTo($topContainer);
        ShadowUI.addClass($expandStepsButtonArea, BUTTONS_CONTAINER);
        ShadowUI.addClass($expandStepsButtonArea, showSteps ? HIDE_STEPS_BUTTON_AREA_CLASS : SHOW_STEPS_BUTTON_AREA_CLASS);

        $expandStepsArea = showSteps ?
            createButtonArea($expandStepsButtonArea, EXPAND_BUTTON_HIDE_STEPS_TITLE, HIDE_STEPS_ICON_CLASS, HIDE_STEPS_TEXT) :
            createButtonArea($expandStepsButtonArea, EXPAND_BUTTON_SHOW_STEPS_TITLE, SHOW_STEPS_ICON_CLASS, SHOW_STEPS_TEXT);

        addClearElement($buttonBar);

        StepsPanel.init($toolbar, {
            stepsInfo: stepsInfo,
            show: showSteps,
            enableHandlers: enableStepListInteractive
        });
    }

    function createActionIndicator(action) {
        var $indicator = $('<div></div>').appendTo($toolbarArea);
        ShadowUI.addClass($indicator, ACTION_INDICATOR_CLASS);

        $('<span></span>').html(action.charAt(0).toUpperCase() + action.slice(1)).appendTo($indicator);

        if (action === 'beforeUnload')
            ShadowUI.addClass($indicator, INDICATOR_WIDE_SIZE);

        var $icon = $('<div></div>').appendTo($indicator);
        ShadowUI.addClass($icon, ACTION_ICON_CLASS);
        ShadowUI.addClass($icon, action);

        return $indicator;
    }

    //Behavior
    function checkWindowSize() {
        var moved = false;
        window.setTimeout(function () {
            var $window = $(window),
                windowWidth = $window.width(),
                windowHeight = $window.height(),
                offset = Util.getOffsetPosition($toolbar[0]),
                clientOffset = Util.offsetToClientCoords({x: offset.left, y: offset.top}),
                toolbarHeight = $toolbar.height(),
                toolbarWidth = $toolbar.width();

            if (clientOffset.x + toolbarWidth > windowWidth) {
                $toolbarArea.css('left', Math.max(windowWidth - toolbarWidth, 0));
                moved = true;
            }

            if (clientOffset.y + toolbarHeight > windowHeight) {
                $toolbarArea.css('top', Math.max(windowHeight - toolbarHeight, 0));
                moved = true;
            }

            if (moved) {
                StepsPanel.updateStepInfoPanelPosition();

                eventEmitter.emit(exports.TOOLBAR_MOVED_EVENT, {toolbarPosition: {
                    left: $toolbarArea.css('left'),
                    top: $toolbarArea.css('top')
                }});
            }
        }, 0);
    }

    function initDragging() {
        draggingBehavior = new DraggingBehavior($dragArea, $toolbarArea, {
            onDragStart: function () {
                if (!Settings.PLAYBACK)
                    StepsPanel.closeItem();

                dragging = true;
            },
            onMove: function () {
                if (Settings.PLAYBACK)
                    StepsPanel.updateStepInfoPanelPosition();
            },
            onDragEnd: function () {
                dragging = false;
                eventEmitter.emit(exports.TOOLBAR_MOVED_EVENT, {toolbarPosition: {
                    left: $toolbarArea.css('left'),
                    top: $toolbarArea.css('top')
                }});
            }
        });
    }

    function hideSteps() {
        StepsPanel.hide();
        exports.updateExpandStepsButtonAppearance();

        eventEmitter.emit(exports.STEPS_PANEL_VISIBILITY_CHANGED, {
            shown: false
        });
    }

    function showSteps() {
        StepsPanel.show();
        exports.updateExpandStepsButtonAppearance(true);

        eventEmitter.emit(exports.STEPS_PANEL_VISIBILITY_CHANGED, {
            shown: true
        });
    }

    function runPlayback() {
        UXLog.write('Toolbar: run playback button is pressed');
        eventEmitter.emit(exports.RUN_PLAYBACK_BUTTON_PRESSED_EVENT, {});
    }

    function exitRecording() {
        UXLog.write('Toolbar: exit button is pressed');
        eventEmitter.emit(exports.EXIT_RECORDING_BUTTON_PRESSED_EVENT);
    }

    function exitRecordingWithErrors() {
        UXLog.write('Toolbar: exit recording button is pressed but there is an error in the steps');
        eventEmitter.emit(exports.EXIT_RECORDING_BUTTON_PRESSED_EVENT, {
            hasErrors: true
        });
    }

    function initButtons() {
        ShadowUI.bind($toolbarArea, 'mousedown', function (e) {
            prevActiveElement = Util.getActiveElement();

            if (Util.isTextEditableElement(prevActiveElement)) {
                prevSelectionStart = TextSelection.getSelectionStart(prevActiveElement);
                prevSelectionEnd = TextSelection.getSelectionEnd(prevActiveElement);
                prevSelectionInverse = TextSelection.hasInverseSelection(prevActiveElement);
            }

            if (!Util.isShadowUIElement(prevActiveElement))
                Util.preventDefault(e, true);
        });

        ShadowUI.bind($addHoverActionArea, 'click', function () {
            UXLog.write('Toolbar: add hover action button is pressed');
            eventEmitter.emit(exports.ADD_HOVER_ACTION_BUTTON_PRESSED_EVENT, {
                prevActiveElement: prevActiveElement,
                prevSelectionStart: prevSelectionStart,
                prevSelectionEnd: prevSelectionEnd,
                prevSelectionInverse: prevSelectionInverse
            });
        });

        ShadowUI.bind($addWaitActionArea, 'click', function () {
            UXLog.write('Toolbar: add wait action button is pressed');
            eventEmitter.emit(exports.ADD_WAIT_ACTION_BUTTON_PRESSED_EVENT, {
                prevActiveElement: prevActiveElement,
                prevSelectionStart: prevSelectionStart,
                prevSelectionEnd: prevSelectionEnd,
                prevSelectionInverse: prevSelectionInverse
            });
        });

        ShadowUI.bind($addScreenshotActionArea, 'click', function () {
            if (ShadowUI.hasClass($addScreenshotActionArea, DISABLE_BUTTON_AREA_CLASS))
                return;

            UXLog.write('Toolbar: add screenshot action button is pressed');
            eventEmitter.emit(exports.ADD_SCREENSHOT_ACTION_BUTTON_PRESSED_EVENT, {
                prevActiveElement: prevActiveElement,
                prevSelectionStart: prevSelectionStart,
                prevSelectionEnd: prevSelectionEnd,
                prevSelectionInverse: prevSelectionInverse
            });
        });

        ShadowUI.bind($addAssertionArea, 'click', function () {
            UXLog.write('Toolbar: add assertion button is pressed');
            eventEmitter.emit(exports.ADD_ASSERTIONS_STEP_EVENT, {
                prevActiveElement: prevActiveElement,
                prevSelectionStart: prevSelectionStart,
                prevSelectionEnd: prevSelectionEnd,
                prevSelectionInverse: prevSelectionInverse
            });
        });

        ShadowUI.bind($expandStepsArea, 'click', function () {
            if (ShadowUI.hasClass($expandStepsArea, DISABLE_BUTTON_AREA_CLASS))
                return;

            if (StepsPanel.isVisible()) {
                UXLog.write('Toolbar: hide steps button is pressed');
                hideSteps();
            }
            else {
                UXLog.write('Toolbar: show steps button is pressed');
                showSteps();
            }
        });
    }

    function initActionIndicator($indicator) {
        window.setTimeout(function () {
            $indicator.fadeOut(ACTION_INDICATOR_FADING_TIME, function () {
                $indicator.remove();
            });
        }, TOOLBAR_ELEMENTS_FADING_DELAY);
    }

    function saveTestButtonClickHandler() {
        UXLog.write('Toolbar: save button is pressed');
        eventEmitter.emit(exports.SAVE_TEST_BUTTON_PRESSED_EVENT, {});
    }

    //API
    exports.init = function ($recorder, options) {
        var optionsDefault = {
                stepsInfo: [],
                hasChanges: false,
                toolbarPosition: {left: 0, top: 0},
                collapsedMode: false,
                shortcuts: {},
                showSteps: true,
                enableStepListInteractive: true
            },
            opt = options || optionsDefault;

        eventEmitter = new Util.EventEmitter();
        buttonShortcuts = opt.shortcuts || {};

        if (!$toolbarArea) {
            createToolbarArea($recorder, opt.toolbarPosition);
            createToolbar(opt.stepsInfo, opt.showSteps, opt.enableStepListInteractive);
            initDragging();
            initButtons();
            //NOTE: init window resize
            ShadowUI.bind($(window), 'resize', checkWindowSize);
        }

        exports.updateState(opt.hasChanges, !!opt.stepsInfo.length);

        if (opt.collapsedMode)
            exports.collapse();
        else
            exports.expand();
    };

    exports.events = {
        on: function (ev, listener) {
            eventEmitter.on(ev, listener);
        }
    };


    exports.expand = function () {
        ShadowUI.removeClass($stateIcon, PLAYBACK_ICON_CLASS);
        ShadowUI.addClass($stateIcon, RECORD_ICON_CLASS);
        ShadowUI.removeClass($topContainer, BUTTONS_BAR_HIDDEN_CLASS);
    };

    exports.collapse = function () {
        ShadowUI.removeClass($stateIcon, RECORD_ICON_CLASS);
        ShadowUI.addClass($stateIcon, PLAYBACK_ICON_CLASS);
        ShadowUI.addClass($topContainer, BUTTONS_BAR_HIDDEN_CLASS);
    };

    exports.hide = function () {
        if ($toolbarArea) {
            ShadowUI.addClass($toolbarArea, TOOLBAR_HIDDEN_CLASS);
            draggingBehavior.resetDragging();
            ShadowUI.unbind($(window), 'resize', checkWindowSize);
        }
    };

    exports.show = function () {
        ShadowUI.removeClass($toolbarArea, TOOLBAR_HIDDEN_CLASS);
        checkWindowSize();
        draggingBehavior.restoreDragging();
        ShadowUI.bind($(window), 'resize', checkWindowSize);
    };

    exports.setBlind = function (blind) {
        if ($toolbarArea) {
            if (blind) {
                draggingBehavior.resetDragging();
                ShadowUI.addClass($toolbarArea, TOOLBAR_BLINDED_CLASS);
            }
            else {
                ShadowUI.removeClass($toolbarArea, TOOLBAR_BLINDED_CLASS);
                draggingBehavior.restoreDragging();
            }
        }
    };

    exports.updateState = function (hasChanges, hasSteps, hasErrors) {
        if (!$toolbarArea || !$toolbarArea.length)
            return;

        if (hasErrors) {
            ShadowUI.unbind($exitRecordingArea, 'click', exitRecording);
            ShadowUI.bind($exitRecordingArea, 'click', exitRecordingWithErrors);
        }
        else {
            ShadowUI.unbind($exitRecordingArea, 'click', exitRecordingWithErrors);
            ShadowUI.bind($exitRecordingArea, 'click', exitRecording);

        }

        if (hasErrors) {
            ShadowUI.addClass($saveTestArea, DISABLE_BUTTON_AREA_CLASS);
            $saveTestArea.attr('title', HAS_INCORRECT_STEP_SAVE_TEST_TITLE);
            ShadowUI.unbind($saveTestArea, 'click', saveTestButtonClickHandler);

            ShadowUI.addClass($runPlaybackArea, DISABLE_BUTTON_AREA_CLASS);
            $runPlaybackArea.attr('title', HAS_INCORRECT_STEP_PLAYBACK_TITLE);
            ShadowUI.unbind($runPlaybackArea, 'click', runPlayback);

            ShadowUI.unbind($runPlaybackArea, 'click', runPlayback);

            return;
        }

        if (hasSteps) {
            ShadowUI.removeClass($runPlaybackArea, DISABLE_BUTTON_AREA_CLASS);
            $runPlaybackArea.attr('title', RUN_PLAYBACK_TITLE + getButtonTitlePostfix(buttonShortcuts.playback));
            ShadowUI.bind($runPlaybackArea, 'click', runPlayback);
        }
        else {
            ShadowUI.addClass($runPlaybackArea, DISABLE_BUTTON_AREA_CLASS);
            $runPlaybackArea.attr('title', DISABLE_PLAYBACK_TEST_TITLE);
            ShadowUI.unbind($runPlaybackArea, 'click', runPlayback);
        }

        if (hasChanges) {
            ShadowUI.removeClass($saveTestArea, DISABLE_BUTTON_AREA_CLASS);
            $saveTestArea.attr('title', SAVE_TEST_TITLE + getButtonTitlePostfix(buttonShortcuts.saveTest));
            ShadowUI.bind($saveTestArea, 'click', saveTestButtonClickHandler);
        }
        else {
            ShadowUI.addClass($saveTestArea, DISABLE_BUTTON_AREA_CLASS);
            $saveTestArea.attr('title', DISABLE_SAVE_TEST_TITLE);
            ShadowUI.unbind($saveTestArea, 'click', saveTestButtonClickHandler);
        }
    };

    exports.updateExpandStepsButtonAppearance = function (stepsShown) {
        var $icon = $expandStepsArea.children('div');

        if (stepsShown) {
            ShadowUI.removeClass($expandStepsArea.parent(), SHOW_STEPS_BUTTON_AREA_CLASS);
            ShadowUI.addClass($expandStepsArea.parent(), HIDE_STEPS_BUTTON_AREA_CLASS);
            $expandStepsArea.attr('title', EXPAND_BUTTON_HIDE_STEPS_TITLE);
            $expandStepsArea.children('span').html(HIDE_STEPS_TEXT);
            ShadowUI.removeClass($icon, SHOW_STEPS_ICON_CLASS);
            ShadowUI.addClass($icon, HIDE_STEPS_ICON_CLASS);
        }
        else {
            ShadowUI.removeClass($expandStepsArea.parent(), HIDE_STEPS_BUTTON_AREA_CLASS);
            ShadowUI.addClass($expandStepsArea.parent(), SHOW_STEPS_BUTTON_AREA_CLASS);
            $expandStepsArea.attr('title', EXPAND_BUTTON_SHOW_STEPS_TITLE);
            $expandStepsArea.children('span').html(SHOW_STEPS_TEXT);
            ShadowUI.removeClass($icon, HIDE_STEPS_ICON_CLASS);
            ShadowUI.addClass($icon, SHOW_STEPS_ICON_CLASS);
        }
    };

    exports.setExpandStepsButtonState = function (enabled) {
        if (enabled)
            ShadowUI.removeClass($expandStepsArea, DISABLE_BUTTON_AREA_CLASS);
        else
            ShadowUI.addClass($expandStepsArea, DISABLE_BUTTON_AREA_CLASS);
    };

    exports.addActionIndicator = function (action) {
        var $indicator = createActionIndicator(action);
        initActionIndicator($indicator);
    };

    exports.updateMaxTopForDragging = function ($el) {
        var windowHeight = $(window).height();

        draggingBehavior.setMaxTop($el && $el.length ? windowHeight - $el.height() : null);
    };
});
TestCafeClient.define('UI.RecorderWidgets.Tooltip', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),

        $ = Hammerhead.$,
        ShadowUI = Hammerhead.ShadowUI,
        Util = Hammerhead.Util;

    // Const
    var CLOSE_BUTTON_CLASS = 'close-button',
        CONTENT_CLASS = 'content',
        TOOLTIP_CLASS = 'tooltip',
        TOOLBAR_CLASS = 'toolbar',
        RECORDER_CLASS = 'recorder',

        TOOLTIP_DEFAULT_CSS_RIGHT = 15,
        FADING_DELAY = 2000,
        FADING_TIME = 5000;

    var tooltips = [];

    function Tooltip(message) {
        this.message = message;
        this.animationTimeoutId = null;
        this.visible = null;
        this.$tooltip = null;
        this.$closeButton = null;

        this._createMarkup();
        this._init();
    }

    Tooltip.prototype._createMarkup = function () {
        var $recorder = ShadowUI.select('.' + RECORDER_CLASS);

        this.$tooltip = $('<div>');
        ShadowUI.addClass(this.$tooltip, TOOLTIP_CLASS);

        this.$closeButton = $('<div>').appendTo(this.$tooltip);
        ShadowUI.addClass(this.$closeButton, CLOSE_BUTTON_CLASS);

        var $content = $('<div>').appendTo(this.$tooltip);
        ShadowUI.addClass($content, CONTENT_CLASS);

        var $message = $('<span>').appendTo($content);
        $message.html(this.message);

        this.hide();

        this.$tooltip.appendTo($recorder);
    };

    Tooltip.prototype._init = function () {
        var tooltip = this;

        this.$tooltip.mouseenter(function () {
            tooltip._stopAnimation();
        });

        this.$tooltip.mouseleave(function () {
            if (tooltip.visible)
                tooltip._startAnimation();
        });

        this.$tooltip.mousedown(function (e) {
            Util.preventDefault(e);
        });

        ShadowUI.bind(this.$closeButton, 'click', function () {
            tooltip.hide();
        });
    };

    Tooltip.prototype._startAnimation = function () {
        var tooltip = this;

        this._makeVisible();

        this.animationTimeoutId = window.setTimeout(function () {
            tooltip.$tooltip.fadeOut(FADING_TIME, function () {
                tooltip.hide();
            });
        }, FADING_DELAY);
    };

    Tooltip.prototype._stopAnimation = function () {
        if (this.animationTimeoutId) {
            window.clearTimeout(this.animationTimeoutId);
            this.animationTimeoutId = null;
        }

        this.$tooltip.stop(true);
        this._makeVisible();
    };

    Tooltip.prototype._makeVisible = function () {
        this.visible = true;
        this.$tooltip.css('display', 'inline');
        this.$tooltip.css('opacity', '1');
    };

    Tooltip.prototype._updatePosition = function () {
        this.$tooltip.css('right', TOOLTIP_DEFAULT_CSS_RIGHT + 'px');

        var visibleTooltips = [];
        for (var i = 0; i < tooltips.length; i++)
            if (tooltips[i] !== this && tooltips[i].visible)
                visibleTooltips.push(tooltips[i]);

        //place tooltip below currently visible tooltips
        if (visibleTooltips.length) {
            var bottomTooltip = visibleTooltips[0];
            for (var j = 1; j < visibleTooltips.length; j++)
                if (parseInt(visibleTooltips[j].$tooltip.css('top')) > parseInt(bottomTooltip.$tooltip.css('top')))
                    bottomTooltip = visibleTooltips[j];
            this.$tooltip.css('top', parseInt(bottomTooltip.$tooltip.css('top')) + bottomTooltip.$tooltip.outerHeight(true) + 'px');
        }

        //place tooltip on the left of toolbar if they intersect
        var $toolbar = ShadowUI.select('.' + TOOLBAR_CLASS);
        if ($toolbar.length && $toolbar.is(':visible')) {
            var toolbarRectangle = Util.getElementRectangle($toolbar[0]),
                tooltipRectangle = Util.getElementRectangle(this.$tooltip[0]);

            if (toolbarRectangle.left < tooltipRectangle.left + tooltipRectangle.width && tooltipRectangle.left < toolbarRectangle.left + toolbarRectangle.width &&
                toolbarRectangle.top < tooltipRectangle.top + tooltipRectangle.height && tooltipRectangle.top < toolbarRectangle.top + toolbarRectangle.height) {
                if (toolbarRectangle.left - tooltipRectangle.width - TOOLTIP_DEFAULT_CSS_RIGHT >= 0)
                    this.$tooltip.css('right', (tooltipRectangle.left - toolbarRectangle.left + tooltipRectangle.width + TOOLTIP_DEFAULT_CSS_RIGHT * 2) + 'px');
            }
        }
    }
    ;

    Tooltip.prototype.show = function () {
        this._stopAnimation();
        this._startAnimation();
        this._updatePosition();
    };

    Tooltip.prototype.hide = function () {
        this.visible = false;
        this.$tooltip.css('display', 'none');
        this.$tooltip.css('opacity', '0');
    };

    exports.show = function (message) {
        for (var i = 0; i < tooltips.length; i++)
            if (tooltips[i].message === message) {
                tooltips[i].show();
                return;
            }

        var tooltip = new Tooltip(message);
        tooltip.show();
        tooltips.push(tooltip);
    };

    exports.hideAll = function () {
        for (var i = 0; i < tooltips.length; i++)
            if (tooltips[i].visible)
                tooltips[i].hide();
    };
});
TestCafeClient.define('UI.RecorderWidgets.UnsavedChangesDialog', function (require, exports) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        ConfirmDialog = require('UI.RecorderWidgets.ConfirmDialog'),
        ButtonWidget = require('UI.RecorderWidgets.Button');

    //Const
    var BUTTONS_CLASS = 'buttons',
        BUTTON_SMALL_CLASS = 'small',

    //Popup text
        HEADER_TEXT = 'Unsaved changes',
        SAVE_CHANGES_MESSAGE_TEXT = ['Do you want to save the changes before you quit the test recorder?'],
        EXIT_MESSAGE_TEXT = ['There are changes that can be saved after all incorrect steps are corrected. Do you want to quit losing all unsaved changes?'];

    //Events
    exports.SAVE_BUTTON_CLICK_EVENT = 'saveButtonClick';
    exports.CANCEL_BUTTON_CLICK_EVENT = 'cancelButtonClick';
    exports.EXIT_BUTTON_CLICK_EVENT = 'exitButtonClick';

    //Globals
    var dialog = null,
        eventEmitter = null,
        onlyExit = false,
        $saveButton = null,
        $cancelButton = null,
        $exitButton = null;

    //Markup
    var createButtons = function () {
        var $buttons = $('<div></div>');
        ShadowUI.addClass($buttons, BUTTONS_CLASS);

        if (onlyExit) {
            $exitButton = ButtonWidget.create($buttons, 'Yes');
            $cancelButton = ButtonWidget.create($buttons, 'No');
        }
        else {
            $saveButton = ButtonWidget.create($buttons, 'Yes');
            $exitButton = ButtonWidget.create($buttons, 'No');
            $cancelButton = ButtonWidget.create($buttons, 'Cancel');

            ShadowUI.addClass($saveButton, BUTTON_SMALL_CLASS);
        }

        ShadowUI.addClass($exitButton, BUTTON_SMALL_CLASS);
        ShadowUI.addClass($cancelButton, BUTTON_SMALL_CLASS);

        return $buttons;
    };

    var createDialog = function ($container) {
        dialog = new ConfirmDialog($container, {
            headerText: HEADER_TEXT,
            message: onlyExit ? EXIT_MESSAGE_TEXT : SAVE_CHANGES_MESSAGE_TEXT,
            footerContent: createButtons()
        });

        init();
    };

//Behavior
    var init = function () {
        ShadowUI.bind($cancelButton, 'click', function () {
            closeDialog(function () {
                eventEmitter.emit(exports.CANCEL_BUTTON_CLICK_EVENT);
            });
        });

        ShadowUI.bind($exitButton, 'click', function () {
            closeDialog(function () {
                eventEmitter.emit(exports.EXIT_BUTTON_CLICK_EVENT);
            });
        });

        if (onlyExit) {
            dialog.popup.onkeydown(function (e) {
                if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.enter) {
                    $exitButton.trigger('click');
                    Util.preventDefault(e);
                }

                if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.esc) {
                    $cancelButton.trigger('click');
                    Util.preventDefault(e);
                }
            }, true, true);
        }
        else {
            ShadowUI.bind($saveButton, 'click', function () {
                closeDialog(function () {
                    eventEmitter.emit(exports.SAVE_BUTTON_CLICK_EVENT);
                });
            });

            dialog.popup.onkeydown(function (e) {
                if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.enter) {
                    $saveButton.trigger('click');
                    Util.preventDefault(e);
                }

                if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.esc) {
                    $cancelButton.trigger('click');
                    Util.preventDefault(e);
                }
            }, true, true);
        }
    };

    var closeDialog = function (callback) {
        dialog.popup.close(callback);
    };

    //API
    exports.init = function ($container, hasErrors) {
        eventEmitter = new Util.EventEmitter();
        onlyExit = hasErrors;
        createDialog($container);
    };

    exports.events = {
        on: function (ev, listener) {
            eventEmitter.on(ev, listener);
        }
    };
});
TestCafeClient.define('UI.RecorderWidgets.AddAssertionButton', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        ButtonWidget = require('UI.RecorderWidgets.Button'),

        OPERATORS = ['eq', 'notEq', 'ok', 'notOk'],
        OPERATOR_ICON_CLASSES = {
            eq: 'eq-icon',
            notEq: 'not-eq-icon',
            ok: 'ok-icon',
            notOk: 'not-ok-icon'
        },

        OPERATOR_ICON_CLASS = 'operator-icon',
        ADD_ASSERTION_BUTTON_CONTAINER_CLASS = 'add-assertion-button-container',
        ADD_ASSERTION_BUTTON_CLASS = 'add-assertion-button',
        ADD_ASSERTION_BUTTON_POPUP_CLASS = 'add-assertion-button-popup',
        ADD_ASSERTION_BUTTON_POPUP_ITEM_CLASS = 'add-assertion-button-popup-item',
        ADD_ASSERTION_BUTTON_POPUP_SEPARATOR_CLASS = 'add-assertion-button-popup-separator';

    function addEventEmitter(target) {
        target.eventEmitter = new Util.EventEmitter();
        target.on = function (ev, listener) {
            target.eventEmitter.on(ev, listener);
        };
    }

    var AddAssertionButton = this.exports = function ($container) {
        var button = this;
        this.$container = null;
        this.$button = null;
        this.$popup = null;

        addEventEmitter(this);

        this.$container = $('<div></div>').appendTo($container);
        ShadowUI.addClass(this.$container, ADD_ASSERTION_BUTTON_CONTAINER_CLASS);

        this.$button = ButtonWidget.create(this.$container, '', true);
        ShadowUI.addClass(this.$button, ADD_ASSERTION_BUTTON_CLASS);

        this.$button.click(function () {
            if (!button.$popup)
                button._showPopup();
            else
                button._closePopup();
        });
    };

    AddAssertionButton.prototype.getContainer = function () {
        return this.$container;
    };

    AddAssertionButton.ITEM_CLICKED_EVENT = 'itemClicked';
    AddAssertionButton.POPUP_CLOSED_EVENT = 'popupClosed';

    AddAssertionButton.prototype._showPopup = function () {
        var button = this;

        this.$popup = $('<div></div>');
        ShadowUI.addClass(this.$popup, ADD_ASSERTION_BUTTON_POPUP_CLASS);

        for (var i = 0; i < OPERATORS.length; i++) {
            this._addPopupItem(OPERATORS[i]);

            if (i < OPERATORS.length - 1) {
                var $separator = $('<div></div>').appendTo(this.$popup);
                ShadowUI.addClass($separator, ADD_ASSERTION_BUTTON_POPUP_SEPARATOR_CLASS);
            }
        }

        this.$popup.appendTo(this.$container);

        var popupHeight = this.$popup.height();

        if(this.$popup.offset().top - $(document).scrollTop() + popupHeight > $(window).height())
            this.$popup.css('top', parseInt(this.$popup.css('top').replace('px', '')) - popupHeight - this.$button.height());

        var documentMouseDownHandler = function (e) {
            if (!button.$container.find(e.target).length && button.$button[0] !== e.target)
                button._closePopup();
        };

        ShadowUI.bind($(document), 'mousedown', documentMouseDownHandler);
        this.on(AddAssertionButton.POPUP_CLOSED_EVENT, function () {
            ShadowUI.unbind($(document), 'mousedown', documentMouseDownHandler);
        });
    };

    AddAssertionButton.prototype._closePopup = function () {
        if (this.$popup) {
            var popupHeight = this.$popup.outerHeight(true);
            this.$popup.remove();
            this.$popup = null;
            this.eventEmitter.emit(AddAssertionButton.POPUP_CLOSED_EVENT, { popupHeight: popupHeight });
        }
    };

    AddAssertionButton.prototype._addPopupItem = function (text) {
        var button = this,
            $item = $('<div></div>').appendTo(this.$popup),
            $operatorIcon = $('<div></div>').appendTo($item);

        ShadowUI.addClass($item, ADD_ASSERTION_BUTTON_POPUP_ITEM_CLASS);
        ShadowUI.addClass($operatorIcon, OPERATOR_ICON_CLASS);
        ShadowUI.addClass($operatorIcon, OPERATOR_ICON_CLASSES[text]);

        $item.click(function (e) {
            button._closePopup();
            button.eventEmitter.emit(AddAssertionButton.ITEM_CLICKED_EVENT, { operator: text });
            Util.preventDefault(e);
            return false;
        });
    };
});
TestCafeClient.define('UI.RecorderWidgets.Assertion', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        MessageSandbox = Hammerhead.MessageSandbox,
        IFrameMessages = require('Base.CrossDomainMessages'),
        JavascriptExecutor = require('Base.JavascriptExecutor'),
        AssertionsAPI = require('TestRunner.API.Assertions'),
        ButtonWidget = require('UI.RecorderWidgets.Button'),

        OPERATOR_ICON_CLASSES = {
            eq: 'eq-icon',
            notEq: 'not-eq-icon',
            ok: 'ok-icon',
            notOk: 'not-ok-icon'
        },

        ASSERTION_CLASS = 'assertion',
        OPERATOR_AREA_CLASS = 'operator-area',
        OPERATOR_ICON_CLASS = 'operator-icon',
        SUCCESSFUL_CLASS = 'successful',
        FAILED_CLASS = 'failed',
        MESSAGE_AREA_CLASS = 'message-area',
        REMOVE_ASSERTION_BUTTON_AREA_CLASS = 'remove-assertion-button-area';

    //Utils
    function addEventEmitter(target) {
        target.eventEmitter = new Util.EventEmitter();
        target.on = function (ev, listener) {
            target.eventEmitter.on(ev, listener);
        };
    }

    function getAssertionAutoMessage(assertionInfo) {
        var actual = assertionInfo.arguments[0],
            expected = assertionInfo.arguments[1];

        function generate(op, args) {
            var res = [op + '('];

            for (var i = 0; i < args.length; i++) {
                if (i)
                    res.push(', ');

                res.push(args[i] || '...');
            }

            res.push([')']);
            return res.join('');
        }

        return generate(assertionInfo.operator, expected ? [actual, expected] : [actual]);
    }

    var Assertion = this.exports = function ($assertion, assertionInfo, options) {
        var assertion = this;

        this.options = {
            enableValidation: options.enableValidation
        };

        this.assertionInfo = assertionInfo;
        this.$assertion = $assertion;
        this.$operatorArea = null;
        this.$messageArea = null;
        this.$removeButtonArea = null;
        this.isValid = options.isValid;
        this.iFrameSelector = options.iFrameSelector || null;
        this.curError = null;
        this.failed = assertionInfo.failed;

        ShadowUI.addClass(this.$assertion, ASSERTION_CLASS);

        addEventEmitter(this);

        this._createOperator(assertionInfo.operator);
        this._createMessage(assertionInfo.message || getAssertionAutoMessage(assertionInfo));
        this._createRemoveButton();

        this.assertionsAPI = new AssertionsAPI(function (err) {
            assertion.curError = err;
        });

        this.validate();

        this.$assertion.click(function () {
            assertion.eventEmitter.emit(Assertion.ASSERTION_CLICKED_EVENT, {});
        });
    };

//Assertion events
    Assertion.ASSERTION_CLICKED_EVENT = 'assertionClicked';
    Assertion.ASSERTION_REMOVED_EVENT = 'assertionRemoved';
    Assertion.VALIDITY_CHANGED_EVENT = 'validityChanged';

//Assertion public methods
    Assertion.prototype.update = function (assertionInfo, isValid, iFrameSelector) {
        if (this.assertionInfo.message !== assertionInfo.message)
            this._setMessage(assertionInfo.message || getAssertionAutoMessage(assertionInfo));

        this.assertionInfo.arguments = assertionInfo.arguments;
        this.assertionInfo.message = assertionInfo.message;
        this.assertionInfo.operator = assertionInfo.operator;

        this.assertionInfo = assertionInfo;
        this.isValid = isValid;
        this.iFrameSelector = iFrameSelector;
        this.failed = assertionInfo.failed;
        this._updateAssertionState();
    };

    Assertion.prototype.getContainer = function () {
        return this.$assertion;
    };

    Assertion.prototype.setIFrameSelector = function (iFrameSelector) {
        this.iFrameSelector = iFrameSelector;
    };

//Assertion private methods
    Assertion.prototype._createOperator = function (operator) {
        this.$operatorArea = $('<div></div>').appendTo(this.$assertion);
        ShadowUI.addClass(this.$operatorArea, OPERATOR_AREA_CLASS);

        var $operatorIcon = $('<div></div>').appendTo(this.$operatorArea);
        ShadowUI.addClass($operatorIcon, OPERATOR_ICON_CLASS);
        ShadowUI.addClass($operatorIcon, OPERATOR_ICON_CLASSES[operator]);
    };

    Assertion.prototype._createMessage = function (message) {
        this.$messageArea = $('<div></div>').appendTo(this.$assertion);
        ShadowUI.addClass(this.$messageArea, MESSAGE_AREA_CLASS);

        this._setMessage(message);
    };

    Assertion.prototype._createRemoveButton = function () {
        var assertion = this;

        this.$removeButtonArea = $('<div></div>').appendTo(this.$assertion);
        ShadowUI.addClass(this.$removeButtonArea, REMOVE_ASSERTION_BUTTON_AREA_CLASS);

        var $removeButton = ButtonWidget.create(this.$removeButtonArea, '', true);

        $removeButton.click(function () {
            assertion.eventEmitter.emit(Assertion.ASSERTION_REMOVED_EVENT, { assertion: assertion });
            return false;
        });
    };

    Assertion.prototype._setValidity = function (value) {
        var changed = value !== this.isValid;

        this.isValid = value;

        if (changed)
            this.eventEmitter.emit(Assertion.VALIDITY_CHANGED_EVENT, {
                isValid: value
            });
    };

    Assertion.prototype.validate = function () {
        var assertion = this;

        function onMessage(e) {
            if (e.message.cmd === IFrameMessages.ASSERT_RESPONSE_CMD) {
                assertion._setValidity(!e.message.err);
                assertion._updateAssertionState();

                MessageSandbox.off(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
            }
        }

        if (!this.options.enableValidation)
            this._updateAssertionState();
        else {
            this.curError = null;

            if (this.iFrameSelector) {
                var $iFrame = JavascriptExecutor.parseSelectorSync(this.iFrameSelector).$elements,
                    iFrameContext = ($iFrame && $iFrame.length) ? $iFrame[0].contentWindow : null;

                if (iFrameContext) {
                    var msg = {
                        cmd: IFrameMessages.ASSERT_REQUEST_CMD,
                        args: this.assertionInfo.arguments,
                        operator: this.assertionInfo.operator
                    };

                    MessageSandbox.on(MessageSandbox.SERVICE_MSG_RECEIVED, onMessage);
                    MessageSandbox.sendServiceMsg(msg, iFrameContext);
                }
            }
            else {
                var assertionArguments = $.map(this.assertionInfo.arguments, function (argument) {
                    return argument ? JavascriptExecutor.eval(argument, function (err) {
                        assertion.curError = err;
                    }) : argument;
                });

                assertionArguments.push(this.assertionInfo.message);

                if (!this.curError)
                    this.assertionsAPI[this.assertionInfo.operator].apply(this.assertionsAPI, assertionArguments);

                assertion._setValidity(!this.curError);
                this._updateAssertionState();
            }
        }
    };

    Assertion.prototype._updateAssertionState = function () {
        if (this.failed) {
            ShadowUI.removeClass(this.$operatorArea, SUCCESSFUL_CLASS);
            ShadowUI.addClass(this.$operatorArea, FAILED_CLASS);
        }
        else {
            ShadowUI.removeClass(this.$operatorArea, SUCCESSFUL_CLASS);
            ShadowUI.removeClass(this.$operatorArea, FAILED_CLASS);
        }

        if (!this.options.enableValidation)
            return;

        if (this.isValid) {
            ShadowUI.removeClass(this.$operatorArea, FAILED_CLASS);
            ShadowUI.addClass(this.$operatorArea, SUCCESSFUL_CLASS);
        }
        else {
            ShadowUI.removeClass(this.$operatorArea, SUCCESSFUL_CLASS);
            ShadowUI.addClass(this.$operatorArea, FAILED_CLASS);
        }
    };

    Assertion.prototype._setMessage = function (message) {
        this.$messageArea.text(message || '');
    };
});
TestCafeClient.define('UI.RecorderWidgets.AssertionArgument', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        CodeEditor = require('UI.RecorderWidgets.CodeEditor'),
        ChooseSelectorDialog = require('UI.RecorderWidgets.ChooseSelectorDialog'),
        ChoosePropertyDialog = require('UI.RecorderWidgets.ChoosePropertyDialog'),
        ValidationMessageFactory = require('UI.ValidationMessageFactory'),
        JavascriptExecutor = require('Base.JavascriptExecutor'),
        ModalBackground = require('UI.ModalBackground'),
        ObjectViewer = require('UI.RecorderWidgets.ObjectViewer'),
        ButtonWidget = require('UI.RecorderWidgets.Button'),

        UXLog = require('UI.UXLog'),

        CODE_EDITOR_WIDTH = 364,
        ARGUMENT_HEIGHT = 119,
        CODE_EDITOR_HEIGHT = 116,

        VALUE_LABEL_POSTFIX = ' Value:',
        OPEN_WIZARD_BUTTON_TITLE = 'Open assertion argument wizard',

        ARGUMENT_CLASS = 'argument',
        ARGUMENT_LABEL_CLASS = 'argument-label',
        VALUE_LABEL_CLASS = 'value-label',
        ARGUMENT_VALUE_CLASS = 'argument-value';

    //Argument
    var ArgumentEditor = this.exports = function ($container, options) {
        options = options || {};
        var argumentEditor = this;

        this.value = options.value || '';
        this.error = null;
        this.editor = null;
        this.objectViewer = null;
        this.iFrameContext = options.iFrameContext || null;
        this.iFrameSelector = options.iFrameSelector || null;
        this.enableValidation = options.enableValidation || false;
        this.parentPopup = options.parentPopup;
        this.savedIFrameContext = null;
        this.lastParsedValue = null;
        this.parsingInProcess = false;
        this.changeDelayed = false;
        this.isReproducibleValue = false;

        this.$argument = null;

        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            argumentEditor.eventEmitter.on(ev, listener);
        };

        var $argumentLabel = this._createLabel(ARGUMENT_LABEL_CLASS, options.argumentName + ':');
        $argumentLabel.appendTo($container);

        this.$argument = $('<div></div>').css('height', ARGUMENT_HEIGHT).appendTo($container);
        ShadowUI.addClass(this.$argument, ARGUMENT_CLASS);

        this._createInput();
        this._createOpenWizardButton();

        var $valueLabel = this._createLabel(VALUE_LABEL_CLASS, options.argumentName + VALUE_LABEL_POSTFIX),
            $argumentValue = $('<div></div>');

        ShadowUI.addClass($argumentValue, ARGUMENT_VALUE_CLASS);

        if (this.enableValidation) {
            $valueLabel.appendTo($container);
            $argumentValue.appendTo($container);
        }

        this.objectViewer = new ObjectViewer($argumentValue);

        this._update();
    };

    //Argument events
    ArgumentEditor.ARGUMENT_CHANGED_EVENT = 'argumentChanged';
    ArgumentEditor.START_PICKING_ELEMENT_EVENT = 'startPickingElement';
    ArgumentEditor.ARGUMENT_REPRODUCIBLE_STATE_UPDATED = 'argumentReproducibleStateUpdated';

    //Argument private methods
    //Markup
    ArgumentEditor.prototype._createInput = function () {
        var argumentEditor = this;

        var $codeEditorContainer = $('<div></div>').appendTo(this.$argument);

        this.editor = new CodeEditor($codeEditorContainer, {
            width: CODE_EDITOR_WIDTH,
            height: CODE_EDITOR_HEIGHT,
            fixedHeight: true,
            text: this.value,
            allowEdit: true,
            floatingWidth: false
        });

        this.editor.events.on(CodeEditor.CHANGE_EVENT, function (e) {
            argumentEditor._setArgumentValue(e.text);
        });
    };

    ArgumentEditor.prototype._createLabel = function (className, labelText) {
        var $label = $('<label></label>').text(labelText);
        ShadowUI.addClass($label, className);

        return $label;
    };

    ArgumentEditor.prototype._createOpenWizardButton = function () {
        var argumentEditor = this,
            lastEditorValue = null;

        function startPicking() {
            UXLog.write('Assertions: start assertion wizard');
            lastEditorValue = argumentEditor.editor.getText();

            if (argumentEditor.parentPopup)
                argumentEditor.parentPopup.hide();

            ModalBackground.hide();

            argumentEditor.eventEmitter.emit(ArgumentEditor.START_PICKING_ELEMENT_EVENT, {
                callback: function (elementSelectors, iFrameSelectors) {
                    if (!elementSelectors) {
                        ModalBackground.show();

                        if (argumentEditor.parentPopup)
                            argumentEditor.parentPopup.show();
                    }
                    else {
                        var $iFrame = (iFrameSelectors && iFrameSelectors.length) ? JavascriptExecutor.parseSelectorSync(iFrameSelectors[0].selector).$elements : null;

                        argumentEditor.savedIFrameContext = argumentEditor.iFrameContext;
                        argumentEditor.iFrameContext = ($iFrame && $iFrame.length) ? $iFrame[0].contentWindow : null;
                        argumentEditor.iFrameSelector = ($iFrame && $iFrame.length) ? iFrameSelectors[0].selector : null;

                        showChooseSelectorDialog(elementSelectors, 0, $iFrame);

                    }
                },

                iFrameContext: argumentEditor.iFrameContext
            });
        }

        function showChooseSelectorDialog(elementSelectors, elementSelectorsIndex, $iFrame, popupPosition) {
            ModalBackground.show(true);

            var chooseSelectorDialog = new ChooseSelectorDialog(elementSelectors, elementSelectorsIndex, $iFrame, popupPosition);

            chooseSelectorDialog.on(ChooseSelectorDialog.CONFIRM_BUTTON_CLICK_EVENT, function (e) {
                showChoosePropertyDialog({
                    parsedElementSelector: e.parsedElementSelector,
                    elementSelectors: e.elementSelectors,
                    elementSelectorsIndex: e.elementSelectorsIndex,
                    popupPosition: e.popupPosition,
                    iFrameContext: argumentEditor.iFrameContext,
                    $iFrame: $iFrame
                });
            });

            chooseSelectorDialog.on(ChooseSelectorDialog.CLOSE_BUTTON_CLICK_EVENT, function () {
                argumentEditor.iFrameContext = this.savedIFrameContext;

                if (argumentEditor.parentPopup)
                    argumentEditor.parentPopup.show();
                ModalBackground.show();
            });
        }

        function showChoosePropertyDialog(options) {
            ModalBackground.show();

            var choosePropertyDialog = new ChoosePropertyDialog(options.parsedElementSelector, options.popupPosition, options.iFrameContext);

            choosePropertyDialog.on(ChoosePropertyDialog.CONFIRM_BUTTON_CLICK_EVENT, function (e) {
                UXLog.write('Assertions: assertion argument created by wizard');
                if (argumentEditor.parentPopup)
                    argumentEditor.parentPopup.show();

                argumentEditor.editor.focus();
                argumentEditor.editor.setText(e.text);

                if (lastEditorValue === e.text)
                    argumentEditor._onChange();  //raise change event
            });
            choosePropertyDialog.on(ChoosePropertyDialog.CLOSE_BUTTON_CLICK_EVENT, function () {
                argumentEditor.iFrameContext = this.savedIFrameContext;

                if (argumentEditor.parentPopup)
                    argumentEditor.parentPopup.show();
            });

            choosePropertyDialog.on(ChoosePropertyDialog.PREVIOUS_BUTTON_CLICK_EVENT, function (e) {
                showChooseSelectorDialog(options.elementSelectors, options.elementSelectorsIndex, options.$iFrame, e.popupPosition);
            });
        }

        var $openWizardButton = ButtonWidget.create(this.$argument, '', true);
        $openWizardButton.attr('title', OPEN_WIZARD_BUTTON_TITLE);

        $openWizardButton.click(startPicking);
    };

    //Behaior
    ArgumentEditor.prototype._setArgumentValue = function (value) {
        this.value = value;
        this._onChange();
    };

    ArgumentEditor.prototype._onChange = function () {
        this._update();

        if (this.parsingInProcess)
            this.changeDelayed = true;
        else
            this._emitChangeEvent();
    };

    ArgumentEditor.prototype._emitChangeEvent = function () {
        var argumentEditor = this;

        this.eventEmitter.emit(ArgumentEditor.ARGUMENT_CHANGED_EVENT, {
            value: argumentEditor.value,
            iFrameContext: argumentEditor.iFrameContext,
            iFrameSelector: argumentEditor.iFrameSelector
        });
    };

    ArgumentEditor.prototype._update = function () {
        var argumentEditor = this;

        this._resetError();

        this.objectViewer.clear();

        if (this.value) {
            this.parsingInProcess = true;
            this.objectViewer.show(this.value, this.iFrameContext, function (e) {
                argumentEditor.isReproducibleValue = e.isReproducibleValue;
                argumentEditor.eventEmitter.emit(ArgumentEditor.ARGUMENT_REPRODUCIBLE_STATE_UPDATED);

                if (e.error)
                    argumentEditor._onError(e.error);
                else
                    argumentEditor.lastParsedValue = e.parsedValue;

                if (argumentEditor.changeDelayed) {
                    argumentEditor._emitChangeEvent();
                    argumentEditor.changeDelayed = false;
                }

                argumentEditor.parsingInProcess = false;
            });
        }
        else
            this.eventEmitter.emit(ArgumentEditor.ARGUMENT_REPRODUCIBLE_STATE_UPDATED);
    };

    ArgumentEditor.prototype._onError = function (message) {
        this.error = message;
        ValidationMessageFactory.error(this.editor.getContainer(), message);
    };

    ArgumentEditor.prototype._resetError = function () {
        this.error = null;
        ValidationMessageFactory.success(this.editor.getContainer());
    };

    ArgumentEditor.prototype.getLastParsedValue = function () {
        return this.lastParsedValue;
    };

    ArgumentEditor.prototype.isValid = function () {
        return !this.error;
    };

    ArgumentEditor.prototype.setValue = function (value) {
        this.editor.setText(value);
    };

    ArgumentEditor.prototype.removeIFrameContext = function () {
        this.iFrameContext = null;
        this._onChange();
    };

    ArgumentEditor.prototype.setIFrameContext = function (context) {
        this.iFrameContext = context;
        this._onChange();
    };
});
TestCafeClient.define('UI.RecorderWidgets.AssertionsBlock', function () {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        ShadowUI = Hammerhead.ShadowUI;

    var ASSERTIONS_BLOCK_CLASS = 'assertions-block',
        TITLE_CLASS = 'title',
        CONTENT_CLASS = 'content';

    var AssertionsBlock = this.exports = function ($container, context, showTitle) {
        this.$block = $('<div></div>').appendTo($container);
        this.context = context;

        this.$title = $('<div></div>').css('display', showTitle ? '' : 'none').appendTo(this.$block);
        this.$title.text(context ?
            'Assertions in IFrame: ' + context :
            'Assertions in the main window');

        this.$content = $('<div></div>').appendTo(this.$block);

        this.assertions = [];
        this.assertionsInfo = [];

        ShadowUI.addClass(this.$block, ASSERTIONS_BLOCK_CLASS);
        ShadowUI.addClass(this.$title, TITLE_CLASS);
        ShadowUI.addClass(this.$content, CONTENT_CLASS);
    };

    AssertionsBlock.prototype.addAssertion = function ($assertion, info) {
        this.assertions.push($assertion);
        this.assertionsInfo.push(info);
        $assertion.appendTo(this.$content);
    };

    AssertionsBlock.prototype.removeAssertion = function ($assertion) {
        var index = $.inArray($assertion, this.assertions);

        if (index > -1) {
            this.assertions.splice(index, 1);
            this.assertionsInfo.splice(index, 1);
        }
    };

    AssertionsBlock.prototype.showTitle = function () {
        this.$title.css('display', '');
    };

    AssertionsBlock.prototype.hideTitle = function () {
        this.$title.css('display', 'none');
    };

    AssertionsBlock.prototype.getAssertionsCount = function () {
        return this.assertions.length;
    };

    AssertionsBlock.prototype.getContext = function () {
        return this.context;
    };

    AssertionsBlock.prototype.getAssertionsInfo = function () {
        return this.assertionsInfo;
    };

    AssertionsBlock.prototype.remove = function () {
        this.$block.remove();
        this.$title.remove();
    };
});

TestCafeClient.define('UI.RecorderWidgets.AssertionsStep', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        BaseStep = require('UI.RecorderWidgets.BaseStep'),
        ScrollBarWidget = require('UI.RecorderWidgets.ScrollBar'),
        EditAssertionDialog = require('UI.RecorderWidgets.EditAssertionDialog'),
        AssertionWidget = require('UI.RecorderWidgets.Assertion'),
        AssertionsBlockWidget = require('UI.RecorderWidgets.AssertionsBlock'),
        AddAssertionButtonWidget = require('UI.RecorderWidgets.AddAssertionButton'),

        UXLog = require('UI.UXLog'),

        ASSERTIONS_STEP_CLASS = 'assertions-step',
        ASSERTIONS_AREA_CLASS = 'assertions-area',
        ASSERTION_LIST_CLASS = 'assertion-list',
        ASSERTIONS_CLASS = 'assertions',
        EMPTY_CLASS = 'empty';

    var AssertionsStep = this.exports = function ($container, stepNum, stepInfo, options) {
        options = options || {};
        this.options = {
            enableAssertionsValidation: !!options.enableAssertionsValidation,
            updateAssertionsState: options.updateAssertionsState,
            parentPopup: options.parentPopup
        };

        this.$step = null;
        this.$assertionsArea = null;
        this.$assertionList = null;
        this.$assertions = null;
        this.blocks = [];
        this.stepInfo = stepInfo;
        this.addAssertionButton = null;
        this.scrollBar = null;
        this.$iFrameContextLabelContainer = null;

        BaseStep.apply(this, [$container, stepNum, stepInfo, options]);

        ShadowUI.addClass(this.$step, ASSERTIONS_STEP_CLASS);

        this._createAssertionsArea();
    };

    Util.inherit(AssertionsStep, BaseStep);

    //Step events
    AssertionsStep.STEP_NAME_CHANGED_EVENT = BaseStep.STEP_NAME_CHANGED_EVENT;
    AssertionsStep.STEP_INFO_CHANGED_EVENT = BaseStep.STEP_INFO_CHANGED_EVENT;
    AssertionsStep.EDIT_ASSERTION_START_EVENT = 'editAssertionStart';
    AssertionsStep.EDIT_ASSERTION_COMPLETE_EVENT = 'editAssertionComplete';
    AssertionsStep.START_PICKING_ELEMENT_EVENT = 'startPickingElement';

    //Step private methods
    AssertionsStep.prototype._createAssertionsList = function () {
        this.$assertionList = $('<div></div>').appendTo(this.$assertionsArea);
        ShadowUI.addClass(this.$assertionList, ASSERTION_LIST_CLASS);

        this.scrollBar = new ScrollBarWidget(this.$assertionsArea);

        this.$assertions = $('<div></div>').appendTo(this.$assertionList);
        ShadowUI.addClass(this.$assertions, ASSERTIONS_CLASS);

        this.scrollBar.init(this.$assertionList, this.$assertions);
    };

    AssertionsStep.prototype._createAssertionsArea = function () {
        this.$assertionsArea = $('<div></div>').appendTo(this.$step);
        ShadowUI.addClass(this.$assertionsArea, ASSERTIONS_AREA_CLASS);

        if (this.stepInfo.blocks.length)
            this._createAssertionsList();
        else
            ShadowUI.addClass(this.$assertionsArea, EMPTY_CLASS);

        this._createAddAssertionButton();

        for (var i = 0; i < this.stepInfo.blocks.length; i++) {
            for (var j = 0; j < this.stepInfo.blocks[i].assertions.length; j++)
                this._addAssertion(this.stepInfo.blocks[i].assertions[j], this.stepInfo.blocks[i].iFrameSelector);
        }

        this._updateBlocks();

        if (this.scrollBar) {
            this.scrollBar.recalculateSize();
            this._scrollAssertionListToBottom();
        }

    };

    AssertionsStep.prototype._createAddAssertionButton = function () {
        var step = this;

        this.addAssertionButton = new AddAssertionButtonWidget(this.$step);

        this.addAssertionButton.on(AddAssertionButtonWidget.ITEM_CLICKED_EVENT, function (e) {
            UXLog.write('Assertions: add assertion button is pressed');
            step._showEditAssertionDialog(step._getEmptyAssertionInfo(e.operator), e.iFrameSelector, function (e) {
                UXLog.write('Assertions: assertion is added');
                step._addAssertion(e.assertionInfo, e.iFrameSelector, e.isValid);
                step._updateBlocks();
                step.scrollBar.recalculateSize();
                //NOTE: after new assertion added we should scroll assertion list to bottom
                step._scrollAssertionListToBottom(step._findBlock(e.iFrameSelector));
            });
        });
    };

    AssertionsStep.prototype._onChange = function () {
        this.eventEmitter.emit(AssertionsStep.STEP_INFO_CHANGED_EVENT, { });
    };

    AssertionsStep.prototype._findBlock = function (iFrameSelector) {
        for (var i = 0; i < this.blocks.length; i++) {
            if (this.blocks[i].getContext() === iFrameSelector)
                return this.blocks[i];
        }

        return null;
    };

    AssertionsStep.prototype._removeBlock = function (block) {
        var index = $.inArray(block, this.blocks);

        if (index > -1)
            this.blocks.splice(index, 1);

        if (!this.blocks.length) {
            this.$assertionsArea.html('');
            this.scrollBar = null;
            this.$assertionList = null;
        }
    };

    AssertionsStep.prototype._updateBlocks = function () {
        var i = 0;

        if (this.blocks.length > 1) {
            for (; i < this.blocks.length; i++)
                this.blocks[i].showTitle();
        }
        else if (this.blocks.length && !this.blocks[0].getContext())
            this.blocks[0].hideTitle();

        this.stepInfo.blocks = [];

        for (i = 0; i < this.blocks.length; i++) {
            this.stepInfo.blocks.push({
                assertions: this.blocks[i].assertionsInfo,
                iFrameSelector: this.blocks[i].getContext()
            });
        }

        if (this.stepInfo.blocks.length)
            ShadowUI.removeClass(this.$assertionsArea, EMPTY_CLASS);
        else
            ShadowUI.addClass(this.$assertionsArea, EMPTY_CLASS);
    };

    AssertionsStep.prototype._addAssertion = function (assertionInfo, iFrameSelector, isValid) {
        var step = this,
            block = this._findBlock(iFrameSelector);

        if (!this.$assertionList)
            this._createAssertionsList();

        if (!block) {
            block = new AssertionsBlockWidget(this.$assertions, iFrameSelector, !!iFrameSelector);
            this.blocks.push(block);
        }

        var $assertion = $('<div></div>'),
            assertion = new AssertionWidget($assertion, assertionInfo, {
                enableValidation: this.options.enableAssertionsValidation,
                isValid: isValid,
                iFrameSelector: iFrameSelector
            });

        block.addAssertion($assertion, assertionInfo);

        if (this.options.updateAssertionsState)
            assertionInfo.failed = assertion.isValid === false;

        assertion.on(AssertionWidget.VALIDITY_CHANGED_EVENT, function (e) {
            assertionInfo.failed = e.isValid === false;
        });

        assertion.on(AssertionWidget.ASSERTION_CLICKED_EVENT, function () {
            UXLog.write('Assertions: edit assertion is started');
            step._showEditAssertionDialog(assertion.assertionInfo, iFrameSelector, function (e) {
                UXLog.write('Assertions: assertion is changed');
                assertionInfo.failed = step.options.updateAssertionsState ? !e.isValid : false;
                assertion.update(e.assertionInfo, e.isValid, e.iFrameSelector);
            });
        });

        assertion.on(AssertionWidget.ASSERTION_REMOVED_EVENT, function () {
            UXLog.write('Assertions: assertion is removed');

            var index = $.inArray(assertion.$assertion, block.assertions),
                scrollBarTop = parseInt(step.scrollBar.$scrollBar.css('top').replace('px', ''));

            block.removeAssertion($assertion);

            if (!block.getAssertionsCount()) {
                block.remove();
                step._removeBlock(block);
                step._updateBlocks();
            }

            assertion.getContainer().remove();

            if (step.scrollBar) {
                step.scrollBar.recalculateSize();

                if (block.assertions && block.assertions.length) {
                    //NOTE: we should  try to restore previous scroll value
                    step.scrollBar.restoreScroll(scrollBarTop);
                    step.scrollBar.updateScroll(block.assertions[index]);
                }
            }

            step._onChange();
        });
    };

    //TODO: move this to scrollBarWidget code and use in other places
    AssertionsStep.prototype._onScrollableContentHeightChange = function (difference) {
        if (!this.scrollBar)
            return;

        var scrollTop = parseInt(this.$assertions.css('top').replace('px', ''));
        if (scrollTop < 0) {
            var newScrollTop = Math.min(scrollTop - difference, 0);
            this.$assertions.css('top', newScrollTop + 'px');
            this.scrollBar.recalculateSize();
        }
    };

    AssertionsStep.prototype._showEditAssertionDialog = function (assertionInfo, iFrameSelector, onConfirm) {
        var step = this;

        if (step.options.parentPopup)
            step.options.parentPopup.hide();

        this.eventEmitter.emit(AssertionsStep.EDIT_ASSERTION_START_EVENT, {});

        var editAssertionDialog = new EditAssertionDialog(assertionInfo, {
            enableAssertionValidation: step.options.enableAssertionsValidation,
            iFrameSelector: iFrameSelector
        });

        editAssertionDialog.on(EditAssertionDialog.CONFIRM_BUTTON_CLICK_EVENT, function (e) {
            if (step.options.parentPopup)
                step.options.parentPopup.show();

            onConfirm(e);
            step._onChange();
            step.eventEmitter.emit(AssertionsStep.EDIT_ASSERTION_COMPLETE_EVENT);
        });

        editAssertionDialog.on(EditAssertionDialog.CANCEL_BUTTON_CLICK_EVENT, function () {
            if (step.options.parentPopup)
                step.options.parentPopup.show();

            step.eventEmitter.emit(AssertionsStep.EDIT_ASSERTION_COMPLETE_EVENT);
        });

        editAssertionDialog.on(EditAssertionDialog.START_PICKING_ELEMENT_EVENT, function (e) {
            step.eventEmitter.emit(AssertionsStep.START_PICKING_ELEMENT_EVENT, e);
        });
    };

    AssertionsStep.prototype._getEmptyAssertionInfo = function (methodName) {
        return {
            operator: methodName,
            message: '',
            arguments: new Array(/eq/i.test(methodName) ? 2 : 1)
        };
    };

    AssertionsStep.prototype._scrollAssertionListToBottom = function (block) {
        var lastBlock = block || this.blocks[this.blocks.length - 1],
            $lastAssertion = lastBlock.assertions[lastBlock.assertions.length - 1];

        this.scrollBar.updateScroll($lastAssertion);
    };

    //Step API
    AssertionsStep.prototype.isValid = function () {
        return !!this.stepInfo.blocks.length;
    };

    AssertionsStep.prototype.getStepInfo = function () {
        return this.stepInfo;
    };
});
TestCafeClient.define('UI.RecorderWidgets.ChoosePropertyDialog', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,

        PropertyListGenerator = require('Recorder.PropertyListGenerator'),
        PopupWidget = require('UI.RecorderWidgets.Popup'),
        ButtonWidget = require('UI.RecorderWidgets.Button'),
        ScrollBarWidget = require('UI.RecorderWidgets.ScrollBar'),
        TabsWidget = require('UI.RecorderWidgets.Tabs');

    //Const
    var BUTTONS_CLASS = 'buttons',
        WIDGET_SWITCHER_LEFT_CLASS = 'widget-switcher left',
        WIDGET_SWITCHER_RIGHT_CLASS = 'widget-switcher right',
        CLEAR_CLASS = 'clear',
        CHOOSE_PROPERTY_DIALOG_CLASS = 'choose-property-dialog',
        PROPERTY_LIST_CONTAINER_CLASS = 'property-list-container',
        PROPERTY_LIST_CLASS = 'property-list',
        PROPERTY_LIST_ITEMS_CLASS = 'property-list-items',
        PROPERTY_LIST_ITEM_CLASS = 'property-list-item',
        HOVERED_CLASS = 'hovered',
        SELECTED_CLASS = 'selected',
        EVEN_CLASS = 'even',
        PROPERTY_NAME_CLASS = 'property-name',
        PROPERTY_VALUE_CLASS = 'property-value',
        RECORDER_CLASS = 'recorder',
        RESULT_CLASS = 'result',
        COLUMN_HEADERS_CLASS = 'column-headers',
        HEADER_CLASS = 'header',
        DIALOG_WIDTH = 629;

    var ChoosePropertyDialog = this.exports = function (parsedSelector, popupPosition, iFrameContext) {
        var dialog = this;

        this.tabs = null;

        this.parsedSelector = parsedSelector;
        this.popup = null;
        this.popupPosition = popupPosition || null;
        this.selectedProperty = null;
        this.iFrameContext = iFrameContext;
        this.$selectedPropertyItem = null;

        this.$backButton = null;
        this.$nextButton = null;
        this.$dialog = null;
        this.$resultBox = null;

        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            dialog.eventEmitter.on(ev, listener);
        };

        this._createDialog();
        this._init();
    };

    //Events
    ChoosePropertyDialog.CONFIRM_BUTTON_CLICK_EVENT = 'confirmButtonClick';
    ChoosePropertyDialog.CLOSE_BUTTON_CLICK_EVENT = 'closeButtonClick';
    ChoosePropertyDialog.PREVIOUS_BUTTON_CLICK_EVENT = 'previousButtonClick';

    //Markup
    ChoosePropertyDialog.prototype._createDialog = function () {
        var dialog = this,
            $recorder = ShadowUI.select('.' + RECORDER_CLASS, ShadowUI.getRoot());

        this.$dialog = $('<div></div>');

        ShadowUI.addClass(this.$dialog, CHOOSE_PROPERTY_DIALOG_CLASS);

        var popupOptions = {
            width: DIALOG_WIDTH,
            headerText: 'Choose property',
            content: this.$dialog,
            footerContent: this._createButtons(),
            backgroundOpacity: true,
            headerCloseButton: true
        };

        this.popup = new PopupWidget($recorder, popupOptions);

        this._createResultBox();

        this.tabs = new TabsWidget(this.$dialog, {
            titles: ['common', 'css properties', 'attributes'],
            getContentCallback: function (index, callback) {
                if (index === 0) {
                    PropertyListGenerator.getGeneralProperties(dialog.parsedSelector.evalResults, dialog.parsedSelector.selector, function (properties) {
                        dialog._createProperties(properties, function ($container, createPropertiesCallback) {
                            callback($container, function () {
                                createPropertiesCallback();

                                if (dialog.popupPosition)
                                    dialog.popup.moveTo(dialog.popupPosition.left, dialog.popupPosition.top);
                            });
                        });
                    }, dialog.iFrameContext);
                }
                else if (index === 1) {
                    PropertyListGenerator.getCssProperties(dialog.parsedSelector.evalResults, dialog.parsedSelector.selector, function (properties) {
                        dialog._createProperties(properties, callback);
                    }, dialog.iFrameContext);
                }
                else {
                    PropertyListGenerator.getAttributes(dialog.parsedSelector.evalResults, dialog.parsedSelector.selector, function (properties) {
                        dialog._createProperties(properties, callback);
                    }, dialog.iFrameContext);
                }
            }
        });

        if (this.popupPosition)
            this.popup.moveTo(this.popupPosition.left, this.popupPosition.top);
        else
            this.popup.showAtWindowCenter();
    };

    ChoosePropertyDialog.prototype._createButtons = function () {
        var $buttons = $('<div></div>');
        ShadowUI.addClass($buttons, BUTTONS_CLASS);

        this.$backButton = ButtonWidget.create($buttons, 'Back', true);
        ShadowUI.addClass(this.$backButton, WIDGET_SWITCHER_LEFT_CLASS);

        this.$nextButton = ButtonWidget.create($buttons, 'Next', true);
        ShadowUI.addClass(this.$nextButton, WIDGET_SWITCHER_RIGHT_CLASS);

        //TODO: try to find common solution for all browsers
        this.$backButton.css({
            paddingLeft: Util.isMozilla ? '6px' : '9px',
            paddingRight: Util.isMozilla ? '6px' : '9px',
            width: Util.isMozilla ? '144px' : '138px'
        });

        this.$nextButton.css({
            paddingLeft: Util.isMozilla ? '6px' : '9px',
            paddingRight: Util.isMozilla ? '6px' : '9px',
            width: Util.isMozilla ? '144px' : '138px'
        });

        ShadowUI.addClass($('<div></div>').appendTo($buttons), CLEAR_CLASS);

        return $buttons;
    };

    ChoosePropertyDialog.prototype._createResultBox = function () {
        this.$resultBox = $('<div></div>').text(this.parsedSelector.selector).appendTo(this.$dialog);
        ShadowUI.addClass(this.$resultBox, RESULT_CLASS);
    };

    function createColumnHeaders($container) {
        var $columnHeaders = $('<div></div>').appendTo($container),
            $variableHeader = $('<div></div>').text('variable').appendTo($columnHeaders),
            $valueHeader = $('<div></div>').text('value').appendTo($columnHeaders);

        ShadowUI.addClass($columnHeaders, COLUMN_HEADERS_CLASS);
        ShadowUI.addClass($variableHeader, HEADER_CLASS);
        ShadowUI.addClass($valueHeader, HEADER_CLASS);
    }

    ChoosePropertyDialog.prototype._createProperties = function (properties, callback) {
        var $container = $('<div></div>');

        createColumnHeaders($container);

        var $propertyListContainer = $('<div></div>').appendTo($container),
            $propertyList = $('<div></div>').appendTo($propertyListContainer),
            $items = $('<div></div>').appendTo($propertyList);

        ShadowUI.addClass($propertyListContainer, PROPERTY_LIST_CONTAINER_CLASS);
        ShadowUI.addClass($propertyList, PROPERTY_LIST_CLASS);
        ShadowUI.addClass($items, PROPERTY_LIST_ITEMS_CLASS);

        for (var i = 0; i < properties.length; i++)
            this._createPropertyListItem(properties[i], i % 2 !== 0).appendTo($items);

        var scrollBar = new ScrollBarWidget($propertyListContainer);
        scrollBar.init($propertyList, $items);

        callback($container, function () {
            scrollBar.recalculateSize();
        });
    };

    ChoosePropertyDialog.prototype._createPropertyListItem = function (property, isEven) {
        var dialog = this;

        var $item = $('<div></div>');
        ShadowUI.addClass($item, PROPERTY_LIST_ITEM_CLASS);

        if (isEven)
            ShadowUI.addClass($item, EVEN_CLASS);

        $item.data('property', property);

        var $propertyName = $('<div></div>').text(property.name).appendTo($item);
        ShadowUI.addClass($propertyName, PROPERTY_NAME_CLASS);

        var $propertyValue = $('<div></div>').text(property.value).appendTo($item);
        ShadowUI.addClass($propertyValue, PROPERTY_VALUE_CLASS);

        if ($propertyValue[0].offsetWidth < $propertyValue[0].scrollWidth)
            $propertyValue.attr('title', property.value);

        $item.click(function () {
            if (dialog.selectedProperty === property) {
                dialog._clearSelectedPropertyItem();
                dialog.selectedProperty = null;
                dialog.$resultBox.text(dialog._getGeneratedArgument());
            }
            else
                dialog._setSelectedProperty($item, property);
        });

        $item.hover(function () {
            ShadowUI.addClass($item, HOVERED_CLASS);
        }, function () {
            ShadowUI.removeClass($item, HOVERED_CLASS);
        });

        if (property.isDefault)
            this._setSelectedProperty($item, property);

        return $item;
    };

    ChoosePropertyDialog.prototype._clearSelectedPropertyItem = function () {
        if (this.$selectedPropertyItem)
            ShadowUI.removeClass(this.$selectedPropertyItem, SELECTED_CLASS);
    };

    ChoosePropertyDialog.prototype._getGeneratedArgument = function () {
        return this.selectedProperty ? this.selectedProperty.getter : this.parsedSelector.selector;
    };

    ChoosePropertyDialog.prototype._setSelectedProperty = function ($item, property) {
        this.selectedProperty = property;
        this._clearSelectedPropertyItem();
        this.$selectedPropertyItem = $item;

        ShadowUI.addClass($item, SELECTED_CLASS);
        ShadowUI.removeClass($item, HOVERED_CLASS);

        this.$resultBox.text(this._getGeneratedArgument());
    };

//Behavior
    ChoosePropertyDialog.prototype._init = function () {
        var dialog = this;

        ShadowUI.bind(this.$backButton, 'click', function () {
            dialog._close(function () {
                dialog.eventEmitter.emit(ChoosePropertyDialog.PREVIOUS_BUTTON_CLICK_EVENT, {
                    popupPosition: dialog.popup.getPosition()
                });
            });
        });

        ShadowUI.bind(this.$nextButton, 'click', function () {
            dialog._close(function () {
                dialog.eventEmitter.emit(ChoosePropertyDialog.CONFIRM_BUTTON_CLICK_EVENT, {
                    text: dialog._getGeneratedArgument()
                });
            });
        });

        this.popup.on(PopupWidget.CLOSE_BUTTON_CLICK_EVENT, function () {
            dialog._close(function () {
                dialog.eventEmitter.emit(ChoosePropertyDialog.CLOSE_BUTTON_CLICK_EVENT, {});
            });
        });

        this.popup.onkeydown(function (e) {
            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.enter) {
                if (dialog.$nextButton && dialog.$nextButton.css('visibility') !== 'hidden')
                    dialog.$nextButton.trigger('click');
                Util.preventDefault(e);
            }

            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.esc) {
                dialog.$backButton.trigger('click');
                Util.preventDefault(e);
            }
        }, true, true);
    };

    ChoosePropertyDialog.prototype._close = function (callback) {
        this.popup.close(callback);
    };
});
TestCafeClient.define('UI.RecorderWidgets.ChooseSelectorDialog', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,

        PopupWidget = require('UI.RecorderWidgets.Popup'),
        ButtonWidget = require('UI.RecorderWidgets.Button'),
        SelectorEditorWidget = require('UI.RecorderWidgets.SelectorEditor'),
        JavascriptExecutor = require('Base.JavascriptExecutor');

    //Const
    var BUTTONS_CLASS = 'buttons',
        WIDGET_SWITCHER_LEFT_CLASS = 'widget-switcher left',
        WIDGET_SWITCHER_RIGHT_CLASS = 'widget-switcher right',
        CLEAR_CLASS = 'clear',
        CHOOSE_SELECTOR_DIALOG_CLASS = 'choose-selector-dialog',
        SELECTOR_EDITOR_CONTAINER_CLASS = 'selector-editor-container',
        RECORDER_CLASS = 'recorder',

        HEADER_TEXT = 'Element Selector',

        DIALOG_WIDTH = 629;

    var ChooseSelectorDialog = this.exports = function (elementSelectors, elementSelectorsIndex, $iFrame, popupPosition) {
        var dialog = this;

        this.popup = null;
        this.popupPosition = popupPosition || null;
        this.selectorEditor = null;
        this.elementSelectors = elementSelectors;
        this.elementSelectorsIndex = elementSelectorsIndex || 0;

        this.$nextButton = null;
        this.$backButton = null;
        this.$dialog = null;

        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            dialog.eventEmitter.on(ev, listener);
        };

        this.$iFrame = $iFrame;

        this._createDialog();

        this._init();
    };

    //Events
    ChooseSelectorDialog.CONFIRM_BUTTON_CLICK_EVENT = 'confirmButtonClick';
    ChooseSelectorDialog.CLOSE_BUTTON_CLICK_EVENT = 'closeButtonClick';

    //Markup
    ChooseSelectorDialog.prototype._createDialog = function () {
        var $recorder = ShadowUI.select('.' + RECORDER_CLASS, ShadowUI.getRoot());

        this.$dialog = $('<div></div>').css('visibility', 'hidden');
        ShadowUI.addClass(this.$dialog, CHOOSE_SELECTOR_DIALOG_CLASS);

        var popupOptions = {
            width: DIALOG_WIDTH,
            headerText: HEADER_TEXT,
            content: this.$dialog,
            footerContent: this._createButtons(),
            backgroundOpacity: true,
            headerCloseButton: true
        };

        this.popup = new PopupWidget($recorder, popupOptions);

        //selector editor must be created before popup positioning to correctly calculate its height,
        //but elements marking should be enabled after popup positioning to prevent wrong elements marking
        this._createSelectorEditor();

        if (this.popupPosition)
            this.popup.moveTo(this.popupPosition.left, this.popupPosition.top);
        else {
            var $actualElement = this.$iFrame || JavascriptExecutor.parseSelectorSync(this.elementSelectors[0].selector).$elements;

            this.popup.disposeRelativeToElement($actualElement);
        }

        this.selectorEditor.enableElementsMarking();

        this.$dialog.css('visibility', '');
    };

    ChooseSelectorDialog.prototype._createButtons = function () {
        var $buttons = $('<div></div>');
        ShadowUI.addClass($buttons, BUTTONS_CLASS);

        this.$backButton = ButtonWidget.create($buttons, 'Back', true);
        ShadowUI.addClass(this.$backButton, WIDGET_SWITCHER_LEFT_CLASS);

        this.$nextButton = ButtonWidget.create($buttons, 'Next', true);
        ShadowUI.addClass(this.$nextButton, WIDGET_SWITCHER_RIGHT_CLASS);

        //TODO: try to find common solution for all browsers
        this.$backButton.css({
            paddingLeft: Util.isMozilla ? '6px' : '9px',
            paddingRight: Util.isMozilla ? '6px' : '9px',
            width: Util.isMozilla ? '144px' : '138px'
        });

        this.$nextButton.css({
            paddingLeft: Util.isMozilla ? '6px' : '9px',
            paddingRight: Util.isMozilla ? '6px' : '9px',
            width: Util.isMozilla ? '144px' : '138px'
        });

        ShadowUI.addClass($('<div></div>').appendTo($buttons), CLEAR_CLASS);

        return $buttons;
    };

    ChooseSelectorDialog.prototype._createSelectorEditor = function () {
        var dialog = this;

        var $selectorEditorContainer = $('<div></div>').appendTo(this.$dialog);
        ShadowUI.addClass($selectorEditorContainer, SELECTOR_EDITOR_CONTAINER_CLASS);

        this.selectorEditor = new SelectorEditorWidget($selectorEditorContainer, {
            selectors: dialog.elementSelectors,
            currentSelectorIndex: dialog.elementSelectorsIndex,
            enableElementsMarking: false,
            parseDomElementsOrJqueryObjectsOnly: true,
            allowMultipleElements: true,
            allowEdit: true,
            $floatingParent: this.popup.getContainer(),
            enableValidation: true,
            context: this.$iFrame ? this.$iFrame[0].contentWindow : null
        });
    };

    ChooseSelectorDialog.prototype._onError = function () {
        this.$nextButton.css('visibility', 'hidden');
    };

    ChooseSelectorDialog.prototype._onSuccess = function () {
        this.$nextButton.css('visibility', '');
    };

//Behavior
    ChooseSelectorDialog.prototype._init = function () {
        var dialog = this;

        function onCloseButtonClick() {
            dialog._close(function () {
                dialog.eventEmitter.emit(ChooseSelectorDialog.CLOSE_BUTTON_CLICK_EVENT, {});
            });
        }

        ShadowUI.bind(this.$nextButton, 'click', function () {
            dialog._close(function () {
                dialog.eventEmitter.emit(ChooseSelectorDialog.CONFIRM_BUTTON_CLICK_EVENT, {
                    elementSelectors: dialog.elementSelectors,
                    elementSelectorsIndex: dialog.elementSelectorsIndex,
                    parsedElementSelector: dialog.selectorEditor.getParsedSelector(),
                    popupPosition: dialog.popup.getPosition()
                });
            });
        });

        ShadowUI.bind(this.$backButton, 'click', onCloseButtonClick);
        this.popup.on(PopupWidget.CLOSE_BUTTON_CLICK_EVENT, onCloseButtonClick);

        this.popup.onkeydown(function (e) {
            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.enter) {
                if (dialog.$nextButton && dialog.$nextButton.css('visibility') !== 'hidden')
                    dialog.$nextButton.trigger('click');
                Util.preventDefault(e);
            }

            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.esc) {
                dialog.$backButton.trigger('click');
                Util.preventDefault(e);
            }
        }, true, true);

        this.selectorEditor.on(SelectorEditorWidget.SELECTOR_CHANGED_EVENT, function (e) {
            if (!dialog.selectorEditor.isValid(true) || (dialog.selectorEditor.getParsedSelector() && !dialog.selectorEditor.getParsedSelector().length))
                dialog._onError();
            else {
                dialog._onSuccess();
                dialog.elementSelectors = e.selectors;
                dialog.elementSelectorsIndex = e.index;
            }
        });

        if (!dialog.selectorEditor.isValid(true) || (dialog.selectorEditor.getParsedSelector() && !dialog.selectorEditor.getParsedSelector().$elements))
            dialog._onError();
    };

    ChooseSelectorDialog.prototype._close = function (callback) {
        this.selectorEditor.destroy();
        this.popup.close(callback);
    };
});
TestCafeClient.define('UI.RecorderWidgets.EditAssertionDialog', function (require) {
    var Hammerhead = HammerheadClient.get('Hammerhead'),
        $ = Hammerhead.$,
        Util = Hammerhead.Util,
        ShadowUI = Hammerhead.ShadowUI,
        PopupWidget = require('UI.RecorderWidgets.Popup'),
        ButtonWidget = require('UI.RecorderWidgets.Button'),
        AssertionsAPI = require('TestRunner.API.Assertions'),
        AssertionArgumentEditor = require('UI.RecorderWidgets.AssertionArgument'),
        DialogPropertyWidget = require('UI.RecorderWidgets.DialogProperty'),
        IFrameContextLabel = require('Recorder.IFrameContextLabel'),
        JavascriptExecutor = require('Base.JavascriptExecutor'),

        DOUBLE_ARGUMENTS_DIALOG_WIDTH = 931,
        SINGLE_ARGUMENT_DIALOG_WIDTH = 447,

        START_PICKING_ELEMENT = 'startPickingElement',
        ACTUAL_ARGUMENT_NAME = 'Actual',
        EXPECTED_ARGUMENT_NAME = 'Expected',
        EXPRESSION_ARGUMENT_NAME = 'Expression',

        OPERATOR_ICON_CLASSES = {
            eq: 'eq-icon',
            notEq: 'not-eq-icon',
            ok: 'ok-icon',
            notOk: 'not-ok-icon'
        },

        RECORDER_CLASS = 'recorder',
        BUTTONS_CLASS = 'buttons',
        EDIT_ASSERTION_DIALOG = 'edit-assertion-dialog',
        SEPARATOR_CLASS = 'separator',
        MIDDLE_AREA_CLASS = 'middle-area',
        COPY_BUTTON_CLASS = 'copy-button',
        POPUP_HEADER_ICON_CLASS = 'header-operator-icon',
        SUCCESSFUL_CLASS = 'successful',
        FAILED_CLASS = 'failed',
        ARGUMENTS_AREA_CLASS = 'arguments-area',
        ARGUMENT_AREA_CLASS = 'argument-area',
        STATE_INDICATOR_CLASS = 'state-indicator',
        STATE_TEXT_CLASS = 'state-text',
        IFRAME_CONTEXT_CLASS = 'iframe-context';

    var EditAssertionDialog = this.exports = function (assertionInfo, options) {
        var dialog = this;

        options = options || {};
        this.options = {
            enableAssertionValidation: options.enableAssertionValidation
        };

        this.popup = null;
        this.$confirmButton = null;
        this.$cancelButton = null;
        this.$dialog = null;
        this.$middleArea = null;
        this.$copyButton = null;
        this.$stateIndicator = null;
        this.$stateText = null;
        this.$argumentsArea = null;
        this.messageEditor = null;
        this.expected = null;
        this.actual = null;
        this.operator = assertionInfo.operator;
        this.error = null;

        this.iFrameSelector = options.iFrameSelector || null;

        var $iFrame = this.iFrameSelector ? JavascriptExecutor.parseSelectorSync(this.iFrameSelector).$elements : null;
        this.iFrameContext = ($iFrame && $iFrame.length) ? $iFrame[0].contentWindow : null;


        this.eventEmitter = new Util.EventEmitter();
        this.on = function (ev, listener) {
            dialog.eventEmitter.on(ev, listener);
        };

        this._createDialog(assertionInfo);
        this._init();
        this._validate();

        if (this.iFrameSelector)
            this._createIFrameContextLabel(this.iFrameSelector);
    };

    //Assertion events
    EditAssertionDialog.CONFIRM_BUTTON_CLICK_EVENT = 'confirmButtonClick';
    EditAssertionDialog.CANCEL_BUTTON_CLICK_EVENT = 'cancelButtonClick';
    EditAssertionDialog.START_PICKING_ELEMENT_EVENT = START_PICKING_ELEMENT;

    EditAssertionDialog.prototype._createDialog = function (assertionInfo) {
        this.$dialog = $('<div></div>');
        ShadowUI.addClass(this.$dialog, EDIT_ASSERTION_DIALOG);

        var popupOptions = {
            width: assertionInfo.arguments.length === 2 ? DOUBLE_ARGUMENTS_DIALOG_WIDTH : SINGLE_ARGUMENT_DIALOG_WIDTH,
            headerText: 'Edit assertion',
            headerIconClass: POPUP_HEADER_ICON_CLASS + ' ' + OPERATOR_ICON_CLASSES[assertionInfo.operator],
            content: this.$dialog,
            footerContent: this._createButtons(),
            backgroundOpacity: true,
            showAtWindowCenter: true,
            hasParentPopup: true
        };

        var $popupParent = ShadowUI.select('.' + RECORDER_CLASS, ShadowUI.getRoot());

        this.popup = new PopupWidget($popupParent.length ? $popupParent : ShadowUI.getRoot(), popupOptions);

        this._createMessage(assertionInfo.message);
        this._createArgumentsArea(assertionInfo.arguments);

        if (this.options.enableAssertionValidation)
            this._createStateIndicator();

        this.popup.showAtWindowCenter();
    };

    EditAssertionDialog.prototype._createButtons = function () {
        var $buttons = $('<div></div>');
        ShadowUI.addClass($buttons, BUTTONS_CLASS);

        this.$confirmButton = ButtonWidget.create($buttons, 'OK');
        this.$cancelButton = ButtonWidget.create($buttons, 'Cancel');

        return $buttons;
    };

    EditAssertionDialog.prototype._createMessage = function (value) {
        this.messageEditor = new DialogPropertyWidget(this.$dialog, 'message', value, {maximizeInput: true});

        var $separator = $('<div></div>').appendTo(this.$dialog);
        ShadowUI.addClass($separator, SEPARATOR_CLASS);
    };

    EditAssertionDialog.prototype._createIFrameContextLabel = function (value) {
        var dialog = this,
            $labelContainer = $('<div></div>').prependTo(this.$argumentsArea);

        ShadowUI.addClass($labelContainer, ARGUMENT_AREA_CLASS);
        ShadowUI.addClass($labelContainer, IFRAME_CONTEXT_CLASS);

        IFrameContextLabel.create($labelContainer, value, function () {
            dialog.iFrameContext = dialog.iFrameSelector = null;
            dialog.actual.removeIFrameContext();

            if (dialog.expected)
                dialog.expected.removeIFrameContext();
        }, false);
    };

    EditAssertionDialog.prototype._createArgumentsArea = function (argumentValues) {
        var $argumentsArea = this.$argumentsArea = $('<div></div>').appendTo(this.$dialog);
        ShadowUI.addClass($argumentsArea, ARGUMENTS_AREA_CLASS);

        var $actualValueArea = $('<div></div>').appendTo($argumentsArea);
        ShadowUI.addClass($actualValueArea, ARGUMENT_AREA_CLASS);

        this.actual = this._createArgument($actualValueArea, argumentValues.length === 1 ? EXPRESSION_ARGUMENT_NAME : ACTUAL_ARGUMENT_NAME, argumentValues[0]);

        this.actual.editor.focus();
        this.actual.editor.setCursorToEnd();

        if (this.operator === 'eq' || this.operator === 'notEq')
            this._createMiddleArea($argumentsArea);

        if (argumentValues.length > 1) {
            var $expectedValueArea = $('<div></div>').appendTo($argumentsArea);
            ShadowUI.addClass($expectedValueArea, ARGUMENT_AREA_CLASS);
            this.expected = this._createArgument($expectedValueArea, EXPECTED_ARGUMENT_NAME, argumentValues[1]);

            this._monitorActualValueStateUpdate();
        }
    };

    EditAssertionDialog.prototype._createStateIndicator = function () {
        this.$stateIndicator = $('<div></div>').appendTo(this.$dialog);
        ShadowUI.addClass(this.$stateIndicator, STATE_INDICATOR_CLASS);

        this.$stateText = $('<div></div>').appendTo(this.$stateIndicator);
        ShadowUI.addClass(this.$stateText, STATE_TEXT_CLASS);
    };

    EditAssertionDialog.prototype._createArgument = function ($container, argumentName, value) {
        var assertionDialog = this;

        var argumentEditor = new AssertionArgumentEditor($container, {
            argumentName: argumentName,
            value: value,
            iFrameSelector: assertionDialog.iFrameSelector,
            iFrameContext: assertionDialog.iFrameContext,
            enableValidation: assertionDialog.options.enableAssertionValidation,
            parentPopup: assertionDialog.popup
        });

        argumentEditor.on(AssertionArgumentEditor.ARGUMENT_CHANGED_EVENT, function (e) {
            if (e.iFrameContext !== assertionDialog.iFrameContext) {
                assertionDialog.iFrameContext = e.iFrameContext;
                assertionDialog.iFrameSelector = e.iFrameSelector;

                if (e.iFrameContext)
                    assertionDialog._createIFrameContextLabel(e.iFrameSelector);

                if (argumentEditor !== assertionDialog.actual)
                    assertionDialog.actual.setIFrameContext(e.iFrameContext);
                else if (assertionDialog.expected)
                    assertionDialog.expected.setIFrameContext(e.iFrameContext);
            }

            assertionDialog._onChange();
        });

        argumentEditor.on(AssertionArgumentEditor.START_PICKING_ELEMENT_EVENT, function (e) {
            assertionDialog.eventEmitter.emit(EditAssertionDialog.START_PICKING_ELEMENT_EVENT, e);
        });

        return argumentEditor;
    };

    EditAssertionDialog.prototype._createMiddleArea = function ($container) {
        this.$middleArea = $('<div></div>').appendTo($container);
        ShadowUI.addClass(this.$middleArea, MIDDLE_AREA_CLASS);

        var $operatorIcon = $('<div></div>').appendTo(this.$middleArea);
        ShadowUI.addClass($operatorIcon, OPERATOR_ICON_CLASSES[this.operator]);

        if (this.operator === 'eq' && this.options.enableAssertionValidation) {
            this.$copyButton = ButtonWidget.create(this.$middleArea, '', true);
            ShadowUI.addClass(this.$copyButton, COPY_BUTTON_CLASS);

            this._setCopyButtonState();
        }
    };

    EditAssertionDialog.prototype._setCopyButtonState = function () {
        if (this.$copyButton) {
            if (this.actual.value && this.actual.isReproducibleValue)
                this.$copyButton.removeAttr('disabled');
            else
                this.$copyButton.attr('disabled', 'disabled');
        }
    };

    EditAssertionDialog.prototype._monitorActualValueStateUpdate = function () {
        var assertionDialog = this;

        this.actual.on(AssertionArgumentEditor.ARGUMENT_REPRODUCIBLE_STATE_UPDATED, function () {
            assertionDialog._setCopyButtonState();
        });
    };

    EditAssertionDialog.prototype._onChange = function () {
        this._validate();
    };

    EditAssertionDialog.prototype._validate = function () {
        var dialog = this,
            areArgumentsValid = this._argumentsFilled() && this.actual.isValid() && (!this.expected || this.expected.isValid());

        if (!areArgumentsValid) {
            this._onError();
            return;
        }

        this._onSuccess();

        if (!this.options.enableAssertionValidation)
            return;

        this.error = null;

        var iFrameContext = this.actual.iFrameContext,
            assertionArguments = [iFrameContext ? this.actual.value : this.actual.getLastParsedValue()];

        if (this.expected)
            assertionArguments.push(iFrameContext ? this.expected.value : this.expected.getLastParsedValue());

        assertionArguments.push(this.messageEditor.getEditorText());

        AssertionsAPI.assert(this.operator, assertionArguments, function (err) {
            dialog.error = err;
            dialog._setState(!dialog.error);
        }, iFrameContext);
    };

    EditAssertionDialog.prototype._onError = function () {
        if (this.$stateIndicator)
            this.$stateIndicator.css('visibility', 'hidden');

        this.$confirmButton.attr('disabled', 'disabled');
    };

    EditAssertionDialog.prototype._onSuccess = function () {
        this.$confirmButton.removeAttr('disabled');
    };

    EditAssertionDialog.prototype._setState = function (successful) {
        if (successful) {
            ShadowUI.removeClass(this.$stateIndicator, FAILED_CLASS);
            ShadowUI.addClass(this.$stateIndicator, SUCCESSFUL_CLASS);
            this.$stateText.text('passed');
        }
        else {
            ShadowUI.removeClass(this.$stateIndicator, SUCCESSFUL_CLASS);
            ShadowUI.addClass(this.$stateIndicator, FAILED_CLASS);
            this.$stateText.text('failed');
        }

        this.$stateIndicator.css('visibility', this._argumentsFilled() ? '' : 'hidden');
    };

    EditAssertionDialog.prototype._argumentsFilled = function () {
        return this.actual.value && !(this.expected && !this.expected.value);
    };

    EditAssertionDialog.prototype._init = function () {
        var dialog = this;

        if (this.$copyButton) {
            ShadowUI.bind(this.$copyButton, 'click', function () {
                if (dialog.expected)
                    dialog.expected.setValue(dialog.actual.objectViewer.getText());
            });
        }

        ShadowUI.bind(this.$confirmButton, 'click', function () {
            dialog._close(function () {
                dialog.eventEmitter.emit(EditAssertionDialog.CONFIRM_BUTTON_CLICK_EVENT, {
                    assertionInfo: {
                        operator: dialog.operator,
                        message: dialog.messageEditor.getEditorText(),
                        arguments: dialog.expected ? [dialog.actual.value, dialog.expected.value] : [dialog.actual.value]
                    },
                    iFrameSelector: dialog.iFrameSelector,
                    isValid: !dialog.error
                });
            });
        });

        ShadowUI.bind(this.$cancelButton, 'click', function () {
            dialog._close(function () {
                dialog.eventEmitter.emit(EditAssertionDialog.CANCEL_BUTTON_CLICK_EVENT, {});
            });
        });

        this.popup.onkeydown(function (e) {
            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.enter) {
                if (dialog.$confirmButton && dialog.$confirmButton.css('visibility') !== 'hidden')
                    dialog.$confirmButton.trigger('click');
                Util.preventDefault(e);
            }

            if (e.keyCode === Util.KEYS_MAPS.SPECIAL_KEYS.esc) {
                dialog.$cancelButton.trigger('click');
                Util.preventDefault(e);
            }
        }, true, true);
    };

    EditAssertionDialog.prototype._close = function (callback) {
        this.popup.close(callback);
    };
});
    };

    window.initTestCafeRecorderUI(window);
})();