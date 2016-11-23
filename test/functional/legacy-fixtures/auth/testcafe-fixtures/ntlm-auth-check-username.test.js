'@fixture NTLM authentication';

'@page http://localhost:3003/';
'@auth username:password';

'@test'['Check the authenticated user name'] = {
    'Step 1': function () {
        var text        = $('#result')[0].innerText;
        var credentials = JSON.parse(text);

        eq(credentials.UserName, 'username');
    }
};
