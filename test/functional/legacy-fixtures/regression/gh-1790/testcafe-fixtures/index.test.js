'@fixture gh-1790';
'@page ./index.html';

'@test'['gh-1790'] = {
    '1.TypeText': function () {
        act.type('#input', 'text');
    }
};

