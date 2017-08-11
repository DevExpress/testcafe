'@fixture Fixture';
'@page http://pageNotExists';

'@test'['Unreachable page'] = {
    '1. Click body': function () {
        act.click('body');
    }
};
