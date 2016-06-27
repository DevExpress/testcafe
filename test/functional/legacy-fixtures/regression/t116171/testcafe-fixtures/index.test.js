'@fixture T116171';
'@page ./same-domain.html';


'@test'['T116171'] = {
    '1.Custom selector as an argument of jQuery': function () {
        act.click($(':containsExcludeChildren(black)'));
    },

    '2.Custom selector as an argument of the action': function () {
        act.click(':containsExcludeChildren(red)');
    },

    '3.Custom selector as an argument of jQuery in an iFrame': inIFrame(':containsExcludeChildren(iframe) iframe', function () {
        act.click($(':containsExcludeChildren(black)'));
    }),

    '4.Custom selector as an argument of the action in an iFrame': inIFrame($(':containsExcludeChildren(iframe) iframe'), function () {
        act.click(':containsExcludeChildren(red)');
    }),

    '5.Check result in the top frame': function () {
        eq(window.blackClick, 1);
        eq(window.redClick, 1);
    },

    '6.Check result in the iFrame': inIFrame($('#iframe'), function () {
        eq(window.blackClick, 1);
        eq(window.redClick, 1);
    })
};
