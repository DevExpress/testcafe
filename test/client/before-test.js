(function () {
    //NOTE: Prohibit Hammerhead from processing testing environment resources.
    // There are only testing environment resources on the page when this script is being executed. So, we can add
    // the hammerhead class to all script and link elements on the page.
    $('script').addClass('script-hammerhead-shadow-ui');
    $('link').addClass('ui-stylesheet-hammerhead-shadow-ui');


    function getTestCafeModule (module) {
        if (module === 'hammerhead')
            return window.Hammerhead;

        return window['%' + module + '%'];
    }


    //Hammerhead setup
    var hammerhead         = getTestCafeModule('hammerhead');
    var hammerheadSettings = hammerhead.get('./settings');
    var urlUtils           = hammerhead.get('./utils/url');
    var HH_CONST           = hammerhead.get('../const');
    var jsProcessor        = hammerhead.get('../processing/js/index');

    hammerheadSettings.set({
        sessionId: 'sessionId'
    });

    urlUtils.OriginLocation.get = function () {
        return 'https://example.com';
    };

    window.initIFrameTestHandler = function (e) {
        if (e.iframe.id.indexOf('test') !== -1) {
            e.iframe.contentWindow.eval.call(e.iframe.contentWindow, [
                'Hammerhead.start({',
                '    referer : "http://localhost/sessionId/https://example.com",',
                '    serviceMsgUrl : "/service-msg/100",',
                '    sessionId : "sessionId"',
                '});'
            ].join(''));
        }
    };

    hammerhead.start();


    //TestCafe setup
    var testCafeCore = getTestCafeModule('testCafeCore');
    var tcSettings   = testCafeCore.get('./settings');

    tcSettings.get().REFERER = 'https://example.com';


    //Tests API
    window.getTestCafeModule = getTestCafeModule;

    window.overrideDomMeth = window[HH_CONST.DOM_SANDBOX_OVERRIDE_DOM_METHOD_NAME];

    window[HH_CONST.DOM_SANDBOX_OVERRIDE_DOM_METHOD_NAME] = function (el) {
        if (el)
            window.overrideDomMeth(el);
    };

    window.processScript = window[jsProcessor.PROCESS_SCRIPT_METH_NAME];
    window.getProperty   = window[jsProcessor.GET_PROPERTY_METH_NAME];
    window.setProperty   = window[jsProcessor.SET_PROPERTY_METH_NAME];
    window.callMethod    = window[jsProcessor.CALL_METHOD_METH_NAME];
    window.getLocation   = window[jsProcessor.GET_LOCATION_METH_NAME];


    window.getCrossDomainPageUrl = function (filePath) {
        return window.QUnitGlobals.crossDomainHostname + window.QUnitGlobals.getResourceUrl(filePath);
    };
})();
