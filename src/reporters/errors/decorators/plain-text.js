import indentString from 'indent-string';

const CODE_ALIGN_SPACES = 4;

export default {
    'span category': () => '',

    'span step-name': str => `"${str}"`,

    'span user-agent': str => str,

    'code': str => str,

    'code step-source': str => indentString(str, ' ', CODE_ALIGN_SPACES),

    'span code-line': str => `${str}\n`,

    'span last-code-line': str => str,

    'code api': str => str,

    'strong': str => str,

    'a': str => `"${str}"`
};
