import chalk from 'chalk';

export default {
    'span category': () => '',

    'span step-name': str => chalk.yellow(`"${str}"`),

    'code': str => chalk.yellow(str),

    'strong': str => chalk.cyan(str),

    'code step-source': str => chalk.yellow(str),

    'a': str => chalk.yellow(`"${str}"`)
};
