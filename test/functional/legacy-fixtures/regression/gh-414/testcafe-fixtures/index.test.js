'@fixture GH-414 index page';
'@page ./first-page.html';


'@test'['Click on the element after redirect - should pass'] = {
    '1.Click div "Click to show..."': function () {
        act.click('#div1');
    },

    '2.Click div "The third div"': function () {
        act.click('#div3');
    },

    '3.Assert': function () {
        eq($('#result').text(), 'div3 click');
    }
};

'@test'['Wait for element after redirect - should pass'] = {
    '1.Click div "Click to show..."': function () {
        act.click('#div1');
    },

    '2.Wait for the third div': function () {
        act.waitFor('#div3', 5000);
    },

    '3.Click div "The third div"': function () {
        act.click(document.getElementById('div3'));
    },

    '4.Assert': function () {
        eq($('#result').text(), 'div3 click');
    }
};

'@test'['Redirect before the target element appears - should fail'] = {
    '1.Click div "Click to show..."': function () {
        act.click('#div1');
    },

    '2.Click div "The second div"': function () {
        act.click('#div2');
    }
};
