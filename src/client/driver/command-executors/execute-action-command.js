import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import testCafeRunner from '../deps/testcafe-runner';
import testCafeUI from '../deps/testcafe-ui';
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
var ProgressPanel           = testCafeUI.ProgressPanel;


const PROGRESS_PANEL_TEXT   = 'Waiting for the target element of the next action to appear';
const CHECK_ELEMENT_DELAY   = 200;
const CHECK_ELEMENT_TIMEOUT = 10000;


function ensureElementExists (selector, ErrorCtor) {
    return waitFor(selector, CHECK_ELEMENT_DELAY, CHECK_ELEMENT_TIMEOUT)
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

function ensureElement (selector, NotFoundErrorCtor, IsInvisibleErrorCtor) {
    var startTime = new Date();

    return ensureElementExists(() => nativeMethods.eval.call(window, selector), NotFoundErrorCtor)
        .then(element => {
            var checkVisibilityTimeout = CHECK_ELEMENT_TIMEOUT - (new Date() - startTime);

            return ensureElementVisible(element, checkVisibilityTimeout, IsInvisibleErrorCtor);
        });
}

function ensureCommandElements (command) {
    var progressPanel = new ProgressPanel();

    progressPanel.show(PROGRESS_PANEL_TEXT, CHECK_ELEMENT_TIMEOUT);

    var ensureElementPromises = [];

    if (command.selector)
        ensureElementPromises.push(ensureElement(command.selector, ActionElementNotFoundError, ActionElementIsInvisibleError));

    if (command.type === COMMAND_TYPE.dragToElement)
        ensureElementPromises.push(ensureElement(command.destinationSelector, DragDestinationNotFoundError, DragDestinationIsInvisibleError));

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

        case COMMAND_TYPE.hover :
            return new HoverAutomation(elements[0], command.options);
    }
    /* eslint-enable indent*/
}


export default function executeActionCommand (command) {
    var resolveStartPromise = null;
    var startPromise        = new Promise(resolve => resolveStartPromise = resolve);
    
    var completionPromise = new Promise(resolve => {
        var xhrBarrier = null;

        ensureCommandElements(command)
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
            .then(() => resolve({ failed: false }))
            .catch(err => resolve({ failed: true, err }));
    });

    return { startPromise, completionPromise };
}

