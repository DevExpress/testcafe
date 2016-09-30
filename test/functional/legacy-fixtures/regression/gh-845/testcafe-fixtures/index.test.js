'@fixture gh-845';
'@page ./index.html';


'@test'['Click on a download link'] = {
    '1.Click': function () {
        act.click('#link');
    }
};

'@test'['Click on a download link in iframe'] = {
    '1.Click': inIFrame('#iframe', function () {
        act.click('#link');
    })
};

