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

    hammerhead.get('./utils/destination-location').forceLocation('http://localhost/sessionId/https://example.com');

    window.initIFrameTestHandler = function (e) {
        if (e.iframe.id.indexOf('test') !== -1) {
            e.iframe.contentWindow.eval.call(e.iframe.contentWindow, [
                'window["%hammerhead%"].start({',
                '    referer : "http://localhost/sessionId/https://example.com",',
                '    serviceMsgUrl : "/service-msg/100",',
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

    tcSettings.get().REFERER = 'https://example.com';

    sandboxedJQuery.init(window);


    //Tests API
    window.getTestCafeModule = getTestCafeModule;
    window.getProperty       = window[INSTRUCTION.getProperty];
    window.setProperty       = window[INSTRUCTION.setProperty];
    window.sandboxedJQuery   = sandboxedJQuery;

    window.getCrossDomainPageUrl = function (filePath) {
        return window.QUnitGlobals.crossDomainHostname + window.QUnitGlobals.getResourceUrl(filePath);
    };
})();
