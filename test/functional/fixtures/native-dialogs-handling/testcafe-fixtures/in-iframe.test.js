'@fixture iframe page';
'@page ./cross-domain.html';


'@test'['Expected confirm after action in iframe - should pass'] = {
    '1.Click submit button "Dialogs"': inIFrame('#iframe', function () {
        handleConfirm(true);
        handleConfirm(false);
        act.click('#confirmBtn');
    }),

    '2.Assert': inIFrame('#iframe', function () {
        eq($('#confirmResult').text(), 'truefalse');
    })
};

'@test'['Unexpected confirm after action in iframe - should fail'] = {
    '1.Click submit button "Confirm"': inIFrame('#iframe', function () {
        act.click('#confirmBtn');
    })
};

'@test'['No expected confirm after action in iframe - should fail'] = {
    '1.Click submit button "Button"': inIFrame('#iframe', function () {
        handleConfirm(true);
        act.click('#simpleBtn');
    })
};

'@test'['Expected confirm after redirect in iframe - should pass'] = {
    '1.Click link "Confirm page"': inIFrame('#iframe', function () {
        handleConfirm(true);
        handleConfirm(false);
        act.click(':containsExcludeChildren(Confirm page)');
    }),

    '2.Assert': inIFrame('#iframe', function () {
        eq($('#result').text(), 'truefalse');
    })
};

'@test'['Unexpected confirm after redirect in iframe - should fail'] = {
    '1.Click link "Confirm page"': inIFrame('#iframe', function () {
        act.click(':containsExcludeChildren(Confirm page)');
    })
};

'@test'['No expected confirm after redirect in iframe - should fail'] = {
    '1.Click link "This page"': inIFrame('#iframe', function () {
        handleConfirm(true);
        act.click(':containsExcludeChildren(This page)');
    })
};
