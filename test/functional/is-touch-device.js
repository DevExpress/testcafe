/*eslint-disable @typescript-eslint/no-unused-vars*/
function isTouchDevice () {
    const userAgent   = window.navigator.userAgent.toLocaleLowerCase();
    const mobile      = /[^-]mobi/i.test(userAgent);
    const tablet      = /tablet/i.test(userAgent);
    const nexusDevice = /nexus\s*[0-6]\s*/i.test(userAgent) || /nexus\s*[0-9]+/i.test(userAgent);
    const blackberry  = /blackberry|\bbb\d+/i.test(userAgent) || /rim\stablet/i.test(userAgent);
    const isIOS       = /(iphone|ipod|ipad)/.test(userAgent);
    const isAndroid   = /(android)/.test(userAgent);

    const isDevice       = mobile || tablet || nexusDevice || isIOS || isAndroid || blackberry;
    const hasTouchEvents = 'ontouchstart' in window;


    return isDevice && hasTouchEvents;
}
/*eslint-disable @typescript-eslint/no-unused-vars*/
