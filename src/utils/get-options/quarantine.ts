import baseGetOptions from './base';
import QUARANTINE_OPTION_NAMES from '../../configuration/quarantine-option-names';
import { RUNTIME_ERRORS } from '../../errors/types';
import { GeneralError } from '../../errors/runtime';
import { Dictionary } from '../../configuration/interfaces';
import TestRunErrorFormattableAdapter from '../../errors/test-run/formattable-adapter';

const DEFAULT_QUARANTINE_THRESHOLD = 3;
const DEFAULT_TEST_RUN_THRESHOLD = 5;

function _isQuarantineOption (option: string): option is QUARANTINE_OPTION_NAMES {
    return Object.values(QUARANTINE_OPTION_NAMES).includes(option as QUARANTINE_OPTION_NAMES);
}

function _validateQuarantineOptions (options: Dictionary<string | number> ): void {
    const retryCount = options.retryCount || DEFAULT_TEST_RUN_THRESHOLD;
    const passCount  = options.passCount || DEFAULT_QUARANTINE_THRESHOLD;

    if (passCount > retryCount)
        throw new GeneralError(RUNTIME_ERRORS.invalidRetryCountValue, passCount);
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

    if (Object.keys(parsedOptions).some(key => !_isQuarantineOption(key)))
        throw new GeneralError(RUNTIME_ERRORS.invalidQuarantineOption, optionName);

    _validateQuarantineOptions(parsedOptions);

    return parsedOptions;
}


interface AttemptResult {
    failedTimes: number;
    passedTimes: number;
}

export class Quarantine {
    public attempts: TestRunErrorFormattableAdapter[][];
    public testRunThreshold: number;
    public failedQuarantineThreshold: number;
    public passedQuarantineThreshold: number;

    public constructor () {
        this.attempts = [];
        this.testRunThreshold = DEFAULT_TEST_RUN_THRESHOLD;
        this.failedQuarantineThreshold = DEFAULT_QUARANTINE_THRESHOLD;
        this.passedQuarantineThreshold = DEFAULT_QUARANTINE_THRESHOLD;
    }

    public getFailedAttempts (): TestRunErrorFormattableAdapter[][] {
        return this.attempts.filter(errors => !!errors.length);
    }

    public getPassedAttempts (): TestRunErrorFormattableAdapter[][] {
        return this.attempts.filter(errors => errors.length === 0);
    }

    public setPassedQuarantineThreshold (threshold: number): void {
        this.passedQuarantineThreshold = threshold;
        this._setFailedThreshold();
    }

    public setTestRunThreshold (threshold: number): void {
        this.testRunThreshold = threshold;
    }

    public getNextAttemptNumber (): number {
        return this.attempts.length + 1;
    }

    public isThresholdReached (extraErrors?: TestRunErrorFormattableAdapter[]): boolean {
        const { failedTimes, passedTimes } = this._getAttemptsResult(extraErrors);

        const failedThresholdReached = failedTimes >= this.failedQuarantineThreshold;
        const passedThresholdReached = passedTimes >= this.passedQuarantineThreshold;

        return failedThresholdReached || passedThresholdReached;
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
        if (this.testRunThreshold !== DEFAULT_TEST_RUN_THRESHOLD)
            this.failedQuarantineThreshold = this.testRunThreshold - this.passedQuarantineThreshold + 1;

        this.failedQuarantineThreshold = DEFAULT_QUARANTINE_THRESHOLD;
    }
}
