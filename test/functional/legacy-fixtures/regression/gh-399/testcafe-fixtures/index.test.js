'@fixture gh-399';
'@page ./index.html';

'@test'['Remove iframe after an action'] = {
    '1.Click html': inIFrame('#iframe', function () {
        act.click('#button1');
    }),

    '2.Assert': function () {
        notOk($('#iframe').length > 0);
    }
};

'@test'['Remove container iframe after an action (gh-433)'] = {
    '1.Click html': inIFrame('#iframe', function () {
        act.click('#button2');
    }),

    '2.Assert': function () {
        notOk($('#iframe').length > 0);
    }
};
