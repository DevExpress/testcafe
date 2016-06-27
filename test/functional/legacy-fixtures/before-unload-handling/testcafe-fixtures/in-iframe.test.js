'@fixture iframePage';
'@page ./cross-domain.html';


'@test'['Expected beforeUnload dialog in iframe - should pass'] = {
    '1.Click submit button "Enable..."': inIFrame('#iframe', function () {
        act.click('#enableBeforeUnload');
    }),

    '2.Click link "This page"': inIFrame('#iframe', function () {
        handleBeforeUnload();
        act.click(':containsExcludeChildren(This page)');
    })
};

'@test'['No expected beforeUnload dialog in iframe - should fail'] = {
    '1.Click link "This page"': inIFrame('#iframe', function () {
        handleBeforeUnload();
        act.click(':containsExcludeChildren(This page)');
    })
};

'@test'['Unexpected beforeUnload dialog in iframe - should fail'] = {
    '1.Click submit button "Enable..."': inIFrame('#iframe', function () {
        act.click('#enableBeforeUnload');
    }),

    '2.Click link "This page"': inIFrame('#iframe', function () {
        act.click(':containsExcludeChildren(This page)');
    })
};
