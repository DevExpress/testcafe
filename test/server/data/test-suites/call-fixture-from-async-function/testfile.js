fixture('fixture 1');

new Promise((resolve, reject) => {
    fixture('fixture 2');

    test('test 2');

    resolve();
});

setTimeout(function () {
    fixture('fixture 3');

    test('test 3');
}, 1);

setInterval(function () {
    fixture('fixture 4');

    test('test 4');
}, 1);

async function fnName () {
    fixture('fixture 5');

    test('test 5');
}

function* generator () {
    yield 1;

    fixture('fixture 6');
    test('test 6');

    yield 2;
}

test('test 1');
