import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import ProgressBar from './progress-bar';
import uiRoot from '../ui-root';
import MESSAGES from './messages';
import DEBUG_ACTION from '../../../utils/debug-action';
import isIframeWindow from '../../../utils/is-window-in-iframe';


const Promise          = hammerhead.Promise;
const shadowUI         = hammerhead.shadowUI;
const nativeMethods    = hammerhead.nativeMethods;
const messageSandbox   = hammerhead.eventSandbox.message;
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;
const listeners        = hammerhead.eventSandbox.listeners;

const styleUtils   = testCafeCore.styleUtils;
const eventUtils   = testCafeCore.eventUtils;
const domUtils     = testCafeCore.domUtils;
const serviceUtils = testCafeCore.serviceUtils;
const arrayUtils   = testCafeCore.arrayUtils;


const STATUS_BAR_CLASS                     = 'status-bar';
const ICON_CLASS                           = 'icon';
const INFO_CONTAINER_CLASS                 = 'info-container';
const INFO_TEXT_CONTAINER_CLASS            = 'info-text-container';
const ACTIONS_CONTAINER_CLASS              = 'actions-container';
const FIXTURE_DIV_CLASS                    = 'fixture';
const STATUS_CONTAINER_CLASS               = 'status-container';
const INFO_CLASS                           = 'info';
const STATUS_DIV_CLASS                     = 'status';
const USER_AGENT_DIV_CLASS                 = 'user-agent';
const BUTTONS_CLASS                        = 'buttons';
const BUTTON_CLASS                         = 'button';
const BUTTON_ICON_CLASS                    = 'button-icon';

const LOCKED_BUTTON_CLASS                  = 'locked';
const UNLOCKED_BUTTON_CLASS                = 'unlocked';
const RESUME_BUTTON_CLASS                  = 'resume';
const STEP_BUTTON_CLASS                    = 'step';
const FINISH_BUTTON_CLASS                  = 'finish';

const WAITING_FAILED_CLASS                 = 'waiting-element-failed';
const WAITING_SUCCESS_CLASS                = 'waiting-element-success';

const LOADING_PAGE_TEXT                    = 'Loading Web Page...';
const WAITING_FOR_ELEMENT_TEXT             = 'Waiting for element to appear...';
const WAITING_FOR_ASSERTION_EXECUTION_TEXT = 'Waiting for assertion execution...';
const DEBUGGING_TEXT                       = 'Debugging test...';
const TEST_FAILED_TEXT                     = 'Test failed';
const UNLOCK_PAGE_TEXT                     = 'Unlock Page';
const PAGE_UNLOCKED_TEXT                   = 'Page unlocked';

const SHOWING_DELAY                        = 300;
const ANIMATION_DELAY                      = 500;
const ANIMATION_UPDATE_INTERVAL            = 10;

const LOCAL_STORAGE_STATUS_PREFIX_ITEM     = '%testCafeStatusPrefix%';

export default class StatusBar extends serviceUtils.EventEmitter {
    constructor (userAgent, fixtureName, testName, contextStorage) {
        super();

        this.UNLOCK_PAGE_BTN_CLICK = 'testcafe|ui|status-bar|unlock-page-btn-click';

        this.userAgent      = userAgent;
        this.fixtureName    = fixtureName;
        this.testName       = testName;
        this.contextStorage = contextStorage;

        this.statusBar        = null;
        this.infoContainer    = null;
        this.actionsContainer = null;
        this.icon             = null;
        this.resumeButton     = null;
        this.finishButton     = null;
        this.nextButton       = null;
        this.statusDiv        = null;
        this.buttons          = null;

        this.progressBar       = null;
        this.animationInterval = null;
        this.showingTimeout    = null;

        this.windowHeight = document.documentElement ? styleUtils.getHeight(window) : window.innerHeight;

        this.state = {
            created:          false,
            showing:          false,
            hiding:           false,
            debugging:        false,
            waiting:          false,
            assertionRetries: false,
            hidden:           false
        };

        this.currentView       = null;

        this._createBeforeReady();
        this._initChildListening();
    }

    _createButton (text, className) {
        const button = document.createElement('div');
        const icon   = document.createElement('div');
        const span   = document.createElement('span');

        nativeMethods.nodeTextContentSetter.call(span, text);

        shadowUI.addClass(button, BUTTON_CLASS);
        shadowUI.addClass(button, className);
        shadowUI.addClass(icon, BUTTON_ICON_CLASS);

        if (browserUtils.isSafari) {
            span.style.position = 'relative';
            span.style.top      = '1px';
        }

        button.appendChild(icon);
        button.appendChild(span);

        return button;
    }

    _createIconArea () {
        this.icon = document.createElement('div');
        shadowUI.addClass(this.icon, ICON_CLASS);
        this.statusBar.appendChild(this.icon);
    }

    _createInformationArea () {
        this.infoContainer = document.createElement('div');
        shadowUI.addClass(this.infoContainer, INFO_CONTAINER_CLASS);
        this.statusBar.appendChild(this.infoContainer);

        const infoTextContainer = document.createElement('div');

        shadowUI.addClass(infoTextContainer, INFO_TEXT_CONTAINER_CLASS);
        this.infoContainer.appendChild(infoTextContainer);

        const statusContainer = document.createElement('div');

        shadowUI.addClass(statusContainer, STATUS_CONTAINER_CLASS);
        infoTextContainer.appendChild(statusContainer);

        this.statusDiv = document.createElement('div');

        this.statusDiv = document.createElement('div');

        nativeMethods.nodeTextContentSetter.call(this.statusDiv, this._getFullStatusText(LOADING_PAGE_TEXT));

        shadowUI.addClass(this.statusDiv, STATUS_DIV_CLASS);
        shadowUI.addClass(this.statusDiv, INFO_CLASS);

        statusContainer.appendChild(this.statusDiv);

        const fixtureDiv = document.createElement('div');

        nativeMethods.nodeTextContentSetter.call(fixtureDiv, `${this.fixtureName} - ${this.testName}`);
        shadowUI.addClass(fixtureDiv, FIXTURE_DIV_CLASS);
        shadowUI.addClass(fixtureDiv, INFO_CLASS);
        statusContainer.appendChild(fixtureDiv);

        const userAgentDiv = document.createElement('div');

        nativeMethods.nodeTextContentSetter.call(userAgentDiv, this.userAgent);
        shadowUI.addClass(userAgentDiv, USER_AGENT_DIV_CLASS);
        infoTextContainer.appendChild(userAgentDiv);
    }

    _createActionsArea () {
        this.actionsContainer = document.createElement('div');
        shadowUI.addClass(this.actionsContainer, ACTIONS_CONTAINER_CLASS);
        this.statusBar.appendChild(this.actionsContainer);

        this.buttons = document.createElement('div');
        shadowUI.addClass(this.buttons, BUTTONS_CLASS);
        this.actionsContainer.appendChild(this.buttons);

        this.unlockButton = this._createButton(UNLOCK_PAGE_TEXT, LOCKED_BUTTON_CLASS);
        this.resumeButton = this._createButton('Resume', RESUME_BUTTON_CLASS);
        this.nextButton   = this._createButton('Next Action', STEP_BUTTON_CLASS);
        this.finishButton = this._createButton('Finish', FINISH_BUTTON_CLASS);

        this.buttons.appendChild(this.unlockButton);
        this.buttons.appendChild(this.resumeButton);
        this.buttons.appendChild(this.nextButton);

        this.actionsContainer.style.display = 'none';

        this._bindClickOnce([this.unlockButton], () => {
            shadowUI.removeClass(this.unlockButton, LOCKED_BUTTON_CLASS);
            shadowUI.addClass(this.unlockButton, UNLOCKED_BUTTON_CLASS);
            nativeMethods.nodeTextContentSetter.call(this.unlockButton.querySelector('span'), PAGE_UNLOCKED_TEXT);
            this.state.locked = false;

            this.emit(this.UNLOCK_PAGE_BTN_CLICK, {});
        });

        this.unlockButton.style.display = 'none';
    }

    _create () {
        this.statusBar = document.createElement('div');

        shadowUI.addClass(this.statusBar, STATUS_BAR_CLASS);

        this._createIconArea();

        this._createInformationArea();
        this._createActionsArea();

        this.progressBar = new ProgressBar(this.infoContainer);

        this.progressBar.indeterminateIndicator.start();
        this.progressBar.show();

        uiRoot.element().appendChild(this.statusBar);

        this._bindHandlers();

        this.state.created = true;
    }

    _createBeforeReady () {
        if (this.state.created || isIframeWindow(window))
            return;

        if (document.body)
            this._create();
        else
            nativeMethods.setTimeout.call(window, () => this._createBeforeReady(), 0);
    }

    _animate (show) {
        const startTime         = nativeMethods.dateNow();
        const startOpacityValue = parseInt(styleUtils.get(this.statusBar, 'opacity'), 10) || 0;
        let passedTime        = 0;
        let progress          = 0;
        let delta             = 0;

        this._stopAnimation();

        if (show) {
            styleUtils.set(this.statusBar, 'visibility', '');
            this.state.hidden = false;
        }

        this.animationInterval = nativeMethods.setInterval.call(window, () => {
            passedTime = nativeMethods.dateNow() - startTime;
            progress   = Math.min(passedTime / ANIMATION_DELAY, 1);
            delta      = 0.5 - Math.cos(progress * Math.PI) / 2;

            styleUtils.set(this.statusBar, 'opacity', startOpacityValue + (show ? delta : -delta));

            if (progress === 1) {
                this._stopAnimation();

                if (!show) {
                    styleUtils.set(this.statusBar, 'visibility', 'hidden');
                    this.state.hidden = true;
                }

                this.state.showing = false;
                this.state.hiding  = false;
            }
        }, ANIMATION_UPDATE_INTERVAL);
    }

    _stopAnimation () {
        if (this.animationInterval) {
            nativeMethods.clearInterval.call(window, this.animationInterval);
            this.animationInterval = null;
        }
    }

    _fadeOut () {
        if (this.state.hiding || this.state.debugging)
            return;

        this.state.showing = false;
        this.state.hiding  = true;
        this._animate();
    }

    _fadeIn () {
        if (this.state.showing || this.state.debugging)
            return;

        this.state.hiding  = false;
        this.state.showing = true;
        this._animate(true);
    }

    _bindHandlers () {
        listeners.initElementListening(window, ['resize']);
        listeners.addInternalEventBeforeListener(window, ['resize'], () => {
            this.windowHeight = window.innerHeight;
        });

        const statusBarHeight = styleUtils.getHeight(this.statusBar);

        listeners.addFirstInternalEventBeforeListener(window, ['mousemove', 'mouseout', 'touchmove'], e => {
            if (e.type === 'mouseout' && !e.relatedTarget)
                this._fadeIn(e);
            else if (e.type === 'mousemove' || e.type === 'touchmove') {
                if (e.clientY > this.windowHeight - statusBarHeight)
                    this._fadeOut(e);
                else if (this.state.hidden)
                    this._fadeIn(e);
            }
        });
    }

    _bindClickOnce (elements, handler) {
        const eventName = featureDetection.isTouchDevice ? 'touchstart' : 'mousedown';

        const downHandler = e => {
            const isTargetElement = !!arrayUtils.find(elements, el => domUtils.containsElement(el, e.target));

            if (isTargetElement) {
                eventUtils.preventDefault(e);
                listeners.removeInternalEventBeforeListener(window, [eventName], downHandler);

                handler(e);
            }
            else if (domUtils.containsElement(this.statusBar, e.target))
                eventUtils.preventDefault(e);
        };

        listeners.addInternalEventBeforeListener(window, [eventName], downHandler);
    }

    _initChildListening () {
        messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
            const msg = e.message;

            if (msg.cmd === MESSAGES.startWaitingElement)
                this.showWaitingElementStatus(msg.timeout);
            else if (msg.cmd === MESSAGES.endWaitingElementRequest) {
                this.hideWaitingElementStatus(msg.waitingSuccess)
                    .then(() => messageSandbox.sendServiceMsg({ cmd: MESSAGES.endWaitingElementResponse }, e.source));
            }
            else if (msg.cmd === MESSAGES.startWaitingAssertionRetries)
                this.showWaitingAssertionRetriesStatus(msg.timeout);
            else if (msg.cmd === MESSAGES.endWaitingAssertionRetriesRequest) {
                this.hideWaitingAssertionRetriesStatus(msg.waitingSuccess)
                    .then(() => messageSandbox.sendServiceMsg({ cmd: MESSAGES.endWaitingAssertionRetriesResponse }, e.source));
            }
        });
    }

    _resetState () {
        this.state.debugging = false;

        this.actionsContainer.style.display = 'none';
        this.unlockButton.style.display     = 'none';

        nativeMethods.nodeTextContentSetter.call(this.statusDiv, this._getFullStatusText(''));
        this.progressBar.hide();
    }

    _getFullStatusText (statusText) {
        const prefixText = this.contextStorage.getItem(LOCAL_STORAGE_STATUS_PREFIX_ITEM) || '';
        const separator = prefixText && statusText ? '. ' : '';

        return prefixText + separator + statusText;
    }

    _showWaitingStatus () {
        const waitingStatusText = this.state.assertionRetries ? WAITING_FOR_ASSERTION_EXECUTION_TEXT : WAITING_FOR_ELEMENT_TEXT;

        nativeMethods.nodeTextContentSetter.call(this.statusDiv, this._getFullStatusText(waitingStatusText));

        this.progressBar.show();
    }

    _hideWaitingStatus (forceReset) {
        return new Promise(resolve => {
            nativeMethods.setTimeout.call(window, () => {
                if (this.state.waiting || this.state.debugging) {
                    resolve();
                    return;
                }

                shadowUI.removeClass(this.statusBar, WAITING_SUCCESS_CLASS);
                shadowUI.removeClass(this.statusBar, WAITING_FAILED_CLASS);

                this.progressBar.determinateIndicator.reset();

                this._resetState();

                resolve();
            }, forceReset ? 0 : ANIMATION_DELAY);
        });
    }

    _showDebuggingStatus (isTestError) {
        return new Promise(resolve => {
            this.state.debugging = true;
            this.state.locked    = true;

            if (isTestError) {
                this.buttons.removeChild(this.nextButton);
                this.buttons.removeChild(this.resumeButton);
                this.buttons.appendChild(this.finishButton);

                nativeMethods.nodeTextContentSetter.call(this.statusDiv, this._getFullStatusText(TEST_FAILED_TEXT));
                shadowUI.removeClass(this.statusBar, WAITING_SUCCESS_CLASS);
                shadowUI.addClass(this.statusBar, WAITING_FAILED_CLASS);
            }
            else
                nativeMethods.nodeTextContentSetter.call(this.statusDiv, this._getFullStatusText(DEBUGGING_TEXT));

            this.actionsContainer.style.display = '';
            this.unlockButton.style.display     = '';


            this._bindClickOnce([this.resumeButton, this.nextButton, this.finishButton], e => {
                const isNextButton = domUtils.containsElement(this.nextButton, e.target);

                this._resetState();

                resolve(isNextButton ? DEBUG_ACTION.step : DEBUG_ACTION.resume);
            });
        });
    }

    _setWaitingStatus (timeout, startTime) {
        this.state.waiting = true;
        this.progressBar.determinateIndicator.start(timeout, startTime);

        this.showingTimeout = nativeMethods.setTimeout.call(window, () => {
            this.showingTimeout = null;

            this._showWaitingStatus();
        }, SHOWING_DELAY);
    }

    _resetWaitingStatus (waitingSuccess) {
        this.state.waiting = false;
        this.progressBar.determinateIndicator.stop();

        if (waitingSuccess)
            shadowUI.addClass(this.statusBar, WAITING_SUCCESS_CLASS);
        else
            shadowUI.addClass(this.statusBar, WAITING_FAILED_CLASS);

        const forceReset = this.showingTimeout && waitingSuccess;

        if (this.showingTimeout) {
            nativeMethods.clearTimeout.call(window, this.showingTimeout);
            this.showingTimeout = null;

            if (!waitingSuccess)
                this._showWaitingStatus();
        }

        return this._hideWaitingStatus(forceReset);
    }

    //API
    hidePageLoadingStatus () {
        if (!this.state.created)
            this._create();

        this.progressBar.indeterminateIndicator.stop();
        this._resetState();
    }

    showDebuggingStatus (isTestError) {
        this._stopAnimation();

        styleUtils.set(this.statusBar, 'opacity', 1);
        styleUtils.set(this.statusBar, 'visibility', '');
        this.state.hiden = false;

        return this._showDebuggingStatus(isTestError);
    }

    showWaitingElementStatus (timeout) {
        if (!this.state.assertionRetries)
            this._setWaitingStatus(timeout);
    }

    hideWaitingElementStatus (waitingSuccess) {
        if (!this.state.assertionRetries)
            return this._resetWaitingStatus(waitingSuccess);

        return Promise.resolve();
    }

    showWaitingAssertionRetriesStatus (timeout, startTime) {
        this.state.assertionRetries = true;
        this._setWaitingStatus(timeout, startTime);
    }

    hideWaitingAssertionRetriesStatus (waitingSuccess) {
        return this._resetWaitingStatus(waitingSuccess)
            .then(() => {
                this.state.assertionRetries = false;
            });
    }

    setStatusPrefix (prefixText) {
        this.contextStorage.setItem(LOCAL_STORAGE_STATUS_PREFIX_ITEM, prefixText);
        nativeMethods.nodeTextContentSetter.call(this.statusDiv, this._getFullStatusText(''));
    }
}
