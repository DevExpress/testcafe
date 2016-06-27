'@fixture before-unload-dialog';
'@page ./index.html';


'@test'['Expected beforeUnload dialog - should pass'] = {
    '1.Click submit button "Enable..."': function () {
        act.click('#enableBeforeUnload');
    },

    '2.Click link "This page"': function () {
        handleBeforeUnload();
        act.click(':containsExcludeChildren(This page)');
    }
};

'@test'['Unexpected beforeUnload dialog - should fail'] = {
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
