(function () {
    var Const = {};

    Const.IFRAME_WATCH_PROPERTY = 'tc_iwp_cf65bc15';
    Const.OLD_ATTR_VALUES = 'tc-1b082-oldAttrValues';
    Const.UPLOADED_FILES_PATH = './uploads/';
    Const.PROPERTY_PREFIX = "tc-1b082a6cec-51966-";
    Const.ACTION_FUNC_NAMES = [
        'click',
        'rclick',
        'dblclick',
        'drag',
        'type',
        'wait',
        'waitFor',
        'hover',
        'press',
        'select',
        'navigateTo',
        'upload',
        'screenshot'
    ];

    Const.ASSERTION_FUNC_NAMES = [
        'ok', 'notOk', 'eq', 'notEq'
    ];

    if (typeof module !== 'undefined' && module.exports)
        module.exports = Const;
    else {
        TestCafeClient.define('Shared.Const', function () {
            this.exports = Const;
        });
    }
})();