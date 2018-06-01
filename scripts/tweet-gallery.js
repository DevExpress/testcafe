$(function() {
    var tweets = [
        
            {
                url: 'https://twitter.com/martin_hotell/status/971339016888029184'
            },
        
            {
                url: 'https://twitter.com/pantvivek28/status/973799993705410560'
            },
        
            {
                url: 'https://twitter.com/damien_hampton/status/962049215634419720'
            },
        
            {
                url: 'https://twitter.com/ChrisZie_/status/938225248792489989'
            },
        
            {
                url: 'https://twitter.com/muhghazali/status/928444497217724416'
            },
        
            {
                url: 'https://twitter.com/dan_sayer89/status/920371866581327882'
            },
        
            {
                url: 'https://twitter.com/alexandrafrnces/status/878912754488397829'
            },
        
            {
                url: 'https://twitter.com/dimaip/status/964164991313235970'
            },
        
            {
                url: 'https://twitter.com/mark_jones/status/898221108708638722'
            }
        
    ];

    var md      = new MobileDetect(window.navigator.userAgent);
    var showNav = !md.mobile();

    $('#tweet-gallery').dxGallery({
        dataSource: tweets,
        width: "100%",
        height: 321,
        showIndicator: false,
        showNavButtons: showNav,
        initialItemWidth: 376,
        loop: true,
        itemTemplate: function (item, index) {
            var result = $("<div>");

            $.ajax({
                url: "https://api.twitter.com/1/statuses/oembed.json?hide_thread=true&hide_media=true&url=" + item.url,
                dataType: "jsonp",
                success: function (data) { result.html(data.html); }
            });

            return result;
        }
    });
})