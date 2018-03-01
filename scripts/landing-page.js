$(function(){
    
    
    var GET_STARTED_CLICKED_FLAG = 'get-started-clicked';

    $('.get-started-button').on('click', function () {
        if(!window.localStorage.getItem(GET_STARTED_CLICKED_FLAG)) {
            ga('send', 'event', 'landingPage', 'getStartedClicked');
            window.localStorage.setItem(GET_STARTED_CLICKED_FLAG, true);
        }
    });

    
})

