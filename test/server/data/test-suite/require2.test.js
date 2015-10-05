'@fixture Require 2 fixture';
'@page ./index';

'@require :single';

'@test'['Require 2 test'] = {
    'Some step': function () {
        act.click();
    }
};
