/* global handleBeforeUnload */
'@fixture click';
'@page http://localhost:3000/legacy-fixtures/before-unload-handling/pages/cross-domain.html';

'@require ../../../../../../legacy-fixtures/upload/testcafe-fixtures/mixin.js';

'@test'['Beforeunload handling'] = {
    '1.Click submit button "Enable..."': inIFrame('#iframe', function () {
        act.click('#enableBeforeUnload');
    }),

    '2.Click link "This page"': inIFrame('#iframe', function () {
        handleBeforeUnload();
        act.click(':containsExcludeChildren(This page)');
    })
};
