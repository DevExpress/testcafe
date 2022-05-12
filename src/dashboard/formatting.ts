/* eslint-disable no-console */

import chalk from 'chalk';
import REPORTING_SYMBOLS from '../reporter/symbols';

export function info (message: string): void {
    console.log(`\n${message}`);
}

export function warning (message: string): void {
    console.log(`\n${chalk.yellowBright(message)}`);
}

export function error (message: string): void {
    console.log(chalk.redBright(`\n${REPORTING_SYMBOLS.err} ${message}`));
}

export function success (message: string): void {
    console.log(chalk.greenBright(`\n${REPORTING_SYMBOLS.ok} ${message}`));
}

