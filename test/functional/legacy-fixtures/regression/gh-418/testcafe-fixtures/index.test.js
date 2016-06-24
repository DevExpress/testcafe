'@fixture GH-418 iframe page';
'@page ./cross-domain.html';


'@test'['Click on the element in iframe after redirect occurs in the iframe - should pass'] = {
    '1.Click div "Click to show..."': inIFrame('#iframe', function () {
        act.click('#div');
    }),

    '2.Click div "The third div"': inIFrame('#iframe', function () {
        act.click('#div2');
    }),

    '3.Assert': inIFrame('#iframe', function () {
        eq($('#result').text(), 'div2 click');
    })
};
