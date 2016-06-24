'@fixture T171129';
'@page ./cross-domain.html';


'@test'['T171129'] = {
    '1.Click div1': function () {
        act.click('#div1');
    },

    '2.Click div2': function () {
        act.click('#div2');
    }
};
