var testCafeUIRoot = window.getTestCafeModule('testCafeUI').get('./ui-root');

var $rootDiv      = null;
var $underRootDiv = null;

function getElementFromPointMethod (window) {
    var testCafeAutomation = window.getTestCafeModule('testCafeAutomation');

    return testCafeAutomation.get('./get-element').fromPoint;
}

function createRoot () {
    $rootDiv = $('<div></div>')
        .width(100)
        .height(100)
        .css({
            zIndex:   2,
            position: 'absolute'
        })
        .appendTo(testCafeUIRoot.element());
}

function createElementUnderRoot (parent, left, top) {
    $underRootDiv = $('<div></div>')
        .attr('id', 'div-id')
        .width(100)
        .height(100)
        .css({
            zIndex:   1,
            position: 'absolute',
            left:     left,
            top:      top
        })
        .appendTo(parent);
}

function createIFrame (onLoadHandler) {
    var iframeSrc = window.QUnitGlobals.getResourceUrl('../../data/runner/iframe.html');

    var $iframe = $('<iframe/>')
        .attr('src', iframeSrc)
        .css({
            width:  '600px',
            height: '600px'
        });

    $iframe.bind('load', onLoadHandler);
    $iframe.appendTo($('body'));

    return $iframe;
}

QUnit.testDone(function () {
    testCafeUIRoot.remove();
    $underRootDiv.remove();
});

$(document).ready(function () {
    asyncTest('Should ignore shadow ui elements', function () {
        createRoot();

        var shadowUITop  = testCafeUIRoot.element().offsetTop;
        var shadowUILeft = testCafeUIRoot.element().offsetLeft;

        createElementUnderRoot(document.body, shadowUILeft, shadowUITop);

        getElementFromPointMethod(window).call(window, shadowUITop + 50, shadowUILeft + 50)
            .then(function (res) {
                var element = res.element;

                equal(element.id, 'div-id');
                start();
            })
            .catch(function (err) {
                notOk(err);
                start();
            });
    });

    asyncTest('Should ignore shadow ui elements in iframe (gh-1029)', function () {
        var $iframe = null;

        createRoot();

        $rootDiv.css({
            top:    0,
            width:  '500px',
            height: '500px'
        });

        var onLoadHandler = function () {
            var iframeWindow = $iframe[0].contentWindow;

            $iframe.unbind('load', onLoadHandler);
            createElementUnderRoot(iframeWindow.document.body, 0, 0);

            window.setTimeout(function () {
                getElementFromPointMethod(iframeWindow).call(iframeWindow, 50, 50)
                    .then(function (res) {
                        var element = res.element;

                        $iframe.remove();
                        equal(element.id, 'div-id');
                        start();
                    })
                    .catch(function (err) {
                        notOk(err);
                        start();
                    });
            });
        };

        $iframe = createIFrame(onLoadHandler);
    });
});
