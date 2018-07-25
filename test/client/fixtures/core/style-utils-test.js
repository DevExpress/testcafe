var testCafeCore = window.getTestCafeModule('testCafeCore');
var styleUtils   = testCafeCore.get('./utils/style');

test('hasScroll (GH-2511)', function () {
    var div      = document.createElement('div');
    var innerDiv = document.createElement('div');

    div.appendChild(innerDiv);
    innerDiv.setAttribute('style', 'border: 1px solid red; width: 100px; height: 60px;');
    document.body.appendChild(div);

    // Vertical scroll
    div.setAttribute('style', 'width: 200px; height: 20px; overflow-x: auto; border: 1px solid black;');
    ok(styleUtils.hasScroll(div));

    // Horizontal scroll
    div.setAttribute('style', 'width: 50px; height: 150px; overflow-y: auto; border: 1px solid black;');
    ok(styleUtils.hasScroll(div));

    div.parentNode.removeChild(div);
});
