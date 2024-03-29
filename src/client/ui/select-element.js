//NOTE: we can't manipulate (open/close option list) with a native select element during test running, so we
// draw our custom option list to emulate this.
import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import uiRoot from './ui-root';

const shadowUI         = hammerhead.shadowUI;
const browserUtils     = hammerhead.utils.browser;
const featureDetection = hammerhead.utils.featureDetection;
const nativeMethods    = hammerhead.nativeMethods;
const eventSimulator   = hammerhead.eventSandbox.eventSimulator;
const listeners        = hammerhead.eventSandbox.listeners;

const positionUtils    = testCafeCore.positionUtils;
const domUtils         = testCafeCore.domUtils;
const styleUtils       = testCafeCore.styleUtils;
const eventUtils       = testCafeCore.eventUtils;
const arrayUtils       = testCafeCore.arrayUtils;
const selectController = testCafeCore.selectController;


const OPTION_LIST_CLASS      = 'tcOptionList';
const DISABLED_CLASS         = 'disabled';
const MAX_OPTION_LIST_LENGTH = 20;


function onDocumentMouseDown (e) {
    const target      = nativeMethods.eventTargetGetter.call(e);
    const curSelectEl = selectController.currentEl;

    //NOTE: only in Mozilla 'mousedown' raises for option
    if ((target || e.srcElement) !== curSelectEl && !domUtils.containsElement(curSelectEl, target) &&
        !domUtils.containsElement(selectController.optionList, target))
        collapseOptionList();
}

function onWindowClick (e, dispatched, preventDefault) {
    const target      = nativeMethods.eventTargetGetter.call(e);
    const optionIndex = arrayUtils.indexOf(selectController.options, target);

    if (optionIndex < 0)
        return;

    preventDefault();

    const isDisabled = target.className.indexOf(DISABLED_CLASS) > -1;

    if (isDisabled && browserUtils.isWebKit)
        return;

    clickOnOption(optionIndex, isDisabled);
}

function clickOnOption (optionIndex, isOptionDisabled) {
    const curSelectEl      = selectController.currentEl;
    const curSelectIndex   = curSelectEl.selectedIndex;
    const realOption       = curSelectEl.getElementsByTagName('option')[optionIndex];
    const clickLeadChanges = !isOptionDisabled && optionIndex !== curSelectIndex;

    if (clickLeadChanges)
        curSelectEl.selectedIndex = optionIndex;

    if (!browserUtils.isFirefox && clickLeadChanges) {
        eventSimulator.input(curSelectEl);
        eventSimulator.change(curSelectEl);
    }

    if (browserUtils.isFirefox)
        eventSimulator.mousedown(browserUtils.isFirefox ? realOption : curSelectEl);

    if (!featureDetection.isTouchDevice)
        eventSimulator.mouseup(browserUtils.isFirefox ? realOption : curSelectEl);

    if (browserUtils.isFirefox && clickLeadChanges) {
        eventSimulator.input(curSelectEl);

        eventSimulator.change(curSelectEl);
    }

    if (!featureDetection.isTouchDevice)
        eventSimulator.click(browserUtils.isFirefox ? realOption : curSelectEl);

    if (!isOptionDisabled)
        collapseOptionList();
}

export function expandOptionList (select) {
    const selectChildren = select.children;

    if (!selectChildren.length || select.disabled)
        return;

    //NOTE: check is option list expanded
    if (selectController.currentEl) {
        const isSelectExpanded = select === selectController.currentEl;

        collapseOptionList();

        if (isSelectExpanded)
            return;
    }

    const curSelectEl = selectController.currentEl = select;
    const optionList  = selectController.optionList = document.createElement('div');

    uiRoot.element().appendChild(optionList);
    shadowUI.addClass(optionList, OPTION_LIST_CLASS);

    selectController.createChildren(selectChildren, optionList);

    listeners.addInternalEventBeforeListener(window, [ 'click' ], onWindowClick);

    nativeMethods.setTimeout.call(window, () => {
        eventUtils.bind(document, 'mousedown', onDocumentMouseDown);
    }, 0);

    styleUtils.set(optionList, {
        position:   'absolute',
        fontSize:   styleUtils.get(curSelectEl, 'fontSize'),
        fontFamily: styleUtils.get(curSelectEl, 'fontFamily'),
        minWidth:   styleUtils.getWidth(curSelectEl) + 'px',
        left:       positionUtils.getOffsetPosition(curSelectEl).left + 'px',
        height:     domUtils.getSelectVisibleChildren(select).length > MAX_OPTION_LIST_LENGTH ?
            styleUtils.getOptionHeight(select) * MAX_OPTION_LIST_LENGTH : '',
    });

    const selectTopPosition     = positionUtils.getOffsetPosition(curSelectEl).top;
    const optionListHeight      = styleUtils.getHeight(optionList);
    let optionListTopPosition = selectTopPosition + styleUtils.getHeight(curSelectEl) + 2;

    if (optionListTopPosition + optionListHeight > styleUtils.getScrollTop(window) + styleUtils.getHeight(window)) {
        const topPositionAboveSelect = selectTopPosition - 3 - optionListHeight;

        if (topPositionAboveSelect >= styleUtils.getScrollTop(window))
            optionListTopPosition = topPositionAboveSelect;
    }

    styleUtils.set(optionList, 'top', optionListTopPosition + 'px');
}

export function collapseOptionList () {
    domUtils.remove(selectController.optionList);
    eventUtils.unbind(document, 'mousedown', onDocumentMouseDown);

    selectController.clear();
}

export function scrollOptionListByChild (child) {
    const select = domUtils.getSelectParent(child);

    if (!select)
        return;

    const realSizeValue = styleUtils.getSelectElementSize(select);
    const optionHeight  = styleUtils.getOptionHeight(select);
    let scrollIndent  = 0;

    const topVisibleIndex    = Math.max(styleUtils.getScrollTop(select) / optionHeight, 0);
    const bottomVisibleIndex = topVisibleIndex + realSizeValue - 1;

    const childIndex = domUtils.getChildVisibleIndex(select, child);

    if (childIndex < topVisibleIndex) {
        scrollIndent = optionHeight * (topVisibleIndex - childIndex);
        styleUtils.setScrollTop(select, Math.max(styleUtils.getScrollTop(select) - scrollIndent, 0));
    }
    else if (childIndex > bottomVisibleIndex) {
        scrollIndent = optionHeight * (childIndex - bottomVisibleIndex);
        styleUtils.setScrollTop(select, styleUtils.getScrollTop(select) + scrollIndent);
    }
}

export function getSelectChildCenter (child) {
    const select = domUtils.getSelectParent(child);

    if (!select) {
        return {
            x: 0,
            y: 0,
        };
    }

    const optionHeight   = styleUtils.getOptionHeight(select);
    const childRectangle = positionUtils.getElementRectangle(child);

    return {
        x: Math.round(childRectangle.left + childRectangle.width / 2),
        y: Math.round(childRectangle.top + optionHeight / 2),
    };
}

export function switchOptionsByKeys (element, command) {
    const selectSize       = styleUtils.getSelectElementSize(element);
    const optionListHidden = !styleUtils.hasDimensions(shadowUI.select('.' + OPTION_LIST_CLASS)[0]);

    if (/down|up/.test(command) ||
        (selectSize <= 1 || browserUtils.isFirefox) &&
        (optionListHidden || browserUtils.isFirefox) && /left|right/.test(command)) {
        const realOptions    = element.querySelectorAll('option');
        const enabledOptions = [];

        for (let i = 0; i < realOptions.length; i++) {
            const parent = realOptions[i].parentElement;

            if (!realOptions[i].disabled && !(domUtils.getTagName(parent) === 'optgroup' && parent.disabled))
                enabledOptions.push(realOptions[i]);
        }

        const curSelectedOptionIndex = arrayUtils.indexOf(enabledOptions, realOptions[element.selectedIndex]);
        const nextIndex              = curSelectedOptionIndex + (/down|right/.test(command) ? 1 : -1);

        if (nextIndex >= 0 && nextIndex < enabledOptions.length) {
            element.selectedIndex = arrayUtils.indexOf(realOptions, enabledOptions[nextIndex]);

            eventSimulator.input(element);

            eventSimulator.change(element);
        }
    }
}
