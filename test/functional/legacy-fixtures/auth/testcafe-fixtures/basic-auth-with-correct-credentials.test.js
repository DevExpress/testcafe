'@fixture Basic authentication - correct credentials';

'@page http://localhost:3002/';
'@auth username:password';


'@test'['Authenticate with correct credintials'] = {
    'Step 1': function () {
        eq($('#result')[0].innerText, 'authorized');
    }
};
