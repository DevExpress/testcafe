'@fixture quarantine-mode';
'@page ./page-failing-quarantine.html';

'@test'['Wait 200ms'] = {
    '1. Wait 200ms': function () {
        act.wait(200);
    }

};
