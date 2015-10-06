import chalk from 'chalk';

export default {
    'span category': () => '',

    'span step-name': str => `"${str}"`,

    'span user-agent': str => chalk.gray(str),

    'code': str => chalk.yellow(str),

    'code step-source': str => chalk.magenta(str),

    'code api': str => chalk.yellow(str),

    'strong': str => chalk.cyan(str),

    'a': str => chalk.yellow(`"${str}"`)
};
