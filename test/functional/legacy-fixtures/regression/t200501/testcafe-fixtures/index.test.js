'@fixture T200501';
'@page ./index.html';


'@test'['T200501'] = {
    '1.Wait with mixed up parameters': function () {
        act.wait(function () {
            return false;
        }, 500);
    }
};
