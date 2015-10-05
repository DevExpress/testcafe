'@fixture Require 1 fixture';
'@page ./index';

'@require :single';

'@test'['Require 1 test'] = {
    'Some step' : function(){
        act.click();
    }
};
