$(function(){
    var COOKIE_CONSENT_FLAG = 'cookie-consent';

    function closeNotice() {
        window.localStorage.setItem(COOKIE_CONSENT_FLAG, true);
        $('.cookie-notice').removeClass('visible');
    }

    if(!window.localStorage.getItem(COOKIE_CONSENT_FLAG)) {
        $('.cookie-notice').addClass('visible');
    }

    $('.close-icon').on('click', closeNotice);
    $('.cookie-notice-button').on('click', closeNotice);
});