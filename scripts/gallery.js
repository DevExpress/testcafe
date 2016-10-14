$(function () {
var gallery = [
        "images/minimal-report.png",
        "images/spec-report.png",
        "images/list-report.png",
        "images/xunit-report.png",
        "images/json-report.png"
];

var galleryWidget = $("#gallery").dxGallery({
    dataSource: gallery,
    height: "668px",
    loop: true,
    showNavButtons: true,
    showIndicator: true
}).dxGallery("instance");

});