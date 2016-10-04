'@fixture GH-16';
'@page ./index.html';


'@test'['Check stored data'] = {
    '1.Set data and reload iframe': inIFrame('#iframe', function () {
        this.data = 200;

        act.click('#replaceSrc');
    }),

    '2.Check data': function () {
        eq(this.data, 200);
    }
};
