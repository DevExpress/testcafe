(function () {
    $('<link rel="stylesheet" type="text/css" href="/styles.css">').appendTo('head');

    //NOTE: Prohibit Hammerhead from processing testing environment resources.
    // There are only testing environment resources on the page when this script is being executed. So, we can add
    // the hammerhead class to all script and link elements on the page.
    $('script').addClass('script-hammerhead-shadow-ui');
    $('link').addClass('ui-stylesheet-hammerhead-shadow-ui');


    function getTestCafeModule (module) {
        return window['%' + module + '%'];
    }

    //Hammerhead setup
    const hammerhead   = getTestCafeModule('hammerhead');
    const INSTRUCTION  = hammerhead.get('../processing/script/instruction');
    const location     = 'http://localhost/sessionId/https://example.com';
    const browserUtils = hammerhead.utils.browser;

    hammerhead.get('./utils/destination-location').forceLocation(location);

    const iframeTaskScriptTempate = [
        'window["%hammerhead%"].get("./utils/destination-location").forceLocation("{{{location}}}");',
        'window["%hammerhead%"].start({',
        '    referer : "{{{referer}}}",',
        '    cookie: "{{{cookie}}}",',
        '    serviceMsgUrl : "{{{serviceMsgUrl}}}",',
        '    sessionId : "sessionId",',
        '    iframeTaskScriptTemplate: {{{iframeTaskScriptTemplate}}}',
        '});'
    ].join('');

    window.getIframeTaskScript = function (referer, serviceMsgUrl, loc, cookie) {
        return iframeTaskScriptTempate
            .replace('{{{referer}}}', referer || '')
            .replace('{{{serviceMsgUrl}}}', serviceMsgUrl || '')
            .replace('{{{location}}}', loc || '')
            .replace('{{{cookie}}}', cookie || '');
    };

    window.initIFrameTestHandler = function (e) {
        const referer          = location;
        const serviceMsg       = '/service-msg/100';
        const iframeTaskScript = window.getIframeTaskScript(referer, serviceMsg, location).replace(/"/g, '\\"');

        if (e.iframe.id.indexOf('test') !== -1) {
            e.iframe.contentWindow.eval.call(e.iframe.contentWindow, [
                'window["%hammerhead%"].get("./utils/destination-location").forceLocation("' + location + '");',
                'window["%hammerhead%"].start({',
                '    referer : "' + referer + '",',
                '    serviceMsgUrl : "' + serviceMsg + '",',
                '    iframeTaskScriptTemplate: "' + iframeTaskScript + '",',
                '    sessionId : "sessionId"',
                '});'
            ].join(''));
        }
    };

    hammerhead.start({ sessionId: 'sessionId' });


    //TestCafe setup
    const testCafeLegacyRunner = getTestCafeModule('testCafeLegacyRunner');
    const tcSettings           = testCafeLegacyRunner.get('./settings');
    const sandboxedJQuery      = testCafeLegacyRunner.get('./sandboxed-jquery');

    tcSettings.get().REFERER          = 'https://example.com';
    tcSettings.get().SELECTOR_TIMEOUT = 10000;

    sandboxedJQuery.init(window);

    // NOTE: https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/17477979/
    window.DIRECTION_ALWAYS_IS_FORWARD = false;

    if (browserUtils.isMSEdge && browserUtils.version >= 17) {
        $(function () {
            const nativeMethods = hammerhead.nativeMethods;
            const input         = nativeMethods.createElement.call(document, 'input');

            nativeMethods.appendChild.call(document.body, input);
            nativeMethods.inputValueSetter.call(input, 'text');
            nativeMethods.setSelectionRange.call(input, 0, 2, 'backward');

            window.DIRECTION_ALWAYS_IS_FORWARD = input.selectionDirection === 'forward';

            nativeMethods.removeChild.call(document.body, input);
        });
    }

    //Tests API
    window.getTestCafeModule = getTestCafeModule;
    window.getProperty       = window[INSTRUCTION.getProperty];
    window.setProperty       = window[INSTRUCTION.setProperty];
    window.sandboxedJQuery   = sandboxedJQuery;

    window.getCrossDomainPageUrl = function (filePath) {
        return window.QUnitGlobals.crossDomainHostname + window.QUnitGlobals.getResourceUrl(filePath);
    };

    // HACK: The iOS browser performs unexpected scrolling in some cases (see https://github.com/DevExpress/testcafe/issues/471)
    // With this hack, we only allow setting the scroll by a script and prevent native browser scrolling.
    if (hammerhead.utils.browser.isIOS) {
        document.addEventListener('DOMContentLoaded', function () {
            const originWindowScrollTo = hammerhead.nativeMethods.scrollTo;

            let lastScrollTop        = window.scrollY;
            let lastScrollLeft       = window.scrollX;

            hammerhead.nativeMethods.scrollTo = function () {
                lastScrollLeft = arguments[0];
                lastScrollTop  = arguments[1];

                originWindowScrollTo.apply(window, arguments);
            };

            window.addEventListener('scroll', function () {
                if (window.scrollX !== lastScrollLeft || window.scrollY !== lastScrollTop)
                    window.scrollTo(lastScrollLeft, lastScrollTop);
            });

            Object.defineProperty(document.body, 'scrollTop', {
                get: function () {
                    return window.scrollY;
                },

                set: function (y) {
                    window.scrollTo(window.scrollX, y);
                }
            });
        });
    }

    QUnit.config.testTimeout = 15000;
})();
