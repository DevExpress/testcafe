'@fixture click';
'@page http://example.com';

'@test'['Take a screenshot'] = {
    '1.Click on non-existing element': function () {
        act.screenshot();
    }
};


'@test'['Screenshot on test code error'] = {
    '1.Click on non-existing element': function () {
        throw new Error('STOP');
    }
};
