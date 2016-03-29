'@fixture index page';
'@page ./index.html';


'@test'['Expected dialogs after action - should pass'] = {
    '1.Click submit button "Dialogs"': function () {
        handleConfirm(true);
        handleConfirm(false);
        handlePrompt('Pass');
        handleAlert();
        act.click('#dialogsBtn');
    },

    '2.Assert': function () {
        eq($('#confirmResult').text(), 'truefalse');
        eq($('#promptResult').text(), 'Pass');
    }
};

'@test'['Unexpected confirm after action - should fail'] = {
    '1.Click submit button "Confirm"': function () {
        act.click('#confirmBtn');
    }
};

'@test'['No expected confirm after action - should fail'] = {
    '1.Click submit button "Button"': function () {
        handleConfirm(true);
        act.click('#simpleBtn');
    }
};

'@test'['Unexpected prompt after action - should fail'] = {
    '1.Click prompt button': function () {
        act.click('#promptBtn');
    }
};

'@test'['Unexpected alert after action - should fail'] = {
    '1.Click alert button': function () {
        act.click('#alertBtn');
    }
};

'@test'['No expected prompt after action - should fail'] = {
    '1.Click submit button "Button"': function () {
        handlePrompt();
        act.click('#simpleBtn');
    }
};

'@test'['No expected alert after action - should fail'] = {
    '1.Click submit button "Button"': function () {
        handleAlert();
        act.click('#simpleBtn');
    }
};

'@test'['Expected confirm after redirect - should pass'] = {
    '1.Click link "Confirm page"': function () {
        handleConfirm(true);
        handleConfirm(false);
        act.click(':containsExcludeChildren(Confirm page)');
    },

    '2.Assert': function () {
        eq($('#result').text(), 'truefalse');
    }
};

'@test'['Unexpected confirm after redirect - should fail']  = {
    '1.Click link "Confirm page"': function () {
        act.click(':containsExcludeChildren(Confirm page)');
    }
};

'@test'['No expected confirm after redirect - should fail'] = {
    '1.Click link "This page"': function () {
        handleConfirm(true);
        act.click(':containsExcludeChildren(This page)');
    }
};

'@test'['Unexpected alert after click on the link without redirect - should fail'] = {
    '1.Click alert button': function () {
        act.click('#fakeLink');
    }
};

'@test'['No expected second confirm - should fail'] = {
    '1.Click submit button "Confirm"': function () {
        handleConfirm(true);
        act.click('#confirmBtn');
    }
};
