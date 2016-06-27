var isTextPresentOnPage = function (text) {
    var elements = document
        .getElementById('uploadedContent')
        .getElementsByTagName('p');

    for (var i = 0; i < elements.length; i++) {
        if (elements[i].textContent === text)
            return true;
    }

    return false;
};


'@mixin'['Check text1.txt upload'] = {
    'Check text1 on the page': function () {
        ok(isTextPresentOnPage('London is the capital of Great Britain'));
    }
};

'@mixin'['Check text2.txt upload'] = {
    'Check text2 on the page': function () {
        ok(isTextPresentOnPage('The city is very old and beautiful.'));
    }
};

'@mixin'['Check empty upload'] = {
    'Check missing text1 and text2 on the page': function () {
        ok(!isTextPresentOnPage('London is the capital of Great Britain'));
        ok(!isTextPresentOnPage('The city is very old and beautiful.'));
    }
};
