import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import ProgressBar from './progress-bar';
import MESSAGES from './messages';


var Promise        = hammerhead.Promise;
var shadowUI       = hammerhead.shadowUI;
var nativeMethods  = hammerhead.nativeMethods;
var messageSandbox = hammerhead.eventSandbox.message;
var browserUtils   = hammerhead.utils.browser;

var styleUtils = testCafeCore.styleUtils;
var eventUtils = testCafeCore.eventUtils;
var domUtils   = testCafeCore.domUtils;


const STATUS_BAR_CLASS                     = 'status-bar';
const CONTAINER_CLASS                      = 'container';
const ICON_CLASS                           = 'icon';
const INFO_CONTAINER_CLASS                 = 'info-container';
const FIXTURE_CONTAINER_CLASS              = 'fixture-container';
const FIXTURE_DIV_CLASS                    = 'fixture';
const USER_AGENT_DIV_CLASS                 = 'user-agent';
const STATUS_CONTAINER_CLASS               = 'status-container';
const BUTTONS_CLASS                        = 'buttons';
const BUTTON_ICON_CLASS                    = 'button-icon';
const CONTINUE_BUTTON_CLASS                = 'continue';
const NEXT_ACTION_CLASS                    = 'next-action';
const STATUS_DIV_CLASS                     = 'status';
const ONLY_ICON_CLASS                      = 'only-icon';
const ONLY_BUTTONS_CLASS                   = 'only-buttons';
const ICON_AND_BUTTONS_CLASS               = 'icon-buttons';
const ICON_AND_STATUS_CLASS                = 'icon-status';
const WAITING_FAILED_CLASS                 = 'waiting-element-failed';
const WAITING_SUCCESS_CLASS                = 'waiting-element-success';
const LOADING_PAGE_TEXT                    = 'Loading Web Page...';
const WAITING_FOR_ELEMENT_TEXT             = 'Waiting for an element to appear...';
const WAITING_FOR_ASSERTION_EXECUTION_TEXT = 'Waiting for an assertion execution...';
const DEBUGGING_TEXT                       = 'Debugging test...';
const MIDDLE_WINDOW_WIDTH                  = 720;
const SMALL_WINDOW_WIDTH                   = 380;
const SMALL_WINDOW_WIDTH_IN_DEBUGGING      = 540;
const ONLY_BUTTONS_WIDTH                   = 330;
const SHOWING_DELAY                        = 300;
const ANIMATION_DELAY                      = 500;
const ANIMATION_UPDATE_INTERVAL            = 10;


export default class StatusBar {
    constructor (userAgent, fixtureName, testName) {
        this.userAgent   = userAgent;
        this.fixtureName = fixtureName;
        this.testName    = testName;

        this.statusBar        = null;
        this.container        = null;
        this.infoContainer    = null;
        this.icon             = null;
        this.fixtureContainer = null;
        this.continueButton   = null;
        this.nextActionButton = null;
        this.statusDiv        = null;
        this.buttons          = null;

        this.progressBar       = null;
        this.animationInterval = null;
        this.showingTimeout    = null;
        this.created           = false;
        this.showing           = false;
        this.hidding           = false;
        this.debugging         = false;
        this.assertionRetries  = false;

        this._createBeforeReady();
        this._initChildListening();
    }

    _createFixtureArea () {
        this.infoContainer = document.createElement('div');
        shadowUI.addClass(this.infoContainer, INFO_CONTAINER_CLASS);
        this.container.appendChild(this.infoContainer);

        this.icon = document.createElement('div');
        shadowUI.addClass(this.icon, ICON_CLASS);
        this.infoContainer.appendChild(this.icon);

        this.fixtureContainer = document.createElement('div');
        shadowUI.addClass(this.fixtureContainer, FIXTURE_CONTAINER_CLASS);
        this.infoContainer.appendChild(this.fixtureContainer);

        var fixtureDiv = document.createElement('div');

        fixtureDiv.textContent = `${this.fixtureName} - ${this.testName}`;
        shadowUI.addClass(fixtureDiv, FIXTURE_DIV_CLASS);
        this.fixtureContainer.appendChild(fixtureDiv);

        var userAgentDiv = document.createElement('div');

        userAgentDiv.textContent = this.userAgent;
        shadowUI.addClass(userAgentDiv, USER_AGENT_DIV_CLASS);
        this.fixtureContainer.appendChild(userAgentDiv);
    }

    _createStatusArea () {
        var statusContainer = document.createElement('div');

        shadowUI.addClass(statusContainer, STATUS_CONTAINER_CLASS);
        this.container.appendChild(statusContainer);

        this.statusDiv             = document.createElement('div');
        this.statusDiv.textContent = LOADING_PAGE_TEXT;

        shadowUI.addClass(this.statusDiv, STATUS_DIV_CLASS);
        statusContainer.appendChild(this.statusDiv);

        this.buttons = document.createElement('div');
        shadowUI.addClass(this.buttons, BUTTONS_CLASS);
        statusContainer.appendChild(this.buttons);

        this.continueButton   = this._createButton('Continue Test', CONTINUE_BUTTON_CLASS);
        this.nextActionButton = this._createButton('Next Action', NEXT_ACTION_CLASS);
    }

    _createButton (text, className) {
        var button = document.createElement('div');
        var icon   = document.createElement('div');
        var span   = document.createElement('span');

        span.textContent = text;

        shadowUI.addClass(button, 'button');
        shadowUI.addClass(button, className);
        shadowUI.addClass(icon, BUTTON_ICON_CLASS);

        if (browserUtils.isSafari) {
            span.style.position = 'relative';
            span.style.top      = '1px';
        }

        button.appendChild(icon);
        button.appendChild(span);
        this.buttons.appendChild(button);

        return button;
    }

    _create () {
        this.statusBar = document.createElement('div');
        this.container = document.createElement('div');

        shadowUI.addClass(this.statusBar, STATUS_BAR_CLASS);
        shadowUI.addClass(this.container, CONTAINER_CLASS);

        this.statusBar.appendChild(this.container);

        this._createFixtureArea();
        this._createStatusArea();

        this.progressBar = new ProgressBar(this.statusBar);

        this.progressBar.indeterminateIndicator.start();
        this.progressBar.show();

        shadowUI.getRoot().appendChild(this.statusBar);

        this._recalculateSizes();
        this._bindHandlers();

        this.created = true;
    }

    _createBeforeReady () {
        if (this.created || window !== window.top)
            return;

        if (document.body)
            this._create();
        else
            nativeMethods.setTimeout.call(window, () => this._createBeforeReady(), 0);
    }

    _setSizeStyle (windowWidth) {
        var smallWidth = this.debugging ? SMALL_WINDOW_WIDTH_IN_DEBUGGING : SMALL_WINDOW_WIDTH;

        if (windowWidth > MIDDLE_WINDOW_WIDTH) {
            shadowUI.removeClass(this.statusBar, ONLY_ICON_CLASS);
            shadowUI.removeClass(this.statusBar, ONLY_BUTTONS_CLASS);
            shadowUI.removeClass(this.statusBar, ICON_AND_BUTTONS_CLASS);
            shadowUI.removeClass(this.statusBar, ICON_AND_STATUS_CLASS);
        }
        else if (windowWidth < MIDDLE_WINDOW_WIDTH && windowWidth > smallWidth) {
            shadowUI.removeClass(this.statusBar, ONLY_ICON_CLASS);
            shadowUI.removeClass(this.statusBar, ONLY_BUTTONS_CLASS);
            shadowUI.removeClass(this.statusBar, ICON_AND_BUTTONS_CLASS);
            shadowUI.addClass(this.statusBar, ICON_AND_STATUS_CLASS);
        }
        else if (this.debugging) {
            if (windowWidth < smallWidth && windowWidth > ONLY_BUTTONS_WIDTH) {
                shadowUI.removeClass(this.statusBar, ONLY_ICON_CLASS);
                shadowUI.removeClass(this.statusBar, ONLY_BUTTONS_CLASS);
                shadowUI.addClass(this.statusBar, ICON_AND_BUTTONS_CLASS);
                shadowUI.removeClass(this.statusBar, ICON_AND_STATUS_CLASS);
            }
            else if (windowWidth < ONLY_BUTTONS_WIDTH) {
                shadowUI.removeClass(this.statusBar, ONLY_ICON_CLASS);
                shadowUI.addClass(this.statusBar, ONLY_BUTTONS_CLASS);
                shadowUI.removeClass(this.statusBar, ICON_AND_BUTTONS_CLASS);
                shadowUI.removeClass(this.statusBar, ICON_AND_STATUS_CLASS);
            }
        }
        else if (windowWidth < smallWidth) {
            shadowUI.removeClass(this.statusBar, ONLY_BUTTONS_CLASS);
            shadowUI.removeClass(this.statusBar, ICON_AND_STATUS_CLASS);
            shadowUI.removeClass(this.statusBar, ICON_AND_BUTTONS_CLASS);
            shadowUI.addClass(this.statusBar, ONLY_ICON_CLASS);
        }
    }

    _setFixtureContainerWidth () {
        if (styleUtils.get(this.fixtureContainer, 'display') === 'none')
            return;

        var infoContainerWidth    = styleUtils.getWidth(this.infoContainer);
        var iconWidth             = styleUtils.getWidth(this.icon);
        var iconMargin            = styleUtils.getElementMargin(this.icon);
        var fixtureContainerWidth = infoContainerWidth - iconWidth - iconMargin.left - iconMargin.right - 1;

        styleUtils.set(this.fixtureContainer, 'width', fixtureContainerWidth + 'px');
    }

    _setStatusDivLeftMargin () {
        if (styleUtils.get(this.statusDiv, 'display') === 'none')
            return;

        var infoContainerWidth = styleUtils.getWidth(this.infoContainer);
        var containerWidth     = styleUtils.getWidth(this.container);
        var statusDivWidth     = styleUtils.getWidth(this.statusDiv);
        var marginLeft         = containerWidth / 2 - statusDivWidth / 2 - infoContainerWidth;

        if (this.debugging)
            marginLeft -= styleUtils.getWidth(this.buttons) / 2;

        styleUtils.set(this.statusDiv, 'marginLeft', Math.max(Math.round(marginLeft), 0) + 'px');
    }

    _recalculateSizes () {
        var windowWidth = styleUtils.getWidth(window);

        styleUtils.set(this.statusBar, 'width', windowWidth + 'px');

        this._setSizeStyle(windowWidth);
        this._setFixtureContainerWidth();
        this._setStatusDivLeftMargin();
    }

    _animate (show) {
        var startTime         = Date.now();
        var startOpacityValue = parseInt(styleUtils.get(this.statusBar, 'opacity'), 10) || 0;
        var passedTime        = 0;
        var progress          = 0;
        var delta             = 0;

        this._stopAnimation();

        this.animationInterval = nativeMethods.setInterval.call(window, () => {
            passedTime = Date.now() - startTime;
            progress   = Math.min(passedTime / ANIMATION_DELAY, 1);
            delta      = 0.5 - Math.cos(progress * Math.PI) / 2;

            styleUtils.set(this.statusBar, 'opacity', startOpacityValue + (show ? delta : -delta));

            if (progress === 1) {
                this._stopAnimation();
                this.showing = false;
                this.hidding = false;
            }
        }, ANIMATION_UPDATE_INTERVAL);
    }

    _stopAnimation () {
        if (this.animationInterval) {
            nativeMethods.clearInterval.call(window, this.animationInterval);
            this.animationInterval = null;
        }
    }

    _bindHandlers () {
        eventUtils.bind(window, 'resize', () => this._recalculateSizes());

        eventUtils.bind(this.statusBar, 'mouseover', () => {
            if (this.hidding || this.debugging)
                return;

            this.showing = false;
            this.hidding = true;
            this._animate();
        });

        eventUtils.bind(this.statusBar, 'mouseout', e => {
            if (this.showing || this.debugging)
                return;

            if (!domUtils.containsElement(this.statusBar, e.relatedTarget)) {
                this.hidding = false;
                this.showing = true;
                this._animate(true);
            }
        });

        eventUtils.bind(this.statusBar, browserUtils.isTouchDevice ? 'touchstart' : 'mousedown', eventUtils.preventDefault);
    }

    _initChildListening () {
        messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
            var msg = e.message;

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
        this.debugging = false;

        this.buttons.style.display = 'none';

        this.statusDiv.textContent = '';
        this.progressBar.hide();
    }

    _showWaitingStatus () {
        this.statusDiv.textContent = this.assertionRetries ? WAITING_FOR_ASSERTION_EXECUTION_TEXT : WAITING_FOR_ELEMENT_TEXT;
        this._setStatusDivLeftMargin();
        this.progressBar.show();
    }

    _hideWaitingStatus (forceReset) {
        return new Promise(resolve => {
            nativeMethods.setTimeout.call(window, () => {
                shadowUI.removeClass(this.statusBar, WAITING_SUCCESS_CLASS);
                shadowUI.removeClass(this.statusBar, WAITING_FAILED_CLASS);

                this.progressBar.determinateIndicator.reset();

                this._resetState();
                resolve();
            }, forceReset ? 0 : ANIMATION_DELAY);
        });
    }

    _showDebuggingStatus () {
        return new Promise(resolve => {
            this.debugging = true;

            this.statusDiv.textContent = DEBUGGING_TEXT;
            this.buttons.style.display = 'inline-block';

            this._recalculateSizes();

            var eventName               = browserUtils.isTouchDevice ? 'touchstart' : 'mousedown';
            var continueButtonHandler   = null;
            var nextActionButtonHandler = null;

            continueButtonHandler = e => {
                eventUtils.preventDefault(e);
                this._resetState();
                eventUtils.unbind(this.continueButton, eventName, continueButtonHandler);
                eventUtils.unbind(this.nextActionButton, eventName, nextActionButtonHandler);
                resolve();
            };

            nextActionButtonHandler = e => {
                eventUtils.preventDefault(e);
                this._resetState();
                eventUtils.unbind(this.continueButton, eventName, continueButtonHandler);
                eventUtils.unbind(this.nextActionButton, eventName, nextActionButtonHandler);
                resolve(true);
            };

            eventUtils.bind(this.continueButton, eventName, continueButtonHandler);
            eventUtils.bind(this.nextActionButton, eventName, nextActionButtonHandler);
        });
    }

    _setWaitingStatus (timeout, startTime) {
        this.progressBar.determinateIndicator.start(timeout, startTime);

        this.showingTimeout = nativeMethods.setTimeout.call(window, () => {
            this.showingTimeout = null;

            this._showWaitingStatus();
        }, SHOWING_DELAY);
    }

    _resetWaitingStatus (waitingSuccess) {
        this.progressBar.determinateIndicator.stop();

        if (waitingSuccess)
            shadowUI.addClass(this.statusBar, WAITING_SUCCESS_CLASS);
        else
            shadowUI.addClass(this.statusBar, WAITING_FAILED_CLASS);

        var forceReset = this.showingTimeout && waitingSuccess;

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
        if (!this.created)
            this._create();

        this.progressBar.indeterminateIndicator.stop();
        this._resetState();
    }

    showDebuggingStatus () {
        this._stopAnimation();
        styleUtils.set(this.statusBar, 'opacity', 1);

        return this._showDebuggingStatus();
    }

    showWaitingElementStatus (timeout) {
        if (!this.assertionRetries)
            this._setWaitingStatus(timeout);
    }

    hideWaitingElementStatus (waitingSuccess) {
        if (!this.assertionRetries)
            return this._resetWaitingStatus(waitingSuccess);

        return Promise.resolve();
    }

    showWaitingAssertionRetriesStatus (timeout, startTime) {
        this.assertionRetries = true;
        this._setWaitingStatus(timeout, startTime);
    }

    hideWaitingAssertionRetriesStatus (waitingSuccess) {
        return this._resetWaitingStatus(waitingSuccess)
            .then(() => {
                this.assertionRetries = false;
            });
    }
}
