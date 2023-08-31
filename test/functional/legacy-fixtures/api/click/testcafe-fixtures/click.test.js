'@fixture click';
'@page ./index.html';


'@test'['Should fail if the first argument is invisible'] = {
    '1.Click on invisible element': function () {
        var $input = $('#input').css('visibility', 'hidden');

        act.click($input);
    },
};

'@test'['Should fail if the first argument is out of the visible area'] = {
    '1.Click on invisible element': function () {
        var $input = $('#input').css({
            position: 'absolute',
            left:     '-200px',
            top:      '-200px',
        });

        act.click($input);
    },
};
