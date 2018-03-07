/* global handleConfirm, handlePrompt, handleAlert, handleBeforeUnload */
'@fixture click';
'@page http://example.com';

'@require ../../../../../legacy-fixtures/upload/testcafe-fixtures/mixin.js';

'@test'['Native dialogs handling'] = {
    '0.Load test page': function () {
        act.navigateTo('http://localhost:3000/legacy-fixtures/native-dialogs-handling/pages/index.html');
    },

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

'@test'['Beforeunload handling'] = {
    '0.Load test page': function () {
        act.navigateTo('http://localhost:3000/legacy-fixtures/before-unload-handling/pages/cross-domain.html');
    },

    '1.Click submit button "Enable..."': inIFrame('#iframe', function () {
        act.click('#enableBeforeUnload');
    }),

    '2.Click link "This page"': inIFrame('#iframe', function () {
        handleBeforeUnload();
        act.click(':containsExcludeChildren(This page)');
    })
};

'@test'['Upload a file'] = {
    '0.Load test page': function () {
        act.navigateTo('http://localhost:3000/legacy-fixtures/upload/pages/index.html');
    },

    '1.Upload text1.txt': function () {
        var file = '../../../../../legacy-fixtures/upload/testcafe-fixtures/files/text1.txt';

        act.upload('#fileInput', file);
    },

    '2.Submit files': function () {
        act.click('#submitBtn');
    },

    '3. Check text1 upload': '@mixin Check text1.txt upload'
};

'@test'['Preventing real actions'] = {
    '0.Load test page': function () {
        act.navigateTo('http://localhost:3000/legacy-fixtures/regression/prevent-real-action/pages/same-domain.html');
    },

    '1.Wait for element': function () {
        act.wait(5000, function () {
            return $('#input', $('#iframe').contents()).length;
        });
    },

    '2.Type in input': function () {
        var input = $('#input', $('#iframe').contents());

        act.type(input, 'Hello, world!');
    },

    '3.Perform native click': inIFrame('#iframe', function () {
        // NOTE: We simulate a click performed by a user during TestCafe test execution. If TestCafe
        // doesn't prevent a click, test will fail with an unexpected alert dialog error.
        window['%hammerhead%'].nativeMethods.click.call(document.getElementById('alertDiv'));
    })
};
