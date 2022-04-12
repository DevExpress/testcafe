import { assertType, is } from '../../errors/runtime/type-assertions';

export function parsePortNumber (value: string): number {
    assertType(is.nonNegativeNumberString, null, 'The port number', value);

    return parseInt(value, 10);
}

export function parseList (val: string): string[] {
    return val.split(',');
}

