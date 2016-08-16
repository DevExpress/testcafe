import hammerhead from './../deps/hammerhead';
import testCafeCore from './../deps/testcafe-core';
import ProgressBar from './progress-bar';
import MESSAGES from './messages';


var Promise        = hammerhead.Promise;
var shadowUI       = hammerhead.shadowUI;
var nativeMethods  = hammerhead.nativeMethods;
var messageSandbox = hammerhead.eventSandbox.message;

var styleUtils = testCafeCore.styleUtils;
var eventUtils = testCafeCore.eventUtils;
var domUtils   = testCafeCore.domUtils;


const STATUS_BAR_CLASS              = 'status-bar';
const CONTAINER_CLASS               = 'container';
const ICON_CLASS                    = 'icon';
const INFO_CONTAINER_CLASS          = 'info-container';
const FIXTURE_CONTAINER_CLASS       = 'fixture-container';
const FIXTURE_DIV_CLASS             = 'fixture';
const USER_AGENT_DIV_CLASS          = 'user-agent';
const STATUS_CONTAINER_CLASS        = 'status-container';
const STATUS_DIV_CLASS              = 'status';
const ONLY_ICON_CLASS               = 'only-icon';
const ICON_AND_STATUS_CLASS         = 'icon-status';
const WAITING_ELEMENT_FAILED_CLASS  = 'waiting-element-failed';
const WAITING_ELEMENT_SUCCESS_CLASS = 'waiting-element-success';
const LOADING_PAGE_TEXT             = 'Loading Web Page...';
const WAITING_FOR_ELEMENT_TEXT      = 'Waiting for an element to appear...';
const MIDDLE_WINDOW_WIDTH           = 670;
const SMALL_WINDOW_WIDTH            = 380;
const SHOWING_DELAY                 = 300;
const ANIMATION_DELAY               = 500;
const ANIMATION_UPDATE_INTERVAL     = 10;


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
        this.statusDiv        = null;

        this.progressBar       = null;
        this.animationInterval = null;
        this.showingTimeout    = null;
        this.created           = false;
        this.showing           = false;
        this.hidding           = false;

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
        if (windowWidth > MIDDLE_WINDOW_WIDTH) {
            shadowUI.removeClass(this.statusBar, ONLY_ICON_CLASS);
            shadowUI.removeClass(this.statusBar, ICON_AND_STATUS_CLASS);
        }
        else if (windowWidth < MIDDLE_WINDOW_WIDTH && windowWidth > SMALL_WINDOW_WIDTH) {
            shadowUI.removeClass(this.statusBar, ONLY_ICON_CLASS);
            shadowUI.addClass(this.statusBar, ICON_AND_STATUS_CLASS);
        }
        else if (windowWidth < SMALL_WINDOW_WIDTH) {
            shadowUI.removeClass(this.statusBar, ICON_AND_STATUS_CLASS);
            shadowUI.addClass(this.statusBar, ONLY_ICON_CLASS);
        }
    }

    _setFixtureContainerWidth () {
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
        var marginLeft         = Math.round(containerWidth / 2 - statusDivWidth / 2 - infoContainerWidth);

        styleUtils.set(this.statusDiv, 'marginLeft', Math.max(marginLeft, 0) + 'px');
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
            if (this.hidding)
                return;

            this.showing = false;
            this.hidding = true;
            this._animate();
        });

        eventUtils.bind(this.statusBar, 'mouseout', e => {
            if (!domUtils.containsElement(this.statusBar, e.relatedTarget) && !this.showing) {
                this.hidding = false;
                this.showing = true;
                this._animate(true);
            }
        });
    }

    _initChildListening () {
        messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
            var msg = e.message;

            if (msg.cmd === MESSAGES.startWaitingForElement)
                this.setWaitingStatus(msg.timeout);
            else if (msg.cmd === MESSAGES.stopWaitingForElementRequest) {
                this
                    .resetWaitingStatus(msg.waitingSuccess)
                    .then(() => messageSandbox.sendServiceMsg({ cmd: MESSAGES.stopWaitingForElementResponse }, e.source));
            }
        });
    }

    _resetState () {
        this.statusDiv.textContent = '';
        this.progressBar.hide();
    }

    _showWaitingStatus () {
        this.statusDiv.textContent = WAITING_FOR_ELEMENT_TEXT;
        this._setStatusDivLeftMargin();
        this.progressBar.show();
    }

    _hideWaitingStatus (forceReset) {
        return new Promise(resolve => {
            nativeMethods.setTimeout.call(window, () => {
                shadowUI.removeClass(this.statusBar, WAITING_ELEMENT_SUCCESS_CLASS);
                shadowUI.removeClass(this.statusBar, WAITING_ELEMENT_FAILED_CLASS);

                this.progressBar.determinateIndicator.reset();

                this._resetState();
                resolve();
            }, forceReset ? 0 : ANIMATION_DELAY);
        });
    }

    //API
    resetPageLoadingStatus () {
        if (!this.created)
            this._create();

        this.progressBar.indeterminateIndicator.stop();
        this._resetState();
    }

    setWaitingStatus (timeout) {
        this.progressBar.determinateIndicator.start(timeout);

        this.showingTimeout = nativeMethods.setTimeout.call(window, () => {
            this.showingTimeout = null;

            this._showWaitingStatus();
        }, SHOWING_DELAY);
    }

    resetWaitingStatus (waitingSuccess) {
        this.progressBar.determinateIndicator.stop();

        if (waitingSuccess)
            shadowUI.addClass(this.statusBar, WAITING_ELEMENT_SUCCESS_CLASS);
        else
            shadowUI.addClass(this.statusBar, WAITING_ELEMENT_FAILED_CLASS);

        var forceReset = this.showingTimeout && waitingSuccess;

        if (this.showingTimeout) {
            nativeMethods.clearTimeout.call(window, this.showingTimeout);
            this.showingTimeout = null;

            if (!waitingSuccess)
                this._showWaitingStatus();
        }

        return this._hideWaitingStatus(forceReset);
    }
}
