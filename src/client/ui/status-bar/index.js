import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import ProgressBar from './progress-bar';
import uiRoot from '../ui-root';
import MESSAGES from './messages';


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
const CONTAINER_CLASS                      = 'container';
const ICON_CLASS                           = 'icon';
const INFO_CONTAINER_CLASS                 = 'info-container';
const FIXTURE_CONTAINER_CLASS              = 'fixture-container';
const FIXTURE_DIV_CLASS                    = 'fixture';
const USER_AGENT_DIV_CLASS                 = 'user-agent';
const STATUS_CONTAINER_CLASS               = 'status-container';
const UNLOCK_PAGE_AREA_CLASS               = 'unlock-page-area';
const UNLOCK_PAGE_CONTAINER_CLASS          = 'unlock-page-container';
const UNLOCK_ICON_CLASS                    = 'unlock-icon';
const ICON_SEPARATOR_CLASS                 = 'icon-separator';
const LOCKED_CLASS                         = 'locked';
const UNLOCKED_CLASS                       = 'unlocked';
const BUTTONS_CLASS                        = 'buttons';
const BUTTON_ICON_CLASS                    = 'button-icon';
const RESUME_BUTTON_CLASS                  = 'resume';
const STEP_CLASS                           = 'step';
const STATUS_DIV_CLASS                     = 'status';
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

const VIEWS = {
    all:                { name: 'show-all-elements', maxSize: Infinity },
    hideFixture:        { name: 'hide-fixture', maxSize: 940, className: 'icon-status-view' },
    hideStatus:         { name: 'hide-status-debugging', maxSize: 740, className: 'icon-unlock-buttons-view' },
    hideUnlockArea:     { name: 'hide-unlock-area', maxSize: 460, className: 'icon-buttons-view' },
    onlyButtons:        { name: 'show-buttons-only', maxSize: 330, className: 'only-buttons-view' },
    onlyIconAndFixture: { name: 'show-icon-fixture-only', maxSize: Infinity, className: 'only-icon-fixture-view' },
    onlyIcon:           { name: 'show-icon-only', maxSize: 380, className: 'only-icon-view' }
};

const REGULAR_VIEW_SEQUENCE   = [VIEWS.onlyIcon, VIEWS.onlyIconAndFixture];
const WAITING_VIEW_SEQUENCE   = [VIEWS.onlyIcon, VIEWS.hideFixture, VIEWS.all];
const DEBUGGING_VIEW_SEQUENCE = [VIEWS.onlyButtons, VIEWS.hideUnlockArea, VIEWS.hideStatus, VIEWS.hideFixture, VIEWS.all];

export default class StatusBar extends serviceUtils.EventEmitter {
    constructor (userAgent, fixtureName, testName) {
        super();

        this.UNLOCK_PAGE_BTN_CLICK = 'testcafe|ui|status-bar|unlock-page-btn-click';

        this.userAgent   = userAgent;
        this.fixtureName = fixtureName;
        this.testName    = testName;

        this.statusBar        = null;
        this.container        = null;
        this.infoContainer    = null;
        this.icon             = null;
        this.fixtureContainer = null;
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

        this.currentView = null;

        this._createBeforeReady();
        this._initChildListening();
    }

    _createFixtureArea () {
        this.infoContainer = document.createElement('div');
        shadowUI.addClass(this.infoContainer, INFO_CONTAINER_CLASS);
        shadowUI.addClass(this.infoContainer, INFO_CONTAINER_CLASS);
        this.container.appendChild(this.infoContainer);

        this.icon = document.createElement('div');
        shadowUI.addClass(this.icon, ICON_CLASS);
        this.infoContainer.appendChild(this.icon);

        this.fixtureContainer = document.createElement('div');
        shadowUI.addClass(this.fixtureContainer, FIXTURE_CONTAINER_CLASS);
        this.infoContainer.appendChild(this.fixtureContainer);

        const fixtureDiv = document.createElement('div');

        nativeMethods.nodeTextContentSetter.call(fixtureDiv, `${this.fixtureName} - ${this.testName}`);
        shadowUI.addClass(fixtureDiv, FIXTURE_DIV_CLASS);
        this.fixtureContainer.appendChild(fixtureDiv);

        const userAgentDiv = document.createElement('div');

        nativeMethods.nodeTextContentSetter.call(userAgentDiv, this.userAgent);
        shadowUI.addClass(userAgentDiv, USER_AGENT_DIV_CLASS);
        this.fixtureContainer.appendChild(userAgentDiv);
    }

    _createUnlockPageArea (container) {
        const unlockPageArea      = document.createElement('div');
        const unlockPageContainer = document.createElement('div');
        const unlockIcon          = document.createElement('div');
        const iconSeparator       = document.createElement('div');
        const unlockText          = document.createElement('span');

        nativeMethods.nodeTextContentSetter.call(unlockText, UNLOCK_PAGE_TEXT);

        shadowUI.addClass(unlockPageArea, UNLOCK_PAGE_AREA_CLASS);
        shadowUI.addClass(unlockPageContainer, UNLOCK_PAGE_CONTAINER_CLASS);
        shadowUI.addClass(unlockPageContainer, LOCKED_CLASS);
        shadowUI.addClass(unlockIcon, UNLOCK_ICON_CLASS);
        shadowUI.addClass(iconSeparator, ICON_SEPARATOR_CLASS);

        container.appendChild(unlockPageArea);
        unlockPageArea.appendChild(unlockPageContainer);
        unlockPageContainer.appendChild(unlockIcon);
        unlockPageContainer.appendChild(unlockText);
        unlockPageContainer.appendChild(iconSeparator);

        this._bindClickOnce([unlockPageContainer], () => {
            shadowUI.removeClass(unlockPageContainer, LOCKED_CLASS);
            shadowUI.addClass(unlockPageContainer, UNLOCKED_CLASS);
            nativeMethods.nodeTextContentSetter.call(unlockText, PAGE_UNLOCKED_TEXT);

            this.emit(this.UNLOCK_PAGE_BTN_CLICK, {});
        });

        unlockPageArea.style.display = 'none';

        return unlockPageArea;
    }

    _createStatusArea () {
        const statusContainer = document.createElement('div');

        shadowUI.addClass(statusContainer, STATUS_CONTAINER_CLASS);
        this.container.appendChild(statusContainer);

        this.statusDiv = document.createElement('div');

        nativeMethods.nodeTextContentSetter.call(this.statusDiv, LOADING_PAGE_TEXT);

        shadowUI.addClass(this.statusDiv, STATUS_DIV_CLASS);

        if (browserUtils.isMacPlatform)
            this.statusDiv.style.marginTop = '11px';

        statusContainer.appendChild(this.statusDiv);

        this.unlockPageArea = this._createUnlockPageArea(statusContainer);

        this.buttons = document.createElement('div');
        shadowUI.addClass(this.buttons, BUTTONS_CLASS);
        statusContainer.appendChild(this.buttons);

        this.resumeButton = this._createButton('Resume', RESUME_BUTTON_CLASS);
        this.nextButton   = this._createButton('Next Action', STEP_CLASS);
        this.finishButton = this._createButton('Finish', RESUME_BUTTON_CLASS);

        this.buttons.appendChild(this.resumeButton);
        this.buttons.appendChild(this.nextButton);
        this.buttons.style.display = 'none';
    }

    _createButton (text, className) {
        const button = document.createElement('div');
        const icon   = document.createElement('div');
        const span   = document.createElement('span');

        nativeMethods.nodeTextContentSetter.call(span, text);

        shadowUI.addClass(button, 'button');
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

        uiRoot.element().appendChild(this.statusBar);

        this._recalculateSizes();
        this._bindHandlers();

        this.state.created = true;
    }

    _createBeforeReady () {
        if (this.state.created || window !== window.top)
            return;

        if (document.body)
            this._create();
        else
            nativeMethods.setTimeout.call(window, () => this._createBeforeReady(), 0);
    }

    _switchView (newView) {
        if (this.currentView && this.currentView.name === newView.name)
            return;

        if (this.currentView && this.currentView.className)
            shadowUI.removeClass(this.statusBar, this.currentView.className);

        if (newView.className)
            shadowUI.addClass(this.statusBar, newView.className);

        this.currentView = newView;
    }

    _getActualViewSequence () {
        if (this.state.debugging)
            return DEBUGGING_VIEW_SEQUENCE;

        if (this.state.waiting)
            return WAITING_VIEW_SEQUENCE;

        return REGULAR_VIEW_SEQUENCE;
    }

    _calculateActualView (windowWidth) {
        return this
            ._getActualViewSequence()
            .reduce((currentView, nextView) => currentView.maxSize >= windowWidth ? currentView : nextView);
    }

    _setFixtureContainerWidth () {
        if (styleUtils.get(this.fixtureContainer, 'display') === 'none')
            return;

        const infoContainerWidth    = styleUtils.getWidth(this.infoContainer);
        const iconWidth             = styleUtils.getWidth(this.icon);
        const iconMargin            = styleUtils.getElementMargin(this.icon);
        const fixtureContainerWidth = infoContainerWidth - iconWidth - iconMargin.left - iconMargin.right - 1;

        styleUtils.set(this.fixtureContainer, 'width', fixtureContainerWidth + 'px');
    }

    _setStatusDivLeftMargin () {
        const parent = nativeMethods.nodeParentNodeGetter.call(this.statusDiv);

        if (!parent || styleUtils.get(parent, 'display') === 'none')
            return;

        const statusDivHidden = styleUtils.get(this.statusDiv, 'display') === 'none';

        const infoContainerWidth = styleUtils.getWidth(this.infoContainer);
        const containerWidth     = styleUtils.getWidth(this.container);
        const statusDivWidth     = statusDivHidden ? 0 : styleUtils.getWidth(this.statusDiv);

        let marginLeft = containerWidth / 2 - statusDivWidth / 2 - infoContainerWidth;

        if (this.state.debugging) {
            marginLeft -= styleUtils.getWidth(this.buttons) / 2;
            marginLeft -= styleUtils.getWidth(this.unlockPageArea) / 2;
        }

        const marginLeftStr = Math.max(Math.round(marginLeft), 0) + 'px';

        styleUtils.set(this.statusDiv, 'marginLeft', statusDivHidden ? 0 : marginLeftStr);
        styleUtils.set(parent, 'marginLeft', statusDivHidden ? marginLeftStr : 0);
    }

    _recalculateSizes () {
        const windowWidth = styleUtils.getWidth(window);

        this.windowHeight = styleUtils.getHeight(window);

        styleUtils.set(this.statusBar, 'width', windowWidth + 'px');

        this._switchView(this._calculateActualView(windowWidth));
        this._setFixtureContainerWidth();
        this._setStatusDivLeftMargin();
    }

    _animate (show) {
        const startTime         = Date.now();
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
            passedTime = Date.now() - startTime;
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
        listeners.addInternalEventListener(window, ['resize'], () => this._recalculateSizes());

        const statusBarHeight = styleUtils.getHeight(this.statusBar);

        listeners.addFirstInternalHandler(window, ['mousemove', 'mouseout'], e => {
            if (e.type === 'mouseout' && !e.relatedTarget)
                this._fadeIn(e);
            else if (e.type === 'mousemove') {
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
                listeners.removeInternalEventListener(window, [eventName], downHandler);

                handler(e);
            }
            else if (domUtils.containsElement(this.statusBar, e.target))
                eventUtils.preventDefault(e);
        };

        listeners.addInternalEventListener(window, [eventName], downHandler);
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

        this.buttons.style.display        = 'none';
        this.unlockPageArea.style.display = 'none';

        nativeMethods.nodeTextContentSetter.call(this.statusDiv, '');
        this.progressBar.hide();
        this._recalculateSizes();
    }

    _showWaitingStatus () {
        const waitingStatusText = this.state.assertionRetries ? WAITING_FOR_ASSERTION_EXECUTION_TEXT : WAITING_FOR_ELEMENT_TEXT;

        nativeMethods.nodeTextContentSetter.call(this.statusDiv, waitingStatusText);
        this._setStatusDivLeftMargin();
        this._recalculateSizes();
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
                this._recalculateSizes();

                resolve();
            }, forceReset ? 0 : ANIMATION_DELAY);
        });
    }

    _showDebuggingStatus (isTestError) {
        return new Promise(resolve => {
            this.state.debugging = true;

            if (isTestError) {
                this.buttons.removeChild(this.nextButton);
                this.buttons.removeChild(this.resumeButton);
                this.buttons.appendChild(this.finishButton);

                nativeMethods.nodeTextContentSetter.call(this.statusDiv, TEST_FAILED_TEXT);
                shadowUI.removeClass(this.statusBar, WAITING_SUCCESS_CLASS);
                shadowUI.addClass(this.statusBar, WAITING_FAILED_CLASS);
            }
            else
                nativeMethods.nodeTextContentSetter.call(this.statusDiv, DEBUGGING_TEXT);

            this.buttons.style.display        = '';
            this.unlockPageArea.style.display = '';

            this._recalculateSizes();

            this._bindClickOnce([this.resumeButton, this.nextButton, this.finishButton], e => {
                const isNextButton = domUtils.containsElement(this.nextButton, e.target);

                this._resetState();
                resolve(isNextButton);
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
}
