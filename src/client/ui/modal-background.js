import hammerhead from './deps/hammerhead';
import testCafeCore from './deps/testcafe-core';

var shadowUI = hammerhead.shadowUI;
var $        = testCafeCore.$;


//Const
const LOADING_TEXT                         = 'Loading page...';
const BACKGROUND_CLASS                     = 'modal-background';
const LOADING_TEXT_CLASS                   = 'loading-text';
const BACKGROUND_OPACITY                   = 0.7;
const BACKGROUND_OPACITY_WITH_LOADING_TEXT = 0.8;

const LOADING_ICON_CLASS = 'loading-icon';

//Globals
var $backgroundDiv = null,
    $loadingText   = null,
    $loadingIcon   = null,
    initialized    = false;

//Markup
function createBackground () {
    var $root = $(shadowUI.getRoot());

    $backgroundDiv = $('<div></div>').appendTo($root);
    shadowUI.addClass($backgroundDiv[0], BACKGROUND_CLASS);

    $loadingText = $('<div></div>')
        .appendTo($root)
        .text(LOADING_TEXT);

    shadowUI.addClass($loadingText[0], LOADING_TEXT_CLASS);

    $loadingIcon = $('<div></div>').css('visibility', 'hidden').appendTo($root);
    shadowUI.addClass($loadingIcon[0], LOADING_ICON_CLASS);
}

//Behavior
function adjustLoadingTextPos () {
    var $window = $(window);

    var wHeight = $window.height(),
        wWidth  = $window.width();

    var loadingTextVisible = $loadingText.is(':visible');

    if (!loadingTextVisible) {
        $loadingText.attr('visibility', 'hidden');
        $loadingText.show();
    }

    $loadingText.css({
        left: Math.max((wWidth - $loadingText.width()) / 2, 0),
        top:  Math.max((wHeight - $loadingText.height()) / 2, 0)
    });

    if (!loadingTextVisible) {
        $loadingText.hide();
        $loadingText.attr('visibility', '');
    }
}

function initSizeAdjustments () {
    var $window = $(window);

    var adjust = function () {
        var wHeight = $window.height(),
            wWidth  = $window.width();

        $backgroundDiv.width(wWidth);
        $backgroundDiv.height(wHeight);

        $loadingIcon.css('top', Math.round((wHeight - $loadingIcon.height()) / 2));
        $loadingIcon.css('left', Math.round((wWidth - $loadingIcon.width()) / 2));
    };

    adjust();

    $window.resize(adjust);
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

        $backgroundDiv.css({ opacity: BACKGROUND_OPACITY_WITH_LOADING_TEXT });
        $backgroundDiv.show();
        $loadingText.show();

        shown = true;
    };

    var tryShowBeforeReady = function () {
        if (!shown) {
            if (document.body)
                initAndShow();
            else
                window.setTimeout(tryShowBeforeReady, 0);
        }
    };

    tryShowBeforeReady();

    //NOTE: ensure that background was shown on ready
    $(document).ready(function () {
        if (!shown)
            initAndShow();
    });
}

export function show (transparent) {
    if (!initialized)
        init();

    $backgroundDiv.css({ opacity: transparent ? 0 : BACKGROUND_OPACITY });
    $backgroundDiv.show();
}

export function hide () {
    if (!initialized)
        return;

    $loadingText.hide();
    $backgroundDiv.hide();
}

export function showLoadingIcon () {
    $loadingIcon.css('visibility', 'visible');
}

export function hideLoadingIcon () {
    $loadingIcon.css('visibility', 'hidden');
}
