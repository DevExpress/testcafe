HammerheadClient.define('PageState', function (require, exports) {
    var $ = require('jQuery'),
        EventSandbox = require('DOMSandbox.Event'),
        JSProcessor = require('Shared.JSProcessor'),
        TextSelection = require('TextSelection'),
        Util = require('Util'),

        EventSimulator = EventSandbox.Simulator;

    var shadowUIGetRoot = null,
        shadowUISelect = null,

        lastSavedActiveElement = null;

    function getInnerHTML(el) {
        var $testCafeRoot = shadowUIGetRoot();

        if (el.tagName.toLowerCase() === 'body' && hasRootElement(el, $testCafeRoot)) {
            var $cloneBody = $(el).clone(),
                $cloneRoot = shadowUISelect('#' + $testCafeRoot[0].id, $cloneBody);

            $cloneRoot.remove();

            return window[JSProcessor.GET_PROPERTY_METH_NAME]($cloneBody[0], 'innerHTML');
        }

        return window[JSProcessor.GET_PROPERTY_METH_NAME](el, 'innerHTML');
    }

    function hasRootElement(el, $root) {
        var $testCafeRoot = $root || shadowUIGetRoot();

        return shadowUISelect('#' + $testCafeRoot[0].id, $(el)).length;
    }

    function setInnerHTML(el, savedInnerHTML) {
        //NOTE: we should change the contentEditable element's content only if it's really necessary,
        // because otherwise the element will change and will not be available (element.parentElement = null)
        if (!(el.tagName.toLowerCase() === 'body' && hasRootElement(el))) {
            if (window[JSProcessor.GET_PROPERTY_METH_NAME](el, 'innerHTML') !== savedInnerHTML)
                window[JSProcessor.SET_PROPERTY_METH_NAME](el, 'innerHTML', savedInnerHTML);
        } else if (getInnerHTML(el) !== savedInnerHTML) {
            var currentBodyChildren = el.children,
                oldBodyContainer = document.createDocumentFragment(),
                oldBody = $('<body>').attr('contenteditable', 'true')[0],
                oldBodyChildren = null,
                tempNode = null;

            $.each(currentBodyChildren, function (index, item) {
                el.removeChild(item);
            });

            oldBodyContainer.appendChild(oldBody);
            window[JSProcessor.SET_PROPERTY_METH_NAME](oldBody, 'innerHTML', savedInnerHTML);
            oldBodyChildren = oldBody.childNodes;

            while (oldBodyChildren.length) {
                //NOTE: we previously copy node from oldBody because after adding node to body oldBodyChildren array may changed
                tempNode = oldBodyChildren[0];
                oldBody.removeChild(oldBodyChildren[0]);
                oldBodyChildren = oldBody.childNodes;
                el.appendChild(tempNode);
            }
        }
    }

    exports.addAffectedElement = function (state, affectedElement) {
        var isTextEditable = Util.isTextEditableElement(affectedElement);

        state.affectedElement = affectedElement;

        if (isTextEditable || Util.isContentEditableElement(affectedElement)) {
            state.affectedElementValue = isTextEditable ? affectedElement.value : getInnerHTML(affectedElement);
            state.affectedElementStartSelection = TextSelection.getSelectionStart(affectedElement);
            state.affectedElementEndSelection = TextSelection.getSelectionEnd(affectedElement);
            state.affectedElementSelectionInverse = TextSelection.hasInverseSelection(affectedElement);
        }

        state.affectedElementSelectedIndex = Util.isSelectElement(affectedElement) ? affectedElement.selectedIndex : null;
    };

    exports.getLastActiveElement = function () {
        return lastSavedActiveElement;
    };

    exports.init = function (getRoot, select) {
        shadowUIGetRoot = getRoot;
        shadowUISelect = select;
    };

    exports.restoreState = function (state, quiet, callback) {
        var curActiveElement = Util.getActiveElement(),
            activeElement = state.activeElement,
            isActiveElementTextEditable = Util.isTextEditableElement(activeElement);

        function focusCallback() {
            if (Util.isSelectElement(activeElement) && activeElement.selectedIndex !== state.selectedIndex)
                activeElement.selectedIndex = state.selectedIndex;

            if (isActiveElementTextEditable || Util.isContentEditableElement(activeElement)) {
                if (isActiveElementTextEditable)
                    activeElement.value = state.elementValue;
                else
                    setInnerHTML(activeElement, state.elementValue);

                //NOTE: some scripts restore old editor value if it hasn't received keydown or keyup events after value changing
                EventSimulator.keydown(activeElement);
                EventSimulator.keyup(activeElement);

                TextSelection.select(activeElement, state.startSelection, state.endSelection, state.selectionInverse);
            }

            callback();
        }

        if (state.affectedElement && state.affectedElement !== activeElement) {
            if (Util.isEditableElement(state.affectedElement)) {
                if (Util.isTextEditableElement(state.affectedElement))
                    state.affectedElement.value = state.affectedElementValue;
                //NOTE: we should change the contentEditable element's content only if it's really necessary,
                // because otherwise the element will change and will not be available (element.parentElement = null)
                else
                    setInnerHTML(state.affectedElement, state.affectedElementValue);

                //NOTE: some scripts restore old editor value if it hasn't received keydown or keyup events after value changing
                EventSimulator.keydown(state.affectedElement);
                EventSimulator.keyup(state.affectedElement);

                TextSelection.select(state.affectedElement, state.affectedElementStartSelection,
                    state.affectedElementEndSelection, state.affectedElementSelectionInverse);
            }

            if (Util.isSelectElement(state.affectedElement))
                state.affectedElement.selectedIndex = state.affectedElementSelectedIndex;
        }

        if (curActiveElement !== activeElement && Util.isElementFocusable($(activeElement)))
            EventSandbox.focus(activeElement, focusCallback, quiet);
        //T132655: document.activeElement is null after recording hover action in IE
        else if (Util.isIE && document.activeElement === null && activeElement && activeElement === document.body)
            EventSandbox.focus(activeElement, focusCallback, true);
        else
            focusCallback();
    };

    exports.saveState = function (affectedElement) {
        var state = {},
            activeElement = Util.getActiveElement(),
            isTextEditable = Util.isTextEditableElement(activeElement);

        lastSavedActiveElement = state.activeElement = activeElement;
        state.selectionInverse = false;
        state.selectedIndex = Util.isSelectElement(activeElement) ? activeElement.selectedIndex : null;

        if (isTextEditable || Util.isContentEditableElement(activeElement)) {
            state.elementValue = isTextEditable ? activeElement.value :
                getInnerHTML(activeElement);
            state.startSelection = TextSelection.getSelectionStart(activeElement);
            state.endSelection = TextSelection.getSelectionEnd(activeElement);
            state.selectionInverse = TextSelection.hasInverseSelection(activeElement);
        }


        if (affectedElement)
            exports.addAffectedElement(state, affectedElement);

        return state;
    };
});