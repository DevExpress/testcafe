'@fixture gh-399';
'@page ./index.html';

'@test'['Remove iframe after an action'] = {
    '1.Click html': inIFrame('#iframe', function () {
        act.click('body');
    }),

    '2.Assert': function () {
        notOk($('#iframe').length > 0);
    }
};
