'@fixture loaded';
'@page ./loaded.html';

'@test'['loaded test'] = {
    '1.Wait for error': function () {
        act.wait(0);
    }
};
