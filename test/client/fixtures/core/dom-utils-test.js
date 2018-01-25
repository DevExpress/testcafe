var hammerhead    = window.getTestCafeModule('hammerhead');
var browserUtils  = hammerhead.utils.browser;
var processScript = hammerhead.processScript;

asyncTest('isIFrameWindowInDOM', function () {
    expect(browserUtils.isIE ? 2 : 1);

    var messageCounter = 0;

    function finishTest () {
        window.removeEventListener('message', onMessage, false);
        start();
    }

    function onMessage (event) {
        if (messageCounter === 0) {
            equal(eval(processScript('event.data')), 'true');

            var iFramePostMessage = iframe.contentWindow.postMessage.bind(iframe.contentWindow);

            document.body.removeChild(iframe);

            //NOTE: In WebKit, scripts cannot be executed in a removed iframe. Therefore, the test is finished here.
            if (browserUtils.isIE)
                iFramePostMessage('isIFrameWindowInDOM', '*');
            else
                finishTest();
        }
        else {
            equal(event.data, 'false');
            finishTest();
        }

        messageCounter++;
    }

    window.addEventListener('message', onMessage, false);

    var iframe = $('<iframe>')[0];

    iframe.src = window.getCrossDomainPageUrl('../../data/dom-utils/iframe.html');

    window.QUnitGlobals.waitForIframe(iframe).then(function () {
        iframe.contentWindow.postMessage('isIFrameWindowInDOM', '*');
    });

    document.body.appendChild(iframe);
});
