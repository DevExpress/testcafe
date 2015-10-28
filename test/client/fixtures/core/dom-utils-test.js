var hammerhead   = window.getTestCafeModule('hammerhead');
var browserUtils = hammerhead.utils.browser;

asyncTest('isIFrameWindowInDOM', function () {
    expect(browserUtils.isIE ? 2 : 1);

    var messageCounter = 0;

    function finishTest () {
        window.removeEventListener('message', onMessage, false);
        start();
    }

    function onMessage (event) {
        if (messageCounter === 0) {
            equal(event.data, true);

            var iFramePostMessage = $iFrame[0].contentWindow.postMessage.bind($iFrame[0].contentWindow);

            $iFrame.remove();

            //NOTE: In WebKit, scripts cannot be executed in a removed iframe. Therefore, the test is finished here.
            if (browserUtils.isIE)
                iFramePostMessage('isIFrameWindowInDOM', '*');
            else
                finishTest();
        }
        else {
            equal(event.data, false);
            finishTest();
        }

        messageCounter++;
    }

    window.addEventListener('message', onMessage, false);

    var $iFrame = $('<iframe>')
        .prop('src', window.getCrossDomainPageUrl('../../data/dom-utils/iframe.html'))
        .bind('load', function () {
            $iFrame[0].contentWindow.postMessage('isIFrameWindowInDOM', '*');
        }).appendTo('body');

});
