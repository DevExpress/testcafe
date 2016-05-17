(function () {
    //NOTE: Prohibit Hammerhead from processing testing environment resources.
    // There are only testing environment resources on the page when this script is being executed. So, we can add
    // the hammerhead class to all script and link elements on the page.
    $('script').addClass('script-hammerhead-shadow-ui');
    $('link').addClass('ui-stylesheet-hammerhead-shadow-ui');


    function getTestCafeModule (module) {
        return window['%' + module + '%'];
    }

    //Hammerhead setup
    var hammerhead  = getTestCafeModule('hammerhead');
    var INSTRUCTION = hammerhead.get('../processing/script/instruction');
    var location    = 'http://localhost/sessionId/https://example.com';

    hammerhead.get('./utils/destination-location').forceLocation(location);

    var iframeTaskScriptTempate = [
        'window["%hammerhead%"].get("./utils/destination-location").forceLocation("{{{location}}}");',
        'window["%hammerhead%"].start({',
        '    referer : "{{{referer}}}",',
        '    cookie: "{{{cookie}}}",',
        '    serviceMsgUrl : "{{{serviceMsgUrl}}}",',
        '    sessionId : "sessionId",',
        '    iframeTaskScriptTemplate: {{{iframeTaskScriptTemplate}}}',
        '});'
    ].join('');

    window.getIframeTaskScript = function (referer, serviceMsgUrl, location, cookie) {
        return iframeTaskScriptTempate
            .replace('{{{referer}}}', referer || '')
            .replace('{{{serviceMsgUrl}}}', serviceMsgUrl || '')
            .replace('{{{location}}}', location || '')
            .replace('{{{cookie}}}', cookie || '');
    };

    window.initIFrameTestHandler = function (e) {
        var referer          = location;
        var serviceMsg       = '/service-msg/100';
        var iframeTaskScript = window.getIframeTaskScript(referer, serviceMsg, location).replace(/"/g, '\\"');

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
    var testCafeCore    = getTestCafeModule('testCafeCore');
    var tcSettings      = testCafeCore.get('./settings');
    var sandboxedJQuery = testCafeCore.get('./sandboxed-jquery');

    tcSettings.get().REFERER                      = 'https://example.com';
    tcSettings.get().ELEMENT_AVAILABILITY_TIMEOUT = 10000;

    sandboxedJQuery.init(window);


    //Tests API
    window.getTestCafeModule = getTestCafeModule;
    window.getProperty       = window[INSTRUCTION.getProperty];
    window.setProperty       = window[INSTRUCTION.setProperty];
    window.sandboxedJQuery   = sandboxedJQuery;

    window.getCrossDomainPageUrl = function (filePath) {
        return window.QUnitGlobals.crossDomainHostname + window.QUnitGlobals.getResourceUrl(filePath);
    };

    // HACK: The iOS browser performs unexpected scrolling in some cases (https://github.com/DevExpress/testcafe/issues/471)
    // With this hack, we only allow setting the scroll by a script and prevent native browser scrolling.
    window.preventNativeScrolling = function () {
        var originWindowScrollTo = window.scrollTo;
        var lastScrollTop        = window.scrollY;
        var lastScrollLeft       = window.scrollX;

        window.scrollTo = function () {
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
    };
})();
