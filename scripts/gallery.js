$(function() {
    function download(file) {
        window.location = file;
    }

    var galleryData = [{
        id: 1,
        title: "Install TestCafe",
        text: "You will need Node.js",
        image: "/testcafe/images/landing-page/gallery-install-testcafe.gif"
    }, {
        id: 2,
        title: "Write your first test",
        text: "You can use any text editor",
        image: "/testcafe/images/landing-page/gallery-test-code.png",
        download: "/testcafe/downloads/sample-test.zip"
    }, {
        id: 3,
        title: "Run the test on your computer",
        text: "Choose the browser, and launch the test with one command",
        image: "/testcafe/images/landing-page/gallery-run-test.gif"
    }, {
        id: 4,
        title: "View the reports",
        text: "You’ll see the line where the test has failed and a code snippet",
        image: "/testcafe/images/landing-page/gallery-test-run-report.png"
    }];

    var GALLERY_BROWSED_FLAG = "gallery-browsed";
    var TEST_SAMPLE_DOWNLOADED = "test-sample-downloaded";

    $("#main-gallery").dxGallery({
        dataSource: galleryData,
        width: 1030,
        showIndicator: false,
        showNavButtons: true,
        height: 720,
        onSelectionChanged: function (e) {
            
            
                if(!window.localStorage.getItem(GALLERY_BROWSED_FLAG)) {
                    ga('send', 'event', 'landingPage', 'galleryBrowsed');
                    window.localStorage.setItem(GALLERY_BROWSED_FLAG, true);
                }
            
            
        },
        itemTemplate: function (item, index) {
            var result = $("<div>"),
                topBlock = $("<div>").addClass("gallery-item-top"),
                topContentBlock = $("<div>").addClass("gallery-item-top-content");
            $("<div>")
                .addClass("gallery-item-number")
                .text(index + 1)
                .appendTo(topBlock);
            $("<h3>")
                .text(item.title)
                .appendTo(topContentBlock);
            $("<div>")
                .addClass("gallery-item-text")
                .text(item.text)
                .appendTo(topContentBlock);
            
            topContentBlock.appendTo(topBlock);
            topBlock.appendTo(result);

            $("<img>")
                .attr("src", item.image)
                .appendTo(result);
            
            if(item.download)
                $("<div>")
                    .addClass("download-button")    
                    .text('Download Test')
                    .click(function () {
                        
            
                        if(!window.localStorage.getItem(TEST_SAMPLE_DOWNLOADED)) {
                            ga('send', 'event', 'landingPage', 'testSampleDownloaded');
                            window.localStorage.setItem(TEST_SAMPLE_DOWNLOADED, true);
                        }
                    
                        

                        download(item.download);
                    })
                    .appendTo(result);

            return result;
        }
    });
})