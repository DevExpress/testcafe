const testCafeAutomation = window.getTestCafeModule('testCafeAutomation');
const MoveAutomation     = testCafeAutomation.MoveAutomation;

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
