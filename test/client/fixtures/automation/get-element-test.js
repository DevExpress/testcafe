const testCafeUIRoot = window.getTestCafeModule('testCafeUI').uiRoot;

let $rootDiv      = null;
let $underRootDiv = null;
let $iframe       = null;

function getElementFromPointMethod (window, point) {
    const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');

    return testCafeAutomation.getElementFromPoint(point);
}

function createRoot () {
    $rootDiv = $('<div></div>')
        .width(100)
        .height(100)
        .css({
            zIndex:   2,
            position: 'absolute',
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
            top:      top,
        })
        .appendTo(parent);
}

function createIFrame (onLoadHandler) {
    const iframeSrc = window.QUnitGlobals.getResourceUrl('../../data/runner/iframe.html');

    $iframe = $('<iframe/>')
        .attr('src', iframeSrc)
        .css({
            width:  '600px',
            height: '600px',
        });

    $iframe.bind('load', onLoadHandler);
    $iframe.appendTo($('body'));
}

QUnit.testDone(function () {
    testCafeUIRoot.remove();
    $underRootDiv.remove();

    if ($iframe)
        $iframe.remove();
});

$(document).ready(function () {
    asyncTest('Should ignore shadow ui elements', function () {
        createRoot();

        const shadowUITop  = testCafeUIRoot.element().offsetTop;
        const shadowUILeft = testCafeUIRoot.element().offsetLeft;

        createElementUnderRoot(document.body, shadowUILeft, shadowUITop);

        getElementFromPointMethod(window, { x: shadowUITop + 50, y: shadowUILeft + 50 })
            .then(function (element) {
                equal(element.id, 'div-id');
                start();
            })
            .catch(function (err) {
                notOk(err);
                start();
            });
    });

    asyncTest('Should ignore shadow ui elements in iframe (gh-1029)', function () {
        createRoot();

        $rootDiv.css({
            top:    0,
            width:  '500px',
            height: '500px',
        });

        const onLoadHandler = function () {
            const iframeWindow = $iframe[0].contentWindow;

            $iframe.unbind('load', onLoadHandler);
            createElementUnderRoot(iframeWindow.document.body, 0, 0);

            window.setTimeout(function () {
                getElementFromPointMethod(iframeWindow, { x: 50, y: 50 })
                    .then(function (element) {
                        equal(element.id, 'div-id');
                        start();
                    })
                    .catch(function (err) {
                        notOk(err);
                        start();
                    });
            });
        };

        createIFrame(onLoadHandler);
    });
});
