'@fixture T190110';
'@page ./first-page.html';


'@test'['T190110'] = {
    '1.Click link "Link"': function () {
        act.click('#link');
    },

    '2.Assert': function () {
        eq($('#pageName').text(), 'T190110 - second page');
    }
};
