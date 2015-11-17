import chalk from 'chalk';
import indentString from 'indent-string';

const CODE_ALIGN_SPACES = 4;

export default {
    'span category': () => '',

    'span step-name': str => `"${str}"`,

    'span user-agent': str => chalk.gray(str),

    'div screenshot-info': str => str,

    'a screenshot-path': str => chalk.underline(str),

    'code': str => chalk.yellow(str),

    'code step-source': str => chalk.magenta(indentString(str, ' ', CODE_ALIGN_SPACES)),

    'span code-line': str => `${str}\n`,

    'span last-code-line': str => str,

    'code api': str => chalk.yellow(str),

    'strong': str => chalk.cyan(str),

    'a': str => chalk.yellow(`"${str}"`)
};
