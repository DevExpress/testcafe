import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import testCafeRunner from '../deps/testcafe-runner';
import testCafeUI from '../deps/testcafe-ui';
import { ActionElementNotFoundError, ActionElementIsInvisibleError } from '../../../errors/test-run';
import COMMAND_TYPE from '../../../test-run/commands/type';

var Promise           = hammerhead.Promise;
var XhrBarrier        = testCafeCore.XhrBarrier;
var pageUnloadBarrier = testCafeCore.pageUnloadBarrier;
var positionUtils     = testCafeCore.positionUtils;
var waitFor           = testCafeCore.waitFor;
var ClickAutomation   = testCafeRunner.get('./automation/playback/click');
var RClickAutomation  = testCafeRunner.get('./automation/playback/rclick');
var ProgressPanel     = testCafeUI.ProgressPanel;


const PROGRESS_PANEL_TEXT   = 'Waiting for the target element of the next action to appear';
const CHECK_ELEMENT_DELAY   = 200;
const CHECK_ELEMENT_TIMEOUT = 10000;


function ensureElementExists (selector) {
    return waitFor(selector, CHECK_ELEMENT_DELAY, CHECK_ELEMENT_TIMEOUT)
        .catch(() => {
            throw new ActionElementNotFoundError();
        });
}

function ensureElementVisible (element, timeout) {
    return waitFor(() => positionUtils.isElementVisible(element) ? element : null, CHECK_ELEMENT_DELAY, timeout)
        .catch(() => {
            throw new ActionElementIsInvisibleError();
        });
}

function ensureElement (selector) {
    var startTime     = new Date();
    var progressPanel = new ProgressPanel();

    progressPanel.show(PROGRESS_PANEL_TEXT, CHECK_ELEMENT_TIMEOUT);

    return ensureElementExists(selector, CHECK_ELEMENT_TIMEOUT)
        .then(element => {
            var checkVisibilityTimeout = CHECK_ELEMENT_TIMEOUT - (new Date() - startTime);

            return ensureElementVisible(element, checkVisibilityTimeout);
        })
        .then(element => {
            progressPanel.close(true);
            return element;
        })
        .catch(err => {
            progressPanel.close(false);
            throw err;
        });
}

function runAutomation (element, command) {
    var automation = null;

    if (command.type === COMMAND_TYPE.click)
        automation = new ClickAutomation(element, command.options);
    else if (command.type === COMMAND_TYPE.rightClick)
        automation = new RClickAutomation(element, command.options);

    return automation
        .run()
        .then(() => {
            return { failed: false };
        });
}

export default function executeActionCommand (command) {
    var resolveStartPromise = null;
    var startPromise        = new Promise(resolve => resolveStartPromise = resolve);

    var completePromise = new Promise(resolve => {
        var xhrBarrier    = null;
        var commandResult = null;
        var selector      = () => window.eval(command.selector);

        ensureElement(selector)
            .then(element => {
                resolveStartPromise();

                xhrBarrier = new XhrBarrier();

                return runAutomation(element, command);
            })
            .then(result => {
                commandResult = result;

                return Promise.all([
                    xhrBarrier.wait(),
                    pageUnloadBarrier.wait()
                ]);
            })
            .then(() => resolve(commandResult))
            .catch(err => {
                commandResult = {
                    failed: true,
                    err:    err
                };

                resolve(commandResult);
            });
    });

    return { startPromise, completePromise };
}

