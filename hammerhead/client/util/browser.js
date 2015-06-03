HammerheadClient.define('Util.Browser', function (require) {
    var $ = require('jQuery');

    var userAgent = navigator.userAgent,
        isIE11 = !!(navigator.appCodeName === 'Mozilla' && /Trident\/7.0/i.test(userAgent)),
        isIE = !!$.browser.msie || isIE11;

    this.exports = {
        isAndroid: /android/i.test(userAgent),
        isIE11: isIE11,
        isIE: isIE,
        isIOS: /(iphone|ipod|ipad)/i.test(userAgent),
        isMozilla: !!$.browser.mozilla && !isIE11,
        isOpera: $.browser.opera,
        isOperaWithWebKit: /OPR/.test(navigator.userAgent),
        isSafari: /Safari/i.test(userAgent) && !/Chrome/i.test(userAgent),
        isWebKit: /WebKit/i.test(userAgent),
        hasTouchEvents: !!('ontouchstart' in window),
        //NOTE: we need check of touch points only for IE, because it has PointerEvent and MSPointerEvent (IE10, IE11) instead TouchEvent (T109295)
        isTouchDevice: !!('ontouchstart' in window) || (isIE && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0)),

        browserVersion: parseInt($.browser.version, 10)
    };
});