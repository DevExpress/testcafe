const ACTUAL_MSG_PREFIX          = 'Actual:   ';
const actualMsgLengthPlaceholder = ACTUAL_MSG_PREFIX.replace(/./g, ' ');

var cutNewLines = function (code) {
    return typeof code === 'string' ? code.replace(/(\r\n|\n|\r)/gm, '\\n') : code;
};

var transforms = [
    {
        tag:      'step-name',
        replacer: '"$1"'
    },
    {
        tag:      'link',
        replacer: '$1'
    },
    {
        tag:      'diff-marker',
        replacer: actualMsgLengthPlaceholder + '$1'
    },
    {
        tag:      'diff-index',
        replacer: ''
    },
    {
        tag:      'err-type',
        replacer: ''
    },
    {
        tag:      'js',
        replacer: '$1'
    },
    {
        tag:      'related-code',
        replacer: function (matchStr, submatch) {
            return cutNewLines(submatch);
        }
    },
    {
        tag:      'expected',
        replacer: function (matchStr, submatch) {
            return 'Expected: ' + cutNewLines(submatch);
        }
    },
    {
        tag:      'actual',
        replacer: function (matchStr, submatch) {
            return 'Actual:   ' + cutNewLines(submatch);
        }
    },
    {
        //NOTE: cut empty lines
        pattern:  /\n\n/g,
        replacer: '\n'
    }
];

var getReFromTagName = function (tag) {
    return new RegExp('<' + tag + '>([\\s\\S]*?)<\\/' + tag + '>', 'igm');
};

exports.formatPlainText = function (str) {
    transforms.forEach((transform) => {
        var pattern = transform.pattern || getReFromTagName(transform.tag);

        str = str.replace(pattern, transform.replacer);
    });

    return str;
};
