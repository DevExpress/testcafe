'@fixture quarantine-mode';
'@page ./quarantine-mode/pages/page-failing-quarantine.html';

'@test'['Wait 200ms'] = {
    '1. Wait 200ms': function () {
        act.wait(200);
    }

};
