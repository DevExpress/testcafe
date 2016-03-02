'@fixture before-unload-dialog';
'@page ./index.html';


'@test'['The expected beforeUnload dialog - should pass'] = {
    '1.Click submit button "Enable..."': function () {
        act.click('#enableBeforeUnload');
    },

    '2.Click link "This page"': function () {
        handleBeforeUnload();
        act.click(':containsExcludeChildren(This page)');
    }
};

'@test'['An unexpected beforeUnload dialog - should fail'] = {
    '1.Click submit button "Enable..."': function () {
        act.click('#enableBeforeUnload');
    },

    '2.Click link "This page"': function () {
        act.click(':containsExcludeChildren(This page)');
    }
};

'@test'['No expected beforeUnload dialog - should fail'] = {
    '1.Click link "This page"': function () {
        handleBeforeUnload();
        act.click(':containsExcludeChildren(This page)');
    }
};
