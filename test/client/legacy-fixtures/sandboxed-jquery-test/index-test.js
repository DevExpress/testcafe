(function (jQuery, $) {
    /* NOTE: At the end of event handlers chain jQuery tries to call method in event target with the same name as event's name.
    So, in our case, it tries to call 'document.ready()' method when 'ready' event is dispatched.
    Tested page may have 'document.ready' method which may not be expected to be called as a handler (expects some args, etc.),
    so such behavior causes JS errors on page. So we disable this behavior for ready event.

    HOW TO FIX - go to sandboxed-jquery and replace the following code:
    trigger: function( event, data, elem, onlyHandlers ) {
       ...
       // Prevent re-triggering of the same event, since we already bubbled it above
       jQuery.event.triggered = type;
       elem[ type ]();
       ...
    }
    with the code below:
    trigger: function( event, data, elem, onlyHandlers ) {
       ...
       // Prevent re-triggering of the same event, since we already bubbled it above
       jQuery.event.triggered = type;
       if (!domUtils.isDocument(elem) || type !== 'ready')
           __call$(elem, type, []);
       ...
    }*/

    test('T173577: TD_14_2 Uncaught TypeError: Cannot read property "call" of undefined - ikea.ru', function () {
        var documentReadyCalled = false;

        document.ready = function () {
            documentReadyCalled = true;
        };

        $(document).trigger('ready');

        ok(!documentReadyCalled);
    });
    /*eslint-disable no-undef*/
}(_jQuery, _jQuery));
/*eslint-enable no-undef*/


/*NOTE: The function "noConflict" in our jQuery clears the variable window.jQuery, binding undefined for it,
but the user script checks the existence jQuery via operator "in"

HOW TO FIX - go to sandboxed-jquery and replace the following code:
 trigger: function( event, data, elem, onlyHandlers ) {
    ...
    noConflict: function( deep ) {
        if ( window.$ === jQuery ) {
            window.$ = _$;
        }

        if ( deep && window.jQuery === jQuery ) {
            window.jQuery = _jQuery;
        }

        return jQuery;
    },
    ...
 }
 with the code below:
 trigger: function( event, data, elem, onlyHandlers ) {
    ...
    noConflict:    function (deep) {
        if (window.$ === jQuery) {
            window.$ = _$;
        }
        if (!window.$)
            delete window.$;
        if (deep && window.jQuery === jQuery) {
            window.jQuery = _jQuery;
        }
        if (!window.jQuery)
            delete window.jQuery;
        return jQuery;
    },
    ...
 }*/

asyncTest('T230756: TD15.1 - _ is not defined on tula.metro-cc.ru', function () {
    var iframe = $('<iframe>').attr('src', window.QUnitGlobals.getResourceUrl('iframe.html'))[0];

    window.QUnitGlobals.waitForIframe(iframe).then(function () {
        ok(!('$' in iframe.contentWindow));
        ok(!('jQuery' in iframe.contentWindow));

        document.body.removeChild(iframe);
        start();
    });

    document.body.appendChild(iframe);
});
