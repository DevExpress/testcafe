'@fixture waiting element option';
'@page ./waiting-element-timeout/pages/index.html';

'@test'['Wait for element appearance before click'] = {
    '1. Click on button to raise start of element appearance': function () {
        act.click('#button1');
    },

    '2.Click on button': function () {
        act.click('#button2');
    }

};
