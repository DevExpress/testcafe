'@fixture GH-414 iframe page';
'@page ./cross-domain.html';


'@test'['Wait in iframe for element after redirect in iframe - should pass'] = {
    '1.Click div "Click to show..."': inIFrame('#iframe', function () {
        act.click('#div1');
    }),

    '2.Wait for the third div': inIFrame('#iframe', function () {
        act.waitFor('#div3', 5000);
    }),

    '3.Click div "The third div"': inIFrame('#iframe', function () {
        act.click(document.getElementById('div3'));
    }),

    '4.Assert': inIFrame('#iframe', function () {
        eq($('#result').text(), 'div3 click');
    })
};
