'@fixture T212974';
'@page ./index.html';


'@test'['T212974'] = {
    '1.Click div "target element"': function () {
        act.click('#targetElement');
    },

    '2.Assert': function () {
        eq($('#elementFromPoint').text(), $('#targetElement').attr('id'));
    }
};
