const hammerhead    = window.getTestCafeModule('hammerhead');
const browserUtils  = hammerhead.utils.browser;
const testCafeCore  = window.getTestCafeModule('testCafeCore');
const domUtils      = testCafeCore.domUtils;

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

test('contains', function () {
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    const div3 = document.createElement('div');

    document.body.appendChild(div1);
    document.body.appendChild(div2);

    div1.appendChild(div3);

    div3.innerHTML = '<svg><circle></circle></svg>';

    const svg = div3.childNodes[0];
    const circle = svg.childNodes[0];

    ok(domUtils.contains(document.body, div1));
    ok(domUtils.contains(document.body, div2));
    ok(domUtils.contains(document.body, div3));
    ok(domUtils.contains(document.body, svg));
    ok(domUtils.contains(document.body, circle));
    ok(domUtils.contains(div1, div1));
    ok(domUtils.contains(div1, div3));
    ok(domUtils.contains(div1, svg));
    ok(domUtils.contains(div1, circle));
    ok(domUtils.contains(div3, svg));
    ok(domUtils.contains(div3, circle));
    ok(domUtils.contains(svg, circle));

    notOk(domUtils.contains(div1, div2));
    notOk(domUtils.contains(div2, svg));
    notOk(domUtils.contains(svg, div2));
    notOk(domUtils.contains(div2, circle));

    document.body.removeChild(div1);
    document.body.removeChild(div2);
});
