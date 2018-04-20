$(function(){
    
    
    var GET_STARTED_CLICKED_FLAG = 'get-started-clicked';

    $('.get-started-button').on('click', function () {
        if(!window.localStorage.getItem(GET_STARTED_CLICKED_FLAG)) {
            ga('send', 'event', 'landingPage', 'getStartedClicked');
            window.localStorage.setItem(GET_STARTED_CLICKED_FLAG, true);
        }
    });

    

    function closePlayer(e) {
        var clickOutsidePlayer = player !== e.target && !window.has(player, e.target);
    
        if(clickOutsidePlayer && veil.className.indexOf('veil-on') !== -1) {
            var iframe    = document.querySelector('#yt-iframe')
            var iframeSrc = iframe.src;
    
            // NOTE: Reassigning iframe's src is a quick way to stop the video
            // without sending postMessage.
            iframe.src = iframeSrc;
            veil.className = 'veil-off';
        }
    }
    
    var videoButton = document.querySelector('.video-button');
    var veil        = document.querySelector('.veil-off');
    var player      = document.querySelector('.player');
    
    videoButton.addEventListener('click', function(e) {
        veil.className = 'veil-on';
    });
    
    window.addEventListener('mousedown', closePlayer);        
    window.addEventListener('touchstart', closePlayer);
})