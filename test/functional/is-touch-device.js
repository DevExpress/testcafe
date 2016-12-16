/*eslint-disable no-unused-vars*/
function isTouchDevice () {
    var userAgent   = window.navigator.userAgent.toLocaleLowerCase();
    var mobile      = /[^-]mobi/i.test(userAgent);
    var tablet      = /tablet/i.test(userAgent);
    var nexusDevice = /nexus\s*[0-6]\s*/i.test(userAgent) || /nexus\s*[0-9]+/i.test(userAgent);
    var blackberry  = /blackberry|\bbb\d+/i.test(userAgent) || /rim\stablet/i.test(userAgent);
    var isIOS       = /(iphone|ipod|ipad)/.test(userAgent);
    var isAndroid   = /(android)/.test(userAgent);

    var isDevice       = mobile || tablet || nexusDevice || isIOS || isAndroid || blackberry;
    var hasTouchEvents = 'ontouchstart' in window;


    return isDevice && hasTouchEvents;
}
/*eslint-disable no-unused-vars*/
