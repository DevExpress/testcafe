import chalk from 'chalk';

export default {
    'span category': () => '',

    'span step-name': str => chalk.yellow(`"${str}"`),

    'code': str => chalk.yellow(str),

    'code step-source': str => chalk.yellow(str),

    'code api': str => chalk.underline(str),

    'strong': str => chalk.cyan(str),

    'a': str => chalk.yellow(`"${str}"`)
};
