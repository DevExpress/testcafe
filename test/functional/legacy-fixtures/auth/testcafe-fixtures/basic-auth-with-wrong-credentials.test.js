'@fixture Basic authentication - wrong credentials';

'@page http://localhost:3002/';
'@auth ivalid:ivalid';


'@test'['Authenticate with wrong credentials'] = {
    'Step 1': function () {
        eq($('#result')[0].innerText, 'not authorized');
    }
};
