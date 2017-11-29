import { shadowUI, nativeMethods } from './deps/hammerhead';
import { styleUtils, eventUtils } from './deps/testcafe-core';
import uiRoot from './ui-root';


//Const
const LOADING_TEXT                         = 'Loading page...';
const BACKGROUND_CLASS                     = 'modal-background';
const LOADING_TEXT_CLASS                   = 'loading-text';
const BACKGROUND_OPACITY                   = 0.7;
const BACKGROUND_OPACITY_WITH_LOADING_TEXT = 0.8;

const LOADING_ICON_CLASS = 'loading-icon';

//Globals
var backgroundDiv  = null;
var loadingTextDiv = null;
var loadingIconDiv = null;
var initialized    = false;

//Markup
function createBackground () {
    var root = uiRoot.element();

    backgroundDiv = document.createElement('div');
    root.appendChild(backgroundDiv);
    shadowUI.addClass(backgroundDiv, BACKGROUND_CLASS);

    loadingTextDiv             = document.createElement('div');
    loadingTextDiv.textContent = LOADING_TEXT;
    root.appendChild(loadingTextDiv);
    shadowUI.addClass(loadingTextDiv, LOADING_TEXT_CLASS);

    loadingIconDiv = document.createElement('div');
    styleUtils.set(loadingIconDiv, 'visibility', 'hidden');
    root.appendChild(loadingIconDiv);
    shadowUI.addClass(loadingIconDiv, LOADING_ICON_CLASS);
}

//Behavior
function adjustLoadingTextPos () {
    var wHeight           = styleUtils.getHeight(window);
    var wWidth            = styleUtils.getWidth(window);
    var loadingTextHidden = !styleUtils.hasDimensions(loadingTextDiv);

    if (loadingTextHidden) {
        styleUtils.set(loadingTextDiv, 'visibility', 'hidden');
        styleUtils.set(loadingTextDiv, 'display', 'block');
    }

    styleUtils.set(loadingTextDiv, {
        left: Math.max((wWidth - styleUtils.getWidth(loadingTextDiv)) / 2, 0) + 'px',
        top:  Math.max((wHeight - styleUtils.getHeight(loadingTextDiv)) / 2, 0) + 'px'
    });

    if (loadingTextHidden) {
        styleUtils.set(loadingTextDiv, 'display', 'none');
        styleUtils.set(loadingTextDiv, 'visibility', '');
    }
}

function initSizeAdjustments () {
    var adjust = function () {
        var wHeight = styleUtils.getHeight(window);
        var wWidth  = styleUtils.getWidth(window);

        styleUtils.set(backgroundDiv, 'width', wWidth + 'px');
        styleUtils.set(backgroundDiv, 'height', wHeight + 'px');

        styleUtils.set(loadingIconDiv, {
            left: Math.round((wWidth - styleUtils.getWidth(loadingIconDiv)) / 2) + 'px',
            top:  Math.round((wHeight - styleUtils.getHeight(loadingIconDiv)) / 2) + 'px'
        });
    };

    adjust();

    eventUtils.bind(window, 'resize', adjust);
}

function init () {
    createBackground();
    initSizeAdjustments();
    adjustLoadingTextPos();

    initialized = true;
}

export function initAndShowLoadingText () {
    var shown = false;

    //NOTE: init and show modal background as soon as possible
    var initAndShow = function () {
        init();

        styleUtils.set(backgroundDiv, 'opacity', BACKGROUND_OPACITY_WITH_LOADING_TEXT);
        styleUtils.set(backgroundDiv, 'display', 'block');
        styleUtils.set(loadingTextDiv, 'display', 'block');

        shown = true;
    };

    var tryShowBeforeReady = function () {
        if (!shown) {
            if (document.body)
                initAndShow();
            else
                nativeMethods.setTimeout.call(window, tryShowBeforeReady, 0);
        }
    };

    tryShowBeforeReady();

    //NOTE: ensure that background was shown on ready
    eventUtils
        .documentReady()
        .then(() => {
            if (!shown)
                initAndShow();
        });
}

export function show (transparent) {
    if (!initialized)
        init();

    styleUtils.set(backgroundDiv, 'opacity', transparent ? 0 : BACKGROUND_OPACITY);
    styleUtils.set(backgroundDiv, 'display', 'block');
}

export function hide () {
    if (!initialized)
        return;

    styleUtils.set(loadingTextDiv, 'display', 'none');
    styleUtils.set(backgroundDiv, 'display', 'none');
}

export function showLoadingIcon () {
    styleUtils.set(loadingIconDiv, 'visibility', 'visible');
}

export function hideLoadingIcon () {
    styleUtils.set(loadingIconDiv, 'visibility', 'hidden');
}
