//NOTE: we can't manipulate (open/close option list) with a native select element during test running, so we
// draw our custom option list to emulate this.
import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';
import uiRoot from './ui-root';

var shadowUI         = hammerhead.shadowUI;
var browserUtils     = hammerhead.utils.browser;
var featureDetection = hammerhead.utils.featureDetection;
var nativeMethods    = hammerhead.nativeMethods;
var eventSimulator   = hammerhead.eventSandbox.eventSimulator;
var listeners        = hammerhead.eventSandbox.listeners;

var positionUtils = testCafeCore.positionUtils;
var domUtils      = testCafeCore.domUtils;
var styleUtils    = testCafeCore.styleUtils;
var eventUtils    = testCafeCore.eventUtils;
var arrayUtils    = testCafeCore.arrayUtils;


const OPTION_LIST_CLASS      = 'tcOptionList';
const OPTION_GROUP_CLASS     = 'tcOptionGroup';
const OPTION_CLASS           = 'tcOption';
const DISABLED_CLASS         = 'disabled';
const MAX_OPTION_LIST_LENGTH = browserUtils.isIE ? 30 : 20;


var curSelectEl = null;
var optionList  = null;
var groups      = [];
var options     = [];

function onDocumentMouseDown (e) {
    //NOTE: only in Mozilla 'mousedown' raises for option
    if ((e.target || e.srcElement) !== curSelectEl && !domUtils.containsElement(curSelectEl, e.target) &&
        !domUtils.containsElement(optionList, e.target))
        collapseOptionList();
}

function onWindowClick (e, dispatched, preventDefault) {
    const optionIndex = arrayUtils.indexOf(options, e.target);

    if (optionIndex < 0)
        return;

    preventDefault();

    const isDisabled = e.target.className.indexOf(DISABLED_CLASS) > -1;

    if (isDisabled && browserUtils.isWebKit)
        return;

    clickOnOption(optionIndex, isDisabled);
}

function clickOnOption (optionIndex, isOptionDisabled) {
    var curSelectIndex   = curSelectEl.selectedIndex;
    var realOption       = curSelectEl.getElementsByTagName('option')[optionIndex];
    var clickLeadChanges = !isOptionDisabled && optionIndex !== curSelectIndex;

    if (clickLeadChanges && !browserUtils.isIE)
        curSelectEl.selectedIndex = optionIndex;

    if (!browserUtils.isFirefox && !browserUtils.isIE && clickLeadChanges) {
        eventSimulator.input(curSelectEl);
        eventSimulator.change(curSelectEl);
    }

    if (browserUtils.isFirefox || browserUtils.isIE)
        eventSimulator.mousedown(browserUtils.isFirefox ? realOption : curSelectEl);

    if (!featureDetection.isTouchDevice)
        eventSimulator.mouseup(browserUtils.isFirefox ? realOption : curSelectEl);

    if ((browserUtils.isFirefox || browserUtils.isIE) && clickLeadChanges) {
        if (browserUtils.isIE)
            curSelectEl.selectedIndex = optionIndex;

        if (!browserUtils.isIE)
            eventSimulator.input(curSelectEl);

        eventSimulator.change(curSelectEl);
    }

    if (!featureDetection.isTouchDevice)
        eventSimulator.click(browserUtils.isFirefox || browserUtils.isIE ? realOption : curSelectEl);

    if (!isOptionDisabled)
        collapseOptionList();
}

function createOption (realOption, parent) {
    var option           = document.createElement('div');
    var isOptionDisabled = realOption.disabled || domUtils.getTagName(realOption.parentElement) === 'optgroup' &&
                                                  realOption.parentElement.disabled;

    option.textContent = realOption.text;

    parent.appendChild(option);
    shadowUI.addClass(option, OPTION_CLASS);

    if (isOptionDisabled) {
        shadowUI.addClass(option, DISABLED_CLASS);
        styleUtils.set(option, 'color', styleUtils.get(realOption, 'color'));
    }

    options.push(option);
}

function createGroup (realGroup, parent) {
    var group = document.createElement('div');

    group.textContent = realGroup.label || ' ';
    parent.appendChild(group);

    shadowUI.addClass(group, OPTION_GROUP_CLASS);

    if (group.disabled) {
        shadowUI.addClass(group, DISABLED_CLASS);

        styleUtils.set(group, 'color', styleUtils.get(realGroup, 'color'));
    }

    createChildren(realGroup.children, group);

    groups.push(group);
}

function createChildren (children, parent) {
    var childrenLength = domUtils.getChildrenLength(children);

    for (var i = 0; i < childrenLength; i++) {
        if (domUtils.isOptionElement(children[i]))
            createOption(children[i], parent);
        else if (domUtils.getTagName(children[i]) === 'optgroup')
            createGroup(children[i], parent);
    }
}

export function expandOptionList (select) {
    var selectChildren = select.children;

    if (!selectChildren.length)
        return;

    //NOTE: check is option list expanded
    if (curSelectEl) {
        var isSelectExpanded = select === curSelectEl;

        collapseOptionList();

        if (isSelectExpanded)
            return;
    }

    curSelectEl = select;

    optionList = document.createElement('div');
    uiRoot.element().appendChild(optionList);
    shadowUI.addClass(optionList, OPTION_LIST_CLASS);

    createChildren(selectChildren, optionList);

    listeners.addInternalEventListener(window, [ 'click' ], onWindowClick);

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
            styleUtils.getOptionHeight(select) * MAX_OPTION_LIST_LENGTH : ''
    });

    var selectTopPosition     = positionUtils.getOffsetPosition(curSelectEl).top;
    var optionListHeight      = styleUtils.getHeight(optionList);
    var optionListTopPosition = selectTopPosition + styleUtils.getHeight(curSelectEl) + 2;

    if (optionListTopPosition + optionListHeight > styleUtils.getScrollTop(window) + styleUtils.getHeight(window)) {
        var topPositionAboveSelect = selectTopPosition - 3 - optionListHeight;

        if (topPositionAboveSelect >= styleUtils.getScrollTop(window))
            optionListTopPosition = topPositionAboveSelect;
    }

    styleUtils.set(optionList, 'top', optionListTopPosition + 'px');
}

export function collapseOptionList () {
    domUtils.remove(optionList);
    eventUtils.unbind(document, 'mousedown', onDocumentMouseDown);

    optionList  = null;
    curSelectEl = null;
    options     = [];
    groups      = [];
}

export function isOptionListExpanded (select) {
    return select ? select === curSelectEl : !!curSelectEl;
}

export function getEmulatedChildElement (element) {
    var isGroup      = domUtils.getTagName(element) === 'optgroup';
    var elementIndex = isGroup ? domUtils.getElementIndexInParent(curSelectEl, element) :
        domUtils.getElementIndexInParent(curSelectEl, element);

    if (!isGroup)
        return options[elementIndex];

    return groups[elementIndex];
}

export function scrollOptionListByChild (child) {
    var select = domUtils.getSelectParent(child);

    if (!select)
        return;

    var realSizeValue = styleUtils.getSelectElementSize(select);
    var optionHeight  = styleUtils.getOptionHeight(select);
    var scrollIndent  = 0;

    var topVisibleIndex    = Math.max(styleUtils.getScrollTop(select) / optionHeight, 0);
    var bottomVisibleIndex = topVisibleIndex + realSizeValue - 1;

    var childIndex = domUtils.getChildVisibleIndex(select, child);

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
    var select = domUtils.getSelectParent(child);

    if (!select) {
        return {
            x: 0,
            y: 0
        };
    }

    var optionHeight   = styleUtils.getOptionHeight(select);
    var childRectangle = positionUtils.getElementRectangle(child);

    return {
        x: Math.round(childRectangle.left + childRectangle.width / 2),
        y: Math.round(childRectangle.top + optionHeight / 2)
    };
}

export function switchOptionsByKeys (element, command) {
    var selectSize       = styleUtils.getSelectElementSize(element);
    var optionListHidden = !styleUtils.hasDimensions(shadowUI.select('.' + OPTION_LIST_CLASS)[0]);

    if (/down|up/.test(command) ||
        !browserUtils.isIE && (selectSize <= 1 || browserUtils.isFirefox) &&
        (optionListHidden || browserUtils.isFirefox) && /left|right/.test(command)) {
        var realOptions    = element.querySelectorAll('option');
        var enabledOptions = [];

        for (var i = 0; i < realOptions.length; i++) {
            var parent = realOptions[i].parentElement;

            if (!realOptions[i].disabled && !(domUtils.getTagName(parent) === 'optgroup' && parent.disabled))
                enabledOptions.push(realOptions[i]);
        }

        var curSelectedOptionIndex = arrayUtils.indexOf(enabledOptions, realOptions[element.selectedIndex]);
        var nextIndex              = curSelectedOptionIndex + (/down|right/.test(command) ? 1 : -1);

        if (nextIndex >= 0 && nextIndex < enabledOptions.length) {
            element.selectedIndex = arrayUtils.indexOf(realOptions, enabledOptions[nextIndex]);

            if (!browserUtils.isIE)
                eventSimulator.input(element);

            eventSimulator.change(element);
        }
    }
}

export function isOptionElementVisible (el) {
    var parentSelect = domUtils.getSelectParent(el);

    if (!parentSelect)
        return true;

    var expanded        = isOptionListExpanded(parentSelect);
    var selectSizeValue = styleUtils.getSelectElementSize(parentSelect);

    return expanded || selectSizeValue > 1;
}
