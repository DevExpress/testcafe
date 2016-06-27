'@fixture T174562';
'@page ./cross-domain.html';


'@test'['T174562'] = {
    '1.Click div2': inIFrame($('#iframe'), function () {
        act.click('#two');
    }),

    '2.Click inner div': inIFrame($('#iframe'), function () {
        act.click('#divIn');
    }),

    '3.Assert': inIFrame($('#iframe'), function () {
        ok(window.divClicked);
        ok($(window).scrollTop() > 0);
    })
};
