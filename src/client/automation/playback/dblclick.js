import hammerhead from '../deps/hammerhead';
import testCafeCore from '../deps/testcafe-core';
import { ClickOptions } from '../../../test-run/commands/options';
import VisibleElementAutomation from './visible-element-automation';
import ClickAutomation from './click';
import AutomationSettings from '../settings';

var featureDetection = hammerhead.utils.featureDetection;
var browserUtils     = hammerhead.utils.browser;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;

var eventUtils = testCafeCore.eventUtils;
var delay      = testCafeCore.delay;

const FIRST_CLICK_DELAY = featureDetection.isTouchDevice ? 0 : 160;


export default class DblClickAutomation extends VisibleElementAutomation {
    constructor (element, clickOptions) {
        super(element, clickOptions);

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

    _firstClick (useStrictElementCheck) {
        // NOTE: we should always perform click with the highest speed
        var clickOptions = new ClickOptions(this.options);

        clickOptions.speed = 1;

        var clickAutomation = new ClickAutomation(this.element, clickOptions);

        clickAutomation.on(clickAutomation.TARGET_ELEMENT_FOUND_EVENT, e => this.emit(this.TARGET_ELEMENT_FOUND_EVENT, e));

        return clickAutomation.run(useStrictElementCheck)
            .then(clickEventArgs => {
                return delay(FIRST_CLICK_DELAY).then(() => clickEventArgs);
            });
    }

    _secondClick (eventArgs) {
        //NOTE: we should not call focus after the second mousedown (except in IE) because of the native browser behavior
        if (browserUtils.isIE)
            eventUtils.bind(document, 'focus', eventUtils.preventDefault, true);

        var clickOptions = new ClickOptions({
            offsetX:   eventArgs.screenPoint.x,
            offsetY:   eventArgs.screenPoint.y,
            caretPos:  this.caretPos,
            modifiers: this.modifiers,
            speed:     1
        });

        var clickAutomation = new ClickAutomation(document.documentElement, clickOptions);

        return clickAutomation.run()
            .then(clickEventArgs => {
                // NOTE: We should raise the `dblclick` event on an element that
                // has been actually clicked during the second click automation.
                this.eventState.dblClickElement = clickAutomation.eventState.clickElement;

                if (browserUtils.isIE)
                    eventUtils.unbind(document, 'focus', eventUtils.preventDefault, true);

                return clickEventArgs;
            });
    }

    _dblClick (eventArgs) {
        if (this.eventState.dblClickElement)
            eventSimulator.dblclick(this.eventState.dblClickElement, eventArgs.options);
    }

    run (useStrictElementCheck) {
        // NOTE: If the target element is out of viewport the firstClick sub-automation raises an error
        return this
            ._firstClick(useStrictElementCheck)
            .then(eventArgs => this._secondClick(eventArgs))
            .then(eventArgs => this._dblClick(eventArgs));
    }
}
