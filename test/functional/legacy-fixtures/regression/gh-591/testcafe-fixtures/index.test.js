'@fixture gh-519';
'@page ./index.html';


'@test'['Press ctrl+shift+g combination'] = {
    '1.Press ctrl+shift+g': function () {
        act.press('ctrl+shift+g');
    },

    '2.Check result': function () {
        ok(window.combinationPerformed);
    }
};
