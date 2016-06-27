'@fixture confirm page';
'@page ./confirm.html';


'@test'['Native dialogs on page load'] = {
    '1.Assert': function () {
        eq($('#result').text(), '');
    }
};
