const hammerhead    = window.getTestCafeModule('hammerhead');
const browserUtils  = hammerhead.utils.browser;

asyncTest('isIFrameWindowInDOM', function () {
    expect(browserUtils.isIE ? 2 : 1);

    let messageCounter = 0;

    function finishTest () {
        window.removeEventListener('message', onMessage, false);
        start();
    }

    function onMessage (event) {
        if (messageCounter === 0) {
            equal(event.data, 'true');

            const iFramePostMessage = iframe.contentWindow.postMessage.bind(iframe.contentWindow);

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

    const iframe = $('<iframe>')[0];

    iframe.src = window.getCrossDomainPageUrl('../../data/dom-utils/iframe.html');

    window.QUnitGlobals.waitForIframe(iframe).then(function () {
        iframe.contentWindow.postMessage('isIFrameWindowInDOM', '*');
    });

    document.body.appendChild(iframe);
});
