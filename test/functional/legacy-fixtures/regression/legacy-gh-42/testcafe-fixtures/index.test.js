'@fixture legacy-gh-42';
'@page ./index.html';


'@test'['Open/write in iframe without src'] = {
    '1.Check iframe': inIFrame('#iframe', function () {
        eq($('#label').text(), 'hello');
    })
};
