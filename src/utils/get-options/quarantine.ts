import baseGetOptions from './base';
import QUARANTINE_OPTION_NAMES from '../../configuration/quarantine-option-names';
import { RUNTIME_ERRORS } from '../../errors/types';
import { GeneralError } from '../../errors/runtime';
import { Dictionary } from '../../configuration/interfaces';
import TestRunErrorFormattableAdapter from '../../errors/test-run/formattable-adapter';

const DEFAULT_ATTEMPT_LIMIT = 5;
const DEFAULT_THRESHOLD     = 3;

function _isQuarantineOption (option: string): option is QUARANTINE_OPTION_NAMES {
    return Object.values(QUARANTINE_OPTION_NAMES).includes(option as QUARANTINE_OPTION_NAMES);
}

export function validateQuarantineOptions (options: Dictionary<string | number>, optionName: string): void {
    if (Object.keys(options).some(key => !_isQuarantineOption(key)))
        throw new GeneralError(RUNTIME_ERRORS.invalidQuarantineOption, optionName);

    const attemptLimit     = options.attemptLimit || DEFAULT_ATTEMPT_LIMIT;
    const successThreshold = options.successThreshold || DEFAULT_THRESHOLD;

    if (successThreshold >= attemptLimit)
        throw new GeneralError(RUNTIME_ERRORS.invalidAttemptLimitValue, attemptLimit, successThreshold);
}

export async function getQuarantineOptions (optionName: string, options: string | boolean | Dictionary<string | number>): Promise<Dictionary<number> | boolean> {
    if (typeof options === 'boolean')
        return true;

    const parsedOptions = await baseGetOptions(options, {
        skipOptionValueTypeConversion: true,

        async onOptionParsed (key: string, value: string) {
            if (!key || !value)
                throw new GeneralError(RUNTIME_ERRORS.optionValueIsNotValidKeyValue, optionName);

            return Number(value);
        }
    });

    validateQuarantineOptions(parsedOptions, optionName);

    return parsedOptions;
}


interface AttemptResult {
    failedTimes: number;
    passedTimes: number;
}

export class Quarantine {
    public attempts: TestRunErrorFormattableAdapter[][];
    public attemptLimit: number;
    public successThreshold: number;
    public failureThreshold: number;

    public constructor () {
        this.attempts = [];
        this.attemptLimit = DEFAULT_ATTEMPT_LIMIT;
        this.successThreshold = DEFAULT_THRESHOLD;
        this.failureThreshold = DEFAULT_THRESHOLD;
    }

    public getFailedAttempts (): TestRunErrorFormattableAdapter[][] {
        return this.attempts.filter(errors => !!errors.length);
    }

    public getPassedAttempts (): TestRunErrorFormattableAdapter[][] {
        return this.attempts.filter(errors => errors.length === 0);
    }

    public setCustomParameters (attemptLimit: number | undefined, successThreshold: number | undefined): void {
        const needToUpdateTestRunThreshold          = typeof attemptLimit === 'number';
        const needToUpdatePassedQuarantineThreshold = typeof successThreshold === 'number';
        const needToRecalculateFailedThreshold      = needToUpdateTestRunThreshold || needToUpdatePassedQuarantineThreshold;

        // @ts-ignore
        if (needToUpdateTestRunThreshold) this.attemptLimit = attemptLimit;
        // @ts-ignore
        if (needToUpdatePassedQuarantineThreshold) this.passedThreshold = successThreshold;

        if (needToRecalculateFailedThreshold) this._setFailedThreshold();
    }

    public getNextAttemptNumber (): number {
        return this.attempts.length + 1;
    }

    public isThresholdReached (extraErrors?: TestRunErrorFormattableAdapter[]): boolean {
        const { passedTimes, failedTimes } = this._getAttemptsResult(extraErrors);

        const successThresholdReached = passedTimes >= this.successThreshold;
        const failureThresholdReached = failedTimes >= this.failureThreshold;

        return successThresholdReached || failureThresholdReached;
    }

    public isFirstAttemptSuccessful (extraErrors: TestRunErrorFormattableAdapter[]): boolean {
        const { failedTimes, passedTimes } = this._getAttemptsResult(extraErrors);

        return failedTimes === 0 && passedTimes > 0;
    }

    private _getAttemptsResult (extraErrors?: TestRunErrorFormattableAdapter[]): AttemptResult {
        let failedTimes = this.getFailedAttempts().length;
        let passedTimes = this.getPassedAttempts().length;

        if (extraErrors) {
            if (extraErrors.length)
                failedTimes += extraErrors.length;
            else
                passedTimes += 1;
        }

        return { failedTimes, passedTimes };
    }

    private _setFailedThreshold (): void {
        this.failureThreshold = this.attemptLimit - this.successThreshold + 1;
    }
}
