const hammerhead         = window.getTestCafeModule('hammerhead');
const browserUtils       = hammerhead.utils.browser;
const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
const MoveAutomation     = testCafeAutomation.MoveAutomation;
const testCafeCore       = window.getTestCafeModule('testCafeCore');
const stringifyElement   = testCafeCore.stringifyElement;

function isInteger (num) {
    return (num ^ 0) === num;
}

asyncTest('MoveAutomation._getTargetClientPoint should return integer numbers (GH-7036)', function () {
    const automation = new MoveAutomation(document.documentElement, { x: 100, y: 100 }, { speed: 1 });

    const clientRect = document.documentElement.getBoundingClientRect();
    const newHeight  = Math.floor(clientRect.height * 10);

    document.documentElement.style.height = newHeight + 'px';
    window.pageYOffset                    = Math.floor(clientRect.height) + 0.4000015258789;

    return automation._getTargetClientPoint()
        .then(function (point) {
            document.documentElement.style.height = clientRect.height + 'px';
            window.pageYOffset                    = 0;

            ok(isInteger(point.y));
            start();
        });
});

test('Stringify element', function () {
    const emptyElement                   = $('<div />')[0];
    const elementWithChild               = $('<div><div></div></div>')[0];
    const elementWithShortText           = $('<div>Short</div>')[0];
    const elementWithLongText            = $('<div>Long text long</div>')[0];
    const elementWithChildAndText        = $('<div>With child<div></div></div>')[0];
    const elementWithNestedElementsAndBr = $('<div id="root"><div id="node1"><br></div><div id="node2"><div id="node3"><br></div><div id="node4"><br></div></div></div>')[0];

    equal(stringifyElement(null), '');
    equal(stringifyElement(emptyElement), '<div></div>');
    equal(stringifyElement(elementWithChild), '<div>...</div>');
    equal(stringifyElement(elementWithShortText), '<div>Short</div>');
    equal(stringifyElement(elementWithLongText), '<div>Long te...</div>');
    equal(stringifyElement(elementWithChildAndText), '<div>...</div>');
    equal(stringifyElement(elementWithNestedElementsAndBr), '<div id="root">...</div>');

    //NOTE: IE change an order of the id and class
    if (!browserUtils.isIE) {
        const elementWithAttributes = $('<div id="element-id" class="element-class" data-property="element-data"/>')[0];

        equal(stringifyElement(elementWithAttributes), '<div id="element-id" class="element-class" data-property="element-data"></div>');
    }
});
