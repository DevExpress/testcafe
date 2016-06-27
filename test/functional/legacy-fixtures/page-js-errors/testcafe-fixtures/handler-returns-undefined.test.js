'@fixture handler returns undefined';
'@page ./handler-returns-undefined.html';

'@test'['handler returns undefined test'] = {
    '1.Wait for error': function () {
        act.wait(0);
    }
};
