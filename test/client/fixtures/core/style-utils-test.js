const testCafeCore = window.getTestCafeModule('testCafeCore');
const scrollUtils  = testCafeCore.scrollUtils;

test('hasScroll (GH-2511)', function () {
    const div      = document.createElement('div');
    const innerDiv = document.createElement('div');

    div.appendChild(innerDiv);
    innerDiv.setAttribute('style', 'border: 1px solid red; width: 100px; height: 60px;');
    document.body.appendChild(div);

    // Vertical scroll
    div.setAttribute('style', 'width: 200px; height: 20px; overflow-x: auto; border: 1px solid black;');
    ok(scrollUtils.hasScroll(div), 'vertical scroll');

    // Horizontal scroll
    div.setAttribute('style', 'width: 50px; height: 150px; overflow-y: auto; border: 1px solid black;');
    ok(scrollUtils.hasScroll(div), 'horizontal scroll');

    div.parentNode.removeChild(div);
});
