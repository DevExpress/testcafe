/* global handleConfirm, handlePrompt, handleAlert */
'@fixture click';
'@page http://localhost:3000/legacy-fixtures/native-dialogs-handling/pages/index.html';

'@require ../../../../../../legacy-fixtures/upload/testcafe-fixtures/mixin.j';


'@test'['Native dialogs handling'] = {
    '1.Click submit button "Dialogs"': function () {
        handleConfirm(true);
        handleConfirm(false);
        handlePrompt('Pass');
        handleAlert();
        act.click('#dialogsBtn');
    },

    '2.Assert': function () {
        eq($('#confirmResult').text(), 'truefalse');
        eq($('#promptResult').text(), 'Pass');
    }
};
