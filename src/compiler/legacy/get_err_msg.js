var util     = require('util'),
    ErrCodes = require('./err_codes');

module.exports = function (err) {
    var msg = 'UNKNOWN_ERROR',
        m   = function () {
            msg = util.format.apply(this, arguments);
        };

    switch (err.type) {
        case ErrCodes.READ_FILE_FAILED:
            m(
                'Failed to read test file "%s."',
                err.filename
            );
            break;

        case ErrCodes.JAVASCRIPT_PARSING_FAILED:
            m(
                '(line %s): %s',
                err.parserErr && err.parserErr.line,
                err.parserErr && err.parserErr.message
            );
            break;

        case ErrCodes.AUTH_DIRECTIVE_REDEFINITION:
            m(
                '(line %s): @auth directive redefinition. @auth directive should be used once per test fixture file.',
                err.line
            );
            break;

        case ErrCodes.FIXTURE_DIRECTIVE_REDEFINITION:
            m(
                '(line %s): @fixture duplicated. The @fixture directive can only be used once per test fixture file.',
                err.line
            );
            break;

        case ErrCodes.PAGE_DIRECTIVE_REDEFINITION:
            m(
                '(line %s): @page duplicated. The @page directive can only be used once per test fixture file.',
                err.line
            );
            break;

        case ErrCodes.INVALID_NETWORK_AUTHENTICATION_CREDENTIALS_FORMAT:
            m('(line %s): Network authentication credentials have an incorrect format. Use the following format ' +
              'for the @auth directive: "@auth username:password".',
                err.line);
            break;

        case ErrCodes.REQUIRED_FILE_ALREADY_INCLUDED:
            m(
                '(line %s): The required file "%s" is already included.',
                err.line,
                err.req
            );
            break;

        case ErrCodes.MISPLACED_DIRECTIVE:
            m(
                '(line %s): Misplaced directive. Directives (@fixture, @page, etc.) should be declared ' +
                'in the global scope.',
                err.line
            );
            break;

        case ErrCodes.MISPLACED_TEST_DECLARATION:
            m(
                '(line %s): Misplaced test directive. Tests should be declared in the global scope.',
                err.line
            );
            break;


        case ErrCodes.DUPLICATE_TEST_NAME:
            m(
                '(line %s): Test with name "%s" already exists.',
                err.line,
                err.name
            );
            break;


        case ErrCodes.TEST_NAME_CHANGED_TO_ALREADY_USED:
            m(
                '(line %s): Test with name "%s" already exists.',
                err.testName
            );
            break;

        case ErrCodes.EMPTY_TEST_NAME:
            m(
                '(line %s): Test name is not specified.',
                err.line
            );
            break;


        case ErrCodes.INVALID_TEST_ASSIGNMENT:
            m(
                '(line %s): Invalid test assignment. A test should be an object.',
                err.line
            );
            break;


        case ErrCodes.ACTION_FUNC_IS_NOT_A_LAST_ENTRY:
            m(
                '(line %s): Action call is not the last statement in a step. Test steps ' +
                'should not contain statements that follow an action call.',
                err.line
            );
            break;

        case ErrCodes.TEST_STEP_IS_EMPTY:
            m(
                '(line %s): Test step doesn\'t contain any code.',
                err.line
            );
            break;

        case ErrCodes.INIFRAME_FUNCTION_SHOULD_ACCEPT_TWO_ARGS:
            m(
                '(line %s): inIFrame step modifier should accept 2 arguments.',
                err.line
            );
            break;

        case ErrCodes.FIXTURE_DIRECTIVE_IS_UNDEFINED:
            m(
                '%s: Fixture name is undefined. Test files should contain the @fixture directive.',
                err.filename
            );
            break;

        case ErrCodes.PAGE_DIRECTIVE_IS_UNDEFINED:
            m(
                '%s: Page URL is undefined. Test files should contain the @page directive.',
                err.filename
            );
            break;

        case ErrCodes.ASYNC_FUNC_CALL:
            m(
                '(line %s): Async function call. Tests should not call asynchronous functions. ' +
                'Use act.wait() instead.',
                err.line
            );
            break;

        case ErrCodes.ACTION_FUNC_CALL_IN_SHARED_CODE:
            m(
                '(line %s): Action call in shared code. Actions can be used within test steps only.',
                err.line
            );
            break;

        case ErrCodes.FAILED_LOAD_REQUIRE:
            m(
                '%s: Failed to load the required file "%s".',
                err.ownerFilename,
                err.filename
            );
            break;

        case ErrCodes.MODULE_NOT_FOUND:
            m(
                '(line %s): The required module "%s" does not exist.',
                err.line,
                err.moduleName
            );
            break;

        case ErrCodes.TEST_IS_EMPTY:
            m(
                '(line %s): Test doesn\'t contain any code.',
                err.line
            );
            break;

        case ErrCodes.WRITE_FILE_FAILED:
            m(
                'Failed to write test fixture code to "%s".',
                err.filename
            );
            break;

        case ErrCodes.INVALID_FILE_FORMAT:
            m(
                'Failed to perform the operation because the "%s" test fixture file is not valid.',
                err.filename
            );
            break;

        case ErrCodes.ELEMENT_SELECTOR_PARSING_FAILED:
            m(
                'Failed to generate test code due to a syntax error in an element selector: %s',
                err.parserErr && err.parserErr.message
            );
            break;

        case ErrCodes.ASSERTION_ARGUMENT_PARSING_FAILED:
            m(
                'Failed to generate test code due to a syntax error in an assertion argument: %s',
                err.parserErr && err.parserErr.message
            );
            break;

        case ErrCodes.TEST_IS_NOT_FOUND:
            m(
                'Test %s is not found in this fixture',
                err.testName
            );
            break;

        //Fixture code - mixins
        case ErrCodes.MISPLACED_MIXIN_DECLARATION:
            m(
                '(line %s): Misplaced mixin directive. Mixins should be declared in the global scope.',
                err.line
            );
            break;

        case ErrCodes.DUPLICATE_MIXIN_NAME:
            m(
                '(line %s): Mixin "%s" is already defined.',
                err.line,
                err.name
            );
            break;

        case ErrCodes.DUPLICATE_MIXIN_NAME_IN_REQUIRE:
            m(
                'Mixin "%s" defined in the "%s" and "%s" files.',
                err.name,
                err.defFilename1,
                err.defFilename2
            );
            break;

        case ErrCodes.EMPTY_MIXIN_NAME:
            m(
                '(line %s): Mixin name is not specified.',
                err.line
            );
            break;

        case ErrCodes.INVALID_MIXIN_ASSIGNMENT:
            m(
                '(line %s): Invalid mixin assignment. A mixin should be an object.',
                err.line
            );
            break;

        case ErrCodes.MIXIN_USED_IN_MIXIN:
            m(
                '(line %s): Mixin should not contain another mixin.',
                err.line
            );
            break;

        case ErrCodes.TEST_STEP_IS_NOT_A_FUNCTION_OR_MIXIN:
            m(
                '(line %s): Test step is not a function or mixin.',
                err.line
            );
            break;

        case ErrCodes.MIXIN_STEP_IS_NOT_A_FUNCTION:
            m(
                '(line %s): Mixin step is not a function.',
                err.line
            );
            break;

        case ErrCodes.UNDEFINED_MIXIN_USED:
            m(
                '(line %s): Mixin "%s" is undefined.',
                err.line,
                err.mixinName
            );
            break;

        case ErrCodes.MIXIN_STEP_IS_EMPTY:
            m(
                '(line %s): Mixin step doesn\'t contain any code.',
                err.line
            );
            break;

        case ErrCodes.MIXIN_IS_EMPTY:
            m(
                '(line %s): Mixin doesn\'t contain any code.',
                err.line
            );
            break;

        //Fixture code - test cases
        case ErrCodes.FAILED_TO_READ_EXTERNAL_TEST_CASES:
            m(
                'Failed to load file "%s" containing test cases.',
                err.testCasesPath
            );
            break;

        case ErrCodes.TEST_CASES_LIST_IS_NOT_ARRAY:
            m(
                '(line %s): The list of test cases should be an array.',
                err.line
            );
            break;

        case ErrCodes.TEST_CASES_LIST_IS_EMPTY:
            m(
                '(line %s): The list of test cases doesn\'t contain any items.',
                err.line
            );
            break;


        case ErrCodes.TEST_CASE_IS_NOT_AN_OBJECT :
            m(
                '(line %s): Test case should be an object.',
                err.line
            );
            break;

        case ErrCodes.TEST_CASE_DOESNT_CONTAIN_ANY_FIELDS :
            m(
                '(line %s): Test case doesn\'t contain any fields.',
                err.line
            );
            break;

        case ErrCodes.TEST_CASE_NAME_IS_NOT_A_STRING :
            m(
                '(line %s): Test case name is not a string.',
                err.line
            );
            break;


        case ErrCodes.DUPLICATE_TEST_CASE_NAME :
            m(
                '(line %s): Duplicated test case name "%s". A test case should have a unique name.',
                err.line,
                err.testCaseName
            );
            break;
    }

    return msg;
};
