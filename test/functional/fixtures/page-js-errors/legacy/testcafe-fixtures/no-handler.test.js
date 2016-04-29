'@fixture no handler';
'@page ./no-handler.html';

'@test'['no handler test'] = {
    '1.Wait for error': function () {
        act.wait(0);
    }
};
