import { transport, eventSandbox, Promise } from '../../deps/hammerhead';
import { domUtils, scrollController, sendRequestToFrame, delay } from '../../deps/testcafe-core';
import { Scroll as ScrollAutomation } from '../../deps/testcafe-automation';
import { hide as hideUI, show as showUI, showScreenshotMark, hideScreenshotMark } from '../../deps/testcafe-ui';
import DriverStatus from '../../status';
import ensureCropOptions from './ensure-crop-options';
import { ensureElements, createElementDescriptor } from '../../utils/ensure-elements';
import runWithBarriers from '../../utils/run-with-barriers';
import MESSAGE from '../../../../test-run/client-messages';
import COMMAND_TYPE from '../../../../test-run/commands/type';
import { ScrollOptions, ElementScreenshotOptions } from '../../../../test-run/commands/options';


const messageSandbox = eventSandbox.message;

const HIDING_UI_RELAYOUT_DELAY    = 500;
const POSSIBLE_RESIZE_ERROR_DELAY = 100;

const MANIPULATION_REQUEST_CMD  = 'driver|browser-manipulation|request';
const MANIPULATION_RESPONSE_CMD = 'driver|browser-manipulation|response';

// Setup cross-iframe interaction
messageSandbox.on(messageSandbox.SERVICE_MSG_RECEIVED_EVENT, e => {
    if (e.message.cmd === MANIPULATION_REQUEST_CMD) {
        var element = domUtils.findIframeByWindow(e.source);

        var { command, cropDimensions } = e.message;

        if (cropDimensions)
            command.options = new ElementScreenshotOptions({ crop: cropDimensions, includePaddings: false });

        var manipulation = new ManipulationExecutor(command);

        manipulation.element = element;

        manipulation
            .execute()
            .then(result => messageSandbox.sendServiceMsg({ cmd: MANIPULATION_RESPONSE_CMD, result }, e.source));
    }
});

class ManipulationExecutor {
    constructor (command, globalSelectorTimeout, statusBar) {
        this.command  = command;
        this.globalSelectorTimeout = globalSelectorTimeout;
        this.statusBar = statusBar;
        this.element = null;
    }

    _getAbsoluteCropValues () {
        var { top, left } = this.element.getBoundingClientRect();

        left += this.command.options.originOffset.x;
        top += this.command.options.originOffset.y;

        var right  = left + this.command.options.crop.right;
        var bottom = top + this.command.options.crop.bottom;

        top += this.command.options.crop.top;
        left += this.command.options.crop.left;

        return { top, left, bottom, right };
    }

    _createManipulationReadyMessage () {
        var dpr = window.devicePixelRatio || 1;

        var message = {
            cmd: MESSAGE.readyForBrowserManipulation,

            pageDimensions: {
                dpr:            dpr,
                innerWidth:     window.innerWidth,
                innerHeight:    window.innerHeight,
                documentWidth:  document.documentElement.clientWidth,
                documentHeight: document.documentElement.clientHeight,
                bodyWidth:      document.body.clientWidth,
                bodyHeight:     document.body.clientHeight
            },

            disableResending: true
        };

        if (this.command.type === COMMAND_TYPE.takeElementScreenshot)
            message.cropDimensions = this._getAbsoluteCropValues();

        return message;
    }

    _runScrollBeforeScreenshot () {
        return Promise
            .resolve()
            .then(() => {
                if (this.element || !this.command.selector)
                    return Promise.resolve();

                var selectorTimeout = this.command.selector.timeout;

                var specificSelectorTimeout = typeof selectorTimeout === 'number' ? selectorTimeout : this.globalSelectorTimeout;

                this.statusBar.showWaitingElementStatus(specificSelectorTimeout);

                return ensureElements([createElementDescriptor(this.command.selector)], this.globalSelectorTimeout)
                    .then(elements => {
                        this.statusBar.hideWaitingElementStatus();

                        this.element = elements[0];
                    })
                    .catch(error => {
                        this.statusBar.hideWaitingElementStatus();

                        throw error;
                    });
            })
            .then(() => {
                ensureCropOptions(this.element, this.command.options);

                var { scrollTargetX, scrollTargetY, scrollToCenter } = this.command.options;

                var scrollAutomation = new ScrollAutomation(this.element, new ScrollOptions({
                    offsetX:          scrollTargetX,
                    offsetY:          scrollTargetY,
                    scrollToCenter:   scrollToCenter,
                    skipParentFrames: true
                }));

                return scrollAutomation.run();
            });
    }

    _hideUI () {
        hideUI();

        if (this.command.markData)
            showScreenshotMark(this.command.markData);

        return delay(HIDING_UI_RELAYOUT_DELAY);
    }

    _showUI () {
        if (this.command.markData)
            hideScreenshotMark();

        showUI();
    }

    _requestManipulation () {
        if (window.top === window)
            return transport.queuedAsyncServiceMsg(this._createManipulationReadyMessage());

        var cropDimensions = this._getAbsoluteCropValues();

        var iframeRequestPromise = sendRequestToFrame({
            cmd:            MANIPULATION_REQUEST_CMD,
            command:        this.command,
            cropDimensions: cropDimensions
        }, MANIPULATION_RESPONSE_CMD, window.parent);

        return iframeRequestPromise
            .then(message => {
                if (!message.result)
                    return { result: null };

                var { result, executionError } = message.result;

                if (executionError)
                    throw executionError;

                return { result };
            });
    }

    _runManipulation () {
        var manipulationResult = null;

        return Promise
            .resolve()
            .then(() => {
                if (this.command.type !== COMMAND_TYPE.takeElementScreenshot)
                    return Promise.resolve();

                scrollController.stopPropagation();

                return this._runScrollBeforeScreenshot();
            })
            .then(() => {
                if (window.top === window)
                    return this._hideUI();

                return Promise.resolve();
            })
            .then(() => this._requestManipulation())
            .then(({ result, error }) => {
                if (error)
                    throw error;

                scrollController.enablePropagation();

                manipulationResult = result;

                if (window.top === window)
                    this._showUI();

                return delay(POSSIBLE_RESIZE_ERROR_DELAY);
            })
            .then(() => new DriverStatus({ isCommandResult: true, result: manipulationResult }))
            .catch(err => {
                scrollController.enablePropagation();

                return new DriverStatus({ isCommandResult: true, executionError: err });
            });
    }

    execute () {
        var { barriersPromise } = runWithBarriers(() => this._runManipulation());

        return barriersPromise;
    }
}

export default function (command, globalSelectorTimeout, statusBar) {
    var manipulationExecutor = new ManipulationExecutor(command, globalSelectorTimeout, statusBar);

    return manipulationExecutor.execute();
}
