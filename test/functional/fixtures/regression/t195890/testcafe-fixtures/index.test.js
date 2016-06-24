'@fixture T195890';
'@page ./index.html';


'@test'['T195890'] = {
    '1.Click link "Download file"': function () {
        act.click('#download_link');
    },

    '2.Click body': function () {
        act.click('body');
    }
};
