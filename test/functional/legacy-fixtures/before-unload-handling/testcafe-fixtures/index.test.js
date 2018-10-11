'@fixture before-unload-dialog';
'@page ./index.html';


'@test'['Expected beforeUnload dialog - should pass'] = {
    '1.Click submit button "Enable..."': function () {
        act.click('#enableBeforeUnload');
    },

    '2.Click the reload button': function () {
        act.click('#reload');
    },

    '3.Wait for a dialog': function () {
        handleBeforeUnload();
        act.wait(30000);
    }
};

'@test'['Unexpected beforeUnload dialog - should fail'] = {
    '1.Click submit button "Enable..."': function () {
        act.click('#enableBeforeUnload');
    },

    '2.Click the reload button': function () {
        act.click('#reload');
    },

    '3.Wait for a dialog': function () {
        act.wait(30000);
    }
};

'@test'['No expected beforeUnload dialog - should fail'] = {
    '1.Click the reload button': function () {
        act.click('#reload');
    },

    '2.Wait for a dialog': function () {
        handleBeforeUnload();
        act.wait(30000);
    }
};
