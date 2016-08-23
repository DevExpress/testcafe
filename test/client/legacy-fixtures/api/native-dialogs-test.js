var testCafeLegacyRunner = window.getTestCafeModule('testCafeLegacyRunner');
var dialogsAPI           = testCafeLegacyRunner.get('./api/native-dialogs');


var unexpectedDialogErrors     = [];
var wasNotExpectedDialogErrors = [];
var dialogsInfoChangedEvents   = [];

QUnit.testStart(function () {
    unexpectedDialogErrors     = [];
    wasNotExpectedDialogErrors = [];
    dialogsInfoChangedEvents   = [];
});

function createDefaultDialogsInfo () {
    return {
        expectAlertCount:           0,
        expectConfirmCount:         0,
        expectPromptCount:          0,
        expectedConfirmRetValues:   [],
        expectedPromptRetValues:    [],
        expectBeforeUnload:         false,
        alerts:                     [],
        confirms:                   [],
        prompts:                    [],
        beforeUnloadDialogAppeared: false
    };
}

dialogsAPI.on(dialogsAPI.UNEXPECTED_DIALOG_ERROR_EVENT, function (e) {
    unexpectedDialogErrors.push(e);
});

dialogsAPI.on(dialogsAPI.WAS_NOT_EXPECTED_DIALOG_ERROR_EVENT, function (e) {
    wasNotExpectedDialogErrors.push(e);
});

dialogsAPI.on(dialogsAPI.DIALOGS_INFO_CHANGED_EVENT, function (e) {
    dialogsInfoChangedEvents.push(e.info);
});

/*eslint-disable no-alert*/
test('Dialogs info changed event (init without info)', function () {
    dialogsAPI.init();

    equal(dialogsInfoChangedEvents.length, 0);

    dialogsAPI.resetHandlers();
    equal(dialogsInfoChangedEvents.length, 1);
    deepEqual(dialogsInfoChangedEvents[0], createDefaultDialogsInfo());
});

test('Dialogs info changed event (init with info)', function () {
    var info = createDefaultDialogsInfo();

    info.expectAlertCount = 1;

    dialogsAPI.init(info);

    equal(dialogsInfoChangedEvents.length, 0);

    dialogsAPI.resetHandlers();
    equal(dialogsInfoChangedEvents.length, 1);
    deepEqual(dialogsInfoChangedEvents[0], createDefaultDialogsInfo());
});

test('Unexpected dialog errors', function () {
    dialogsAPI.init();

    window.alert();
    ok(typeof window.confirm() === 'undefined');
    ok(typeof window.prompt() === 'undefined');

    equal(unexpectedDialogErrors.length, 3);
});

test('Init with expected dialogs', function () {
    var info = createDefaultDialogsInfo();

    info.expectAlertCount         = 1;
    info.expectConfirmCount       = 2;
    info.expectPromptCount        = 2;
    info.expectedConfirmRetValues = [true, false];
    info.expectedPromptRetValues  = ['1', '2'];

    dialogsAPI.init($.extend({}, info));

    window.alert('Alert message');
    ok(window.confirm('Confirm message 1'));
    ok(!window.confirm('Confirm message 2'));
    equal(window.prompt('Prompt message 1'), '1');
    equal(window.prompt('Prompt message 2'), '2');

    dialogsAPI.checkExpectedDialogs();

    equal(unexpectedDialogErrors.length, 0);
    equal(wasNotExpectedDialogErrors.length, 0);
    equal(dialogsInfoChangedEvents.length, 5);

    info.alerts   = ['Alert message'];
    info.confirms = ['Confirm message 1', 'Confirm message 2'];
    info.prompts  = ['Prompt message 1', 'Prompt message 2'];

    deepEqual(dialogsInfoChangedEvents[4], info);
});

test('Handle dialogs', function () {
    var info = createDefaultDialogsInfo();

    dialogsAPI.init();

    dialogsAPI.handleAlert();
    dialogsAPI.handleConfirm(true);
    dialogsAPI.handleConfirm(false);
    dialogsAPI.handlePrompt('1');
    dialogsAPI.handlePrompt('2');

    window.alert('Alert message');
    ok(window.confirm('Confirm message 1'));
    ok(!window.confirm('Confirm message 2'));
    equal(window.prompt('Prompt message 1'), '1');
    equal(window.prompt('Prompt message 2'), '2');

    dialogsAPI.checkExpectedDialogs();

    equal(unexpectedDialogErrors.length, 0);
    equal(wasNotExpectedDialogErrors.length, 0);
    equal(dialogsInfoChangedEvents.length, 10);

    info.expectAlertCount         = 1;
    info.expectConfirmCount       = 2;
    info.expectPromptCount        = 2;
    info.expectedConfirmRetValues = [true, false];
    info.expectedPromptRetValues  = ['1', '2'];
    info.alerts                   = ['Alert message'];
    info.confirms                 = ['Confirm message 1', 'Confirm message 2'];
    info.prompts                  = ['Prompt message 1', 'Prompt message 2'];

    deepEqual(dialogsInfoChangedEvents[4], info);
});

test('Unexpected dialog error when there are several dialogs', function () {
    var info = createDefaultDialogsInfo();

    info.expectAlertCount = 1;

    dialogsAPI.init(info);

    window.alert();
    window.alert();

    equal(unexpectedDialogErrors.length, 1);

    dialogsAPI.checkExpectedDialogs();

    equal(unexpectedDialogErrors.length, 2);
    equal(wasNotExpectedDialogErrors.length, 0);
});

test('Was not expected dialog error', function () {
    var info = createDefaultDialogsInfo();

    info.expectAlertCount   = 1;
    info.expectConfirmCount = 1;
    info.expectPromptCount  = 1;

    dialogsAPI.init(info);

    dialogsAPI.checkExpectedDialogs();

    equal(wasNotExpectedDialogErrors.length, 3);
    equal(wasNotExpectedDialogErrors[0].dialog, 'alert');
    equal(wasNotExpectedDialogErrors[1].dialog, 'confirm');
    equal(wasNotExpectedDialogErrors[2].dialog, 'prompt');
});

test('Reset handlers', function () {
    var info = createDefaultDialogsInfo();

    info.expectAlertCount = 1;

    dialogsAPI.init(info);
    window.alert();

    equal(unexpectedDialogErrors.length, 0);
    equal(wasNotExpectedDialogErrors.length, 0);

    dialogsAPI.checkExpectedDialogs();
    dialogsAPI.resetHandlers();
    window.alert();

    equal(unexpectedDialogErrors.length, 1);
    equal(wasNotExpectedDialogErrors.length, 0);
});

test('Check unexpected dialogs', function () {
    dialogsAPI.init();

    window.alert('Alert message');
    window.confirm('Confirm message');
    window.prompt('Prompt message');

    equal(unexpectedDialogErrors.length, 3);
    unexpectedDialogErrors = [];

    dialogsAPI.checkExpectedDialogs();
    equal(unexpectedDialogErrors.length, 3);
    equal(unexpectedDialogErrors[0].message, 'Alert message');
    equal(unexpectedDialogErrors[1].message, 'Confirm message');
    equal(unexpectedDialogErrors[2].message, 'Prompt message');
});
/*eslint-enable no-alert*/
