import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import { ClickOptions } from '../../../test-run/commands/options';
import ClickAutomation from './click';
import AutomationSettings from '../settings';

var featureDetection = hammerhead.utils.featureDetection;
var browserUtils     = hammerhead.utils.browser;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;

var eventUtils = testCafeCore.eventUtils;
var delay      = testCafeCore.delay;

const FIRST_CLICK_DELAY = featureDetection.isTouchDevice ? 0 : 160;


export default class DblClickAutomation {
    constructor (element, clickOptions) {
        this.options = clickOptions;

        this.element   = element;
        this.modifiers = clickOptions.modifiers;
        this.caretPos  = clickOptions.caretPos;
        this.speed     = clickOptions.speed;

        this.automationSettings = new AutomationSettings(this.speed);

        this.offsetX = clickOptions.offsetX;
        this.offsetY = clickOptions.offsetY;

        this.eventArgs = null;

        this.eventState = {
            dblClickElement: null
        };
    }

    _firstClick () {
        // NOTE: we should always perform click with the highest speed
        var clickOptions = new ClickOptions(this.options);

        clickOptions.speed = 1;

        var clickAutomation = new ClickAutomation(this.element, clickOptions);

        return clickAutomation.run()
            .then(clickEventArgs => {
                this.eventArgs = clickEventArgs;
                return delay(FIRST_CLICK_DELAY);
            });
    }

    _secondClick () {
        var clickAutomation = null;

        //NOTE: we should not call focus after the second mousedown (except in IE) because of the native browser behavior
        if (browserUtils.isIE)
            eventUtils.bind(document, 'focus', eventUtils.preventDefault, true);

        var clickOptions = new ClickOptions({
            offsetX:   this.eventArgs.screenPoint.x,
            offsetY:   this.eventArgs.screenPoint.y,
            caretPos:  this.caretPos,
            modifiers: this.modifiers,
            speed:     1
        });

        clickAutomation = new ClickAutomation(document.documentElement, clickOptions);

        return clickAutomation.run()
            .then(clickEventArgs => {
                // NOTE: We should raise the `dblclick` event on an element that
                // has been actually clicked during the second click automation.
                this.eventState.dblClickElement = clickAutomation.eventState.clickElement;
                this.eventArgs                  = clickEventArgs;

                if (browserUtils.isIE)
                    eventUtils.unbind(document, 'focus', eventUtils.preventDefault, true);
            });
    }

    _dblClick () {
        if (this.eventState.dblClickElement)
            eventSimulator.dblclick(this.eventState.dblClickElement, this.eventArgs.options);
    }

    run (selectorTimeout, checkElementInterval) {
        // NOTE: If the target element is out of viewport the firstClick sub-automation raises an error
        return this
            ._firstClick(selectorTimeout, checkElementInterval)
            .then(() => this._secondClick())
            .then(() => this._dblClick());
    }
}
