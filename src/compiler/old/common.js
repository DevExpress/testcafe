exports.DIRECTIVE_EXPRESSION_AST_PATH = [
    'toplevel',
    'stat'
];

exports.TEST_AND_MIXIN_DECLARATION_AST_PATH = [
    'toplevel',
    'stat',
    ['assign', true],
    'sub'
];

exports.ACTION_FUNC_AST_PATH = [
    'function',
    'stat'
];

exports.RELATIVE_URL_PATTERN = /^\/|^\.|^\.\./;
exports.DIRECTIVE_EXPRESSION_PATTERN = /^\s*@(\S+)\s+(.+)$/;
exports.SUPPORTED_PROTOCOL_PATTERN = /^(http|https):\/\//;

exports.AUTH_DIRECTIVE_LVALUE = 'auth';
exports.FIXTURE_DIRECTIVE_LVALUE = 'fixture';
exports.PAGE_DIRECTIVE_LVALUE = 'page';
exports.REQUIRE_DIRECTIVE_LVALUE = 'require';
exports.MIXIN_INSERTION_POINT_DIRECTIVE_LVALUE = 'mixin';

exports.DIRECTIVE_LVALUES = [
    exports.AUTH_DIRECTIVE_LVALUE,
    exports.FIXTURE_DIRECTIVE_LVALUE,
    exports.PAGE_DIRECTIVE_LVALUE,
    exports.REQUIRE_DIRECTIVE_LVALUE
];

exports.ACTION_OR_ASSERTION_FOOTPRINT_REGEXP = /(^|[^\w])(((ok|notOk|eq|notEq)\s*\()|(act\s*(\.|\[)))/;
exports.MIXIN_FOOTPRINT_REGEXP = /('|")(@mixin)/;

exports.TEST_MIXIN_STEP_NAME_SEPARATOR = ' | ';
exports.AUTH_CREDENTIALS_REGEXP = /^(.*?):(.*)$/;

exports.MODULE_PREFIX = ':';

exports.TEST_DECLARATION_MARKER = '@test';
exports.MIXIN_DECLARATION_MARKER = '@mixin';

exports.TEST_CASES_DIRECTIVE = '@testCases';
exports.TEST_CASE_NAME_FIELD = '@name';
exports.TEST_CASE_INIT_STEP_NAME = '-INIT TEST CASE-';
exports.TEST_CASE_NAME_SEPARATOR = '   \u2192   ';
exports.TEST_CASE_DEFAULT_NAME_PATTERN = 'Test case at index %s';

exports.AUTH_DIRECTIVE_PATTERN = '"@auth %s"';
exports.FIXTURE_DIRECTIVE_PATTERN = '"@fixture %s"';
exports.PAGE_DIRECTIVE_PATTERN = '"@page %s"';
exports.NEW_FIXTURE_CODE_PATTERN = exports.FIXTURE_DIRECTIVE_PATTERN + ';\n' + exports.PAGE_DIRECTIVE_PATTERN + ';\n\n';

exports.ACTIONS_OWNER_OBJECT_IDENTIFIER = 'act';
exports.NATIVE_DIALOG_HANDLE_IDENTIFIER_PREFIX = 'handle';
exports.SOURCE_INDEX_ARG_PREFIX = '#';

exports.createErrorObj = function (type, filename, line, additionalFields) {
    var err = additionalFields || {};

    err.type = type;
    err.filename = filename;

    if (line)
        err.line = line;

    return err;
};
