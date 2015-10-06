export default {
    'span category': () => '',

    'span step-name': str => `"${str}"`,

    'span user-agent': str => str,

    'code': str => str,

    'code step-source': str => str,

    'code api': str => str,

    'strong': str => str,

    'a': str => `"${str}"`
};
