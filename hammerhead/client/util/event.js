HammerheadClient.define('Util.Event', function (require, exports) {
    // TODO: move to testcafe?
    exports.RECORDING_LISTENED_EVENTS = [
        'click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'mousemove', 'mouseover', 'mouseout',
        'touchstart', 'touchmove', 'touchend', 'keydown', 'keypress', 'keyup', 'change', 'focus', 'blur',
        'MSPointerDown', 'MSPointerMove','MSPointerOver', 'MSPointerOut', 'MSPointerUp', 'pointerdown',
        'pointermove', 'pointerover', 'pointerout', 'pointerup'];

    exports.DOM_EVENTS = exports.RECORDING_LISTENED_EVENTS.concat(['focusin', 'focusout', 'mouseenter', 'mouseleave', 'pointerenter', 'pointerleave']);

    exports.preventDefault = function(ev, allowBubbling) {
        if (ev.preventDefault)
            ev.preventDefault();
        else
            ev.returnValue = false;

        if (!allowBubbling)
            exports.stopPropagation(ev);
    };

    exports.stopPropagation = function(ev) {
        if (ev.stopImmediatePropagation)
            ev.stopImmediatePropagation();
        else if (ev.stopPropagation)
            ev.stopPropagation();

        ev.cancelBubble = true;
    };
});