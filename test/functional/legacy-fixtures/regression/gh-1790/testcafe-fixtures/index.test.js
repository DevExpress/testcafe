'@fixture gh-1790';
'@page ./index.html';

'@test'['gh-1790'] = {
    '1.Type text': function () {
        act.type('#input', 'text');
    }
};

