'@fixture iframePage';
'@page ./cross-domain.html';


'@test'['Expected beforeUnload dialog in iframe - should pass'] = {
    '1.Click submit button "Enable..."': inIFrame('#iframe', function () {
        act.click('#enableBeforeUnload');
    }),

    '2.Click the reload button': inIFrame('#iframe', function () {
        act.click('#reload');
    }),

    '3.Wait for a dialog': inIFrame('#iframe', function () {
        handleBeforeUnload();
        act.wait(60000);
    })
};

'@test'['No expected beforeUnload dialog in iframe - should fail'] = {
    '1.Click reload button': inIFrame('#iframe', function () {
        act.click('#reload');
    }),

    '2.Wait for a dialog': inIFrame('#iframe', function () {
        handleBeforeUnload();
        act.wait(30000);
    })
};

'@test'['Unexpected beforeUnload dialog in iframe - should fail'] = {
    '1.Click submit button "Enable..."': inIFrame('#iframe', function () {
        act.click('#enableBeforeUnload');
    }),

    '2.Click the reload button': inIFrame('#iframe', function () {
        act.click(':containsExcludeChildren(This page)');
    }),

    '3.Wait for a dialog': inIFrame('#iframe', function () {
        act.wait(30000);
    })
};
