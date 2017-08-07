$(function() {
    var WIDGET_DISPLAYED_FLAG = 'widget-displayed';
    var WIDGET_OPENED_FLAG = 'widget-opened';

    function sendGaEvent(event) {
        

        ga('send', 'event', 'shareWidget', event);

        
    }

    function updateWidgetVisibility() {
        if(window.needShowShareWidget()) {
            $('.widget-container').removeClass('hidden');
            if(!window.localStorage.getItem(WIDGET_DISPLAYED_FLAG)) {
                sendGaEvent('shareWidgetFirstDisplay');
                window.localStorage.setItem(WIDGET_DISPLAYED_FLAG, true);
            }
        }
        else 
            $('.widget-container').addClass('hidden');
    }

    function handleWidgetAction(event) {
        updateWidgetVisibility();
        sendGaEvent(event);
    }

    function openWidget() {
        $('.widget-container').addClass('out');
        
        if(!window.localStorage.getItem(WIDGET_OPENED_FLAG)) {
            sendGaEvent('shareWidgetFirstOpen');
            window.localStorage.setItem(WIDGET_OPENED_FLAG, true);
        }
    }

    $('#share-button').on('click', function () {
        openWidget();
    });

    $('#tweet').on('click', function () {
        handleWidgetAction('shareWidgetTwitter');
    });

    $('#facebook').on('click', function () {
        handleWidgetAction('shareWidgetFacebook');
    });
    
    $('#collapse').on('click', function () {
        $('.widget-container').removeClass('out');
    });

    $(document).bind( "mousedown touchstart", function(e) {
        var widget = $('.widget-container');

        var clickOutsideWidget = !widget.is(e.target) && widget.has(e.target).length === 0;

        if (clickOutsideWidget) 
            widget.removeClass('out');
    });

    updateWidgetVisibility();
});
