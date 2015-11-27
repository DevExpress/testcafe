//NOTE: we can't manipulate (open/close option list) with a native select element during test running, so we
// draw our custom option list to emulate this.
import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';

var shadowUI       = hammerhead.shadowUI;
var browserUtils   = hammerhead.utils.browser;
var eventSimulator = hammerhead.eventSandbox.eventSimulator;

var $             = testCafeCore.$;
var positionUtils = testCafeCore.positionUtils;
var domUtils      = testCafeCore.domUtils;
var styleUtils    = testCafeCore.styleUtils;


const OPTION_LIST_CLASS      = 'tcOptionList';
const OPTION_GROUP_CLASS     = 'tcOptionGroup';
const OPTION_CLASS           = 'tcOption';
const DISABLED_CLASS         = 'disabled';
const MAX_OPTION_LIST_LENGTH = browserUtils.isIE ? 30 : 20;


var $curSelectEl = null,
    $optionList  = null,
    $groups      = null,
    $options     = null;

function onDocumentMouseDown (e) {
    //NOTE: only in Mozilla 'mousedown' raises for option
    if ((e.target || e.srcElement) !== $curSelectEl[0] && !$curSelectEl.has(e.target).length &&
        !$optionList.has(e.target).length)
        collapseOptionList();
}

function createOption (option, $parent) {
    var $option          = $('<div></div>')
            .text(option.text)
            .appendTo($parent),
        isOptionDisabled = option.disabled ||
                           (option.parentElement.tagName.toLowerCase() === 'optgroup' && option.parentElement.disabled);

    shadowUI.addClass($option[0], OPTION_CLASS);

    if (isOptionDisabled) {
        shadowUI.addClass($option[0], DISABLED_CLASS);
        $option.css('color', $(option).css('color'));
    }

    if (isOptionDisabled && browserUtils.isWebKit) {
        $option.click(function () {
            return false;
        });
    }
    else {
        $option.click(function () {
            var curSelectEl      = $curSelectEl[0],
                curSelectIndex   = curSelectEl.selectedIndex,
                optionIndex      = $.inArray(this, $options),
                option           = $(curSelectEl).find('option')[optionIndex],
                clickLeadChanges = !isOptionDisabled && optionIndex !== curSelectIndex,
                isMobileBrowser  = browserUtils.isSafari && browserUtils.hasTouchEvents || browserUtils.isAndroid;

            if (clickLeadChanges && !browserUtils.isIE)
                curSelectEl.selectedIndex = optionIndex;

            if (!browserUtils.isFirefox && !browserUtils.isIE && clickLeadChanges)
                eventSimulator.change(curSelectEl);

            if (browserUtils.isFirefox || browserUtils.isIE)
                eventSimulator.mousedown(browserUtils.isFirefox ? option : curSelectEl);

            if(!isMobileBrowser)
                eventSimulator.mouseup(browserUtils.isFirefox ? option : curSelectEl);

            if ((browserUtils.isFirefox || browserUtils.isIE) && clickLeadChanges) {
                eventSimulator.change(curSelectEl);

                if (browserUtils.isIE)
                    curSelectEl.selectedIndex = optionIndex;
            }

            if(!isMobileBrowser)
                eventSimulator.click(browserUtils.isFirefox || browserUtils.isIE ? option : curSelectEl);

            if (!isOptionDisabled)
                collapseOptionList();
        });
    }

    $options = !$options || !$options.length ? $option : $options.add($option);
}

function createGroup (group, $parent) {
    var $group = $('<div></div>')
        .text(group.label || ' ')
        .appendTo($parent);

    shadowUI.addClass($group[0], OPTION_GROUP_CLASS);

    if (group.disabled) {
        shadowUI.addClass($group[0], DISABLED_CLASS);

        $group.css('color', $(group).css('color'));
    }

    createChildren($(group).children(), $group);

    $groups = !$groups || !$groups.length ? $group : $groups.add($group);
}

function createChildren ($children, $parent) {
    $.each($children, function (index, item) {
        if (item.tagName.toLowerCase() === 'option')
            createOption(item, $parent);
        else if (item.tagName.toLowerCase() === 'optgroup')
            createGroup(item, $parent);
    });
}

export function expandOptionList (select) {
    var $select         = $(select),
        $selectChildren = $(select).children();

    if (!$selectChildren.length)
        return;

    //NOTE: check is option list expanded
    if ($curSelectEl) {
        var isSelectExpanded = $select[0] === $curSelectEl[0];

        collapseOptionList();

        if (isSelectExpanded)
            return;
    }

    $curSelectEl = $select;

    $optionList = $('<div></div>').appendTo($(shadowUI.getRoot()));
    shadowUI.addClass($optionList[0], OPTION_LIST_CLASS);

    createChildren($selectChildren, $optionList);

    window.setTimeout(function () {
        $(document).bind('mousedown', onDocumentMouseDown);
    }, 0);

    $optionList.css({
        position:   'absolute',
        fontSize:   $curSelectEl.css('fontSize'),
        fontFamily: $curSelectEl.css('fontFamily'),
        minWidth:   $curSelectEl.width(),
        left:       positionUtils.getOffsetPosition($curSelectEl[0]).left,
        height:     domUtils.getSelectVisibleChildren($select[0]).length > MAX_OPTION_LIST_LENGTH ?
                    styleUtils.getOptionHeight(select) * MAX_OPTION_LIST_LENGTH : ''
    });

    var $window               = $(window),
        selectTopPosition     = positionUtils.getOffsetPosition($curSelectEl[0]).top,
        optionListHeight      = $optionList.height(),
        optionListTopPosition = selectTopPosition + $curSelectEl.height() + 2;

    if (optionListTopPosition + optionListHeight > $window.scrollTop() + $window.height()) {
        var topPositionAboveSelect = selectTopPosition - 3 - optionListHeight;

        if (topPositionAboveSelect >= $window.scrollTop())
            optionListTopPosition = topPositionAboveSelect;
    }

    $optionList.css('top', optionListTopPosition);
}

export function collapseOptionList () {
    $optionList.remove();
    $(document).unbind('mousedown', onDocumentMouseDown);

    $optionList  = null;
    $curSelectEl = null;
    $options     = null;
    $groups      = null;
}

export function isOptionListExpanded ($select) {
    return $select ? $select.is($curSelectEl) : !!$curSelectEl;
}

export function getEmulatedChildElement (elementIndex, isGroup) {
    if (!isGroup)
        return $options[elementIndex];

    return $groups[elementIndex];
}

export function scrollOptionListByChild (child) {
    var select = domUtils.getSelectParent(child);

    if (!select)
        return;

    var $select            = $(select),
        realSizeValue      = styleUtils.getSelectElementSize(select),
        optionHeight       = styleUtils.getOptionHeight(select),
        scrollIndent       = 0,

        topVisibleIndex    = Math.max($select.scrollTop() / optionHeight, 0),
        bottomVisibleIndex = topVisibleIndex + realSizeValue - 1,

        childIndex         = domUtils.getChildVisibleIndex($select[0], child);

    if (childIndex < topVisibleIndex) {
        scrollIndent = optionHeight * (topVisibleIndex - childIndex);
        $select.scrollTop(Math.max($select.scrollTop() - scrollIndent, 0));
    }
    else if (childIndex > bottomVisibleIndex) {
        scrollIndent = optionHeight * (childIndex - bottomVisibleIndex);
        $select.scrollTop($select.scrollTop() + scrollIndent);
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

    var optionHeight   = styleUtils.getOptionHeight(select),
        childRectangle = positionUtils.getElementRectangle(child);

    return {
        x: Math.round(childRectangle.left + childRectangle.width / 2),
        y: Math.round(childRectangle.top + optionHeight / 2)
    };
}

export function switchOptionsByKeys (command) {
    var $select = $(domUtils.getActiveElement());

    if ($select[0].tagName.toLowerCase() !== 'select')
        return;

    if (/enter|tab|esc/.test(command))
        collapseOptionList();

    if (/down|up/.test(command) ||
        (!browserUtils.isIE &&
         (styleUtils.getSelectElementSize($select[0]) <= 1 || browserUtils.isFirefox) &&
         (!$(shadowUI.select('.' + OPTION_LIST_CLASS)).is(':visible') ||
          browserUtils.isFirefox) &&
         /left|right/.test(command))) {

        var $options        = $select.find('option'),
            $enabledOptions = $options.filter(function () {
                var parent = $(this).parent()[0];
                return !this.disabled && !(parent.tagName.toLowerCase() === 'optgroup' && parent.disabled);
            }),
            nextIndex       = $.inArray($select.find('option:selected')[0], $enabledOptions);

        nextIndex += /down|right/.test(command) ? 1 : -1;

        if (nextIndex >= 0 && nextIndex < $enabledOptions.length) {
            $select[0].selectedIndex = $.inArray($enabledOptions[nextIndex], $options);
            eventSimulator.change($select[0]);
        }
    }
}
