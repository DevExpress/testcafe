'@fixture Level1 child fixture1';
'@page ./index1';

'@require :root';
'@require :child';

'@test'['Test fixture'] = {
    'Some step' : function(){
        act.click();
    }
};
