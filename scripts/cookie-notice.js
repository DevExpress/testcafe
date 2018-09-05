$(function(){
    var COOKIE_CONSENT_FLAG = 'cookie-consent';

    function closeNotice() {
        window.localStorage.setItem(COOKIE_CONSENT_FLAG, true);
        $('.cookie-notice').removeClass('visible');
    }

    function isLocalStorageAvailable() {
        try {
            window.localStorage.setItem('test', 1);
            window.localStorage.removeItem('test');
            return true;
        } catch(err) {
            return false;
        }
    }

    var wasCookieNoticeShown = window.localStorage.getItem(COOKIE_CONSENT_FLAG);

    if(isLocalStorageAvailable() && !wasCookieNoticeShown)
        $('.cookie-notice').addClass('visible');

    $('.close-icon').on('click', closeNotice);
    $('.cookie-notice-button').on('click', closeNotice);
});