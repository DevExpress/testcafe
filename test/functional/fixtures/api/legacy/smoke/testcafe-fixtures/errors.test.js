'@fixture click';
'@page http://example.com';

'@test'['Click on non-exising element'] = {
    '1.Click on non-existing element': function () {
        const element = $('#heyheyhey')[0];

        act.click(element);
    }
};
