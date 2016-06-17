import testCafeCore from '../deps/testcafe-core';
import testCafeUI from '../deps/testcafe-ui';

var domUtils = testCafeCore.domUtils;
var cursorUI = window.top === window.self ? testCafeUI.cursorUI : testCafeUI.iframeCursorUI;


export default {
    x:                   50,
    y:                   50,
    currentActiveWindow: window.top,

    _ensureActiveWindow () {
        if (this.currentActiveWindow === window || this.currentActiveWindow === window.parent)
            return;

        var activeFrame = domUtils.findIframeByWindow(this.currentActiveWindow);

        if (!activeFrame || !domUtils.isElementInDocument(activeFrame))
            this.currentActiveWindow = window;
    },

    get active () {
        this._ensureActiveWindow();
        return this.currentActiveWindow === window;
    },

    set activeWindow (win) {
        this.currentActiveWindow = win;
    },

    get activeWindow () {
        this._ensureActiveWindow();
        return this.currentActiveWindow;
    },

    get position () {
        return { x: this.x, y: this.y };
    },

    get visible () {
        return window.top === window.self && cursorUI.isVisible();
    },

    move (newX, newY) {
        this.x = newX;
        this.y = newY;

        return cursorUI.move(this.x, this.y);
    },

    hide () {
        if (this.visible)
            cursorUI.hide();
    },

    show () {
        if (window.top === window.self)
            cursorUI.show();
    },

    leftButtonDown () {
        return cursorUI.leftButtonDown();
    },

    rightButtonDown () {
        return cursorUI.leftButtonDown();
    },

    buttonUp () {
        return cursorUI.buttonUp();
    }
};
