'@fixture handler returns true';
'@page ./handler-returns-true.html';

'@test'['handler returns true test'] = {
    '1.Wait for error': function () {
        act.wait(0);
    }
};
