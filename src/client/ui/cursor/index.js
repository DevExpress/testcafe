import testCafeCore from './../deps/testcafe-core';
import CursorBehavior from './behavior';
import CursorIFrameBehavior from './iframe-behavior';

var SETTINGS = testCafeCore.SETTINGS;

//Global
var cursorBehavior = null;

export function init () {
    if (!cursorBehavior)
        cursorBehavior = window.top !== window.self ? new CursorIFrameBehavior() : new CursorBehavior();
}

export function ensureCursorPosition (position, withoutOffset, callback) {
    if (cursorBehavior.isStarted() && cursorBehavior.getPosition()) {
        callback();
        return;
    }

    var cursorPosition = {
        x: Math.max(0, position.x - (withoutOffset ? 0 : 50)),
        y: Math.max(0, position.y - (withoutOffset ? 0 : 50))
    };

    start(cursorPosition, callback);
}

export function setPosition (position) {
    if (!cursorBehavior.isStarted()) {
        start(position, function () {
        });
    }
    else
        cursorBehavior.cursorPosition = position;
}

export function start (position, callback, iFrameInitiator) {
    if (!cursorBehavior.isStarted()) {
        if (!SETTINGS.get().RECORDING || SETTINGS.get().PLAYBACK) {
            cursorBehavior.start(position, iFrameInitiator);

            cursorBehavior.on(cursorBehavior.STARTED_EVENT, callback);
        }
        else
            callback();
    }
    else {
        cursorBehavior.move(position, function () {
            window.setTimeout(callback, 0);
        }, iFrameInitiator);
    }
}

export function move (to, callback) {
    cursorBehavior.move(to, callback);
}

export function lMouseDown (callback) {
    cursorBehavior.lMouseDown(callback);
}

export function rMouseDown (callback) {
    cursorBehavior.rMouseDown(callback);
}

export function mouseUp (callback) {
    cursorBehavior.mouseUp(callback);
}

export function hide (callback) {
    cursorBehavior.hide(callback);
}

export function show (callback) {
    cursorBehavior.show(callback);
}

export function getElementUnderCursor (x, y, currentDocument) {
    if (cursorBehavior)
        return cursorBehavior.getElementUnderCursor(x, y, currentDocument);
}

export function getPosition () {
    if (cursorBehavior.getPosition)
        return cursorBehavior.getPosition();

    return null;
}

//NOTE: for testing purposes
export function getAbsolutePosition () {
    if (cursorBehavior.getAbsolutePosition)
        return cursorBehavior.getAbsolutePosition();

    return null;
}
