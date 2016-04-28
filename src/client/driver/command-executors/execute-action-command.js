import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import testCafeRunner from '../deps/testcafe-runner';
import testCafeUI from '../deps/testcafe-ui';
import DriverStatus from '../status';
import {
    ActionElementNotFoundError,
    ActionElementIsInvisibleError,
    DragDestinationNotFoundError,
    DragDestinationIsInvisibleError
} from '../../../errors/test-run';

import COMMAND_TYPE from '../../../test-run/commands/type';

var Promise                 = hammerhead.Promise;
var nativeMethods           = hammerhead.nativeMethods;
var XhrBarrier              = testCafeCore.XhrBarrier;
var pageUnloadBarrier       = testCafeCore.pageUnloadBarrier;
var positionUtils           = testCafeCore.positionUtils;
var waitFor                 = testCafeCore.waitFor;
var ClickAutomation         = testCafeRunner.get('./automation/playback/click');
var RClickAutomation        = testCafeRunner.get('./automation/playback/rclick');
var DblClickAutomation      = testCafeRunner.get('./automation/playback/dblclick');
var DragToOffsetAutomation  = testCafeRunner.get('./automation/playback/drag/to-offset');
var DragToElementAutomation = testCafeRunner.get('./automation/playback/drag/to-element');
var HoverAutomation         = testCafeRunner.get('./automation/playback/hover');
var TypeAutomation          = testCafeRunner.get('./automation/playback/type');
var ProgressPanel           = testCafeUI.ProgressPanel;


const PROGRESS_PANEL_TEXT = 'Waiting for the target element of the next action to appear';
const CHECK_ELEMENT_DELAY = 200;


function ensureElementExists (selector, timeout, ErrorCtor) {
    return waitFor(selector, CHECK_ELEMENT_DELAY, timeout)
        .catch(() => {
            throw new ErrorCtor();
        });
}

function ensureElementVisible (element, timeout, ErrorCtor) {
    return waitFor(() => positionUtils.isElementVisible(element) ? element : null, CHECK_ELEMENT_DELAY, timeout)
        .catch(() => {
            throw new ErrorCtor();
        });
}

function ensureElement (selector, timeout, NotFoundErrorCtor, IsInvisibleErrorCtor) {
    var startTime = new Date();

    return ensureElementExists(() => nativeMethods.eval.call(window, selector), timeout, NotFoundErrorCtor)
        .then(element => {
            var checkVisibilityTimeout = timeout - (new Date() - startTime);

            return ensureElementVisible(element, checkVisibilityTimeout, IsInvisibleErrorCtor);
        });
}

function ensureCommandElements (command, timeout) {
    var progressPanel = new ProgressPanel();

    progressPanel.show(PROGRESS_PANEL_TEXT, timeout);

    var ensureElementPromises = [];

    if (command.selector)
        ensureElementPromises.push(ensureElement(command.selector, timeout, ActionElementNotFoundError, ActionElementIsInvisibleError));

    if (command.type === COMMAND_TYPE.dragToElement)
        ensureElementPromises.push(ensureElement(command.destinationSelector, timeout, DragDestinationNotFoundError, DragDestinationIsInvisibleError));

    return Promise.all(ensureElementPromises)
        .catch(err => {
            progressPanel.close(false);
            throw err;
        })
        .then(elements => {
            progressPanel.close(true);
            return elements;
        });
}

function createAutomation (elements, command) {
    /* eslint-disable indent*/
    // TODO: eslint raises an 'incorrect indent' error here. We use
    // the old eslint version (v1.x.x). We should migrate to v2.x.x
    switch (command.type) {
        case COMMAND_TYPE.click :
            return new ClickAutomation(elements[0], command.options);

        case COMMAND_TYPE.rightClick :
            return new RClickAutomation(elements[0], command.options);

        case COMMAND_TYPE.doubleClick :
            return new DblClickAutomation(elements[0], command.options);

        case COMMAND_TYPE.drag :
            return new DragToOffsetAutomation(elements[0], command.dragOffsetX, command.dragOffsetY, command.options);

        case COMMAND_TYPE.dragToElement :
            return new DragToElementAutomation(elements[0], elements[1], command.options);

        case COMMAND_TYPE.typeText:
            return new TypeAutomation(elements[0], command.text, command.options);

        case COMMAND_TYPE.hover :
            return new HoverAutomation(elements[0], command.options);
    }
    /* eslint-enable indent*/
}

export default function executeActionCommand (command, elementAvailabilityTimeout) {
    var resolveStartPromise = null;
    var startPromise        = new Promise(resolve => resolveStartPromise = resolve);

    var completionPromise = new Promise(resolve => {
        var xhrBarrier = null;

        ensureCommandElements(command, elementAvailabilityTimeout)
            .then(elements => {
                resolveStartPromise();

                xhrBarrier = new XhrBarrier();

                return createAutomation(elements, command).run();
            })
            .then(() => {
                return Promise.all([
                    xhrBarrier.wait(),
                    pageUnloadBarrier.wait()
                ]);
            })
            .then(() => resolve(new DriverStatus({ isCommandResult: true })))
            .catch(err => resolve(new DriverStatus({ isCommandResult: true, executionError: err })));
    });

    return { startPromise, completionPromise };
}

