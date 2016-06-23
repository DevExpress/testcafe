'@fixture waiting element option';
'@page ./selector-timeout/pages/index.html';

'@test'['Wait for element with insufficient timeout'] = {
    '1. Click on button to raise start of element appearance': function () {
        act.click('#button2');
    },

    '2.Click on button': function () {
        act.click('#button');
    }

};
