var shadowUI       = window.getTestCafeModule('hammerhead').shadowUI;
var testCafeRunner = window.getTestCafeModule('testCafeRunner');
var testCafeUI     = window.getTestCafeModule('testCafeUI');

var getElementFromPoint = testCafeRunner.get('./automation/get-element').fromPoint;


$(document).ready(function () {
    test('Should ignore shadow ui elements', function () {
        var shadowUIRoot = shadowUI.getRoot();
        var shadowUITop  = shadowUIRoot.offsetTop;
        var shadowUILeft = shadowUIRoot.offsetLeft;

        $('<div></div>')
            .width(100)
            .height(100)
            .css({
                zIndex:   2,
                position: 'absolute'
            })
            .appendTo(shadowUIRoot);

        var divId = 'div-id';
        var div   = $('<div></div>')
            .attr('id', divId)
            .width(100)
            .height(100)
            .css({
                top:      shadowUITop,
                left:     shadowUILeft,
                zIndex:   1,
                position: 'absolute'
            })
            .appendTo('body');

        var element = getElementFromPoint(shadowUITop + 50, shadowUILeft + 50);

        equal(element.id, divId);
    });
});
