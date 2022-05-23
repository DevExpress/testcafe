import { assertType, is } from '../errors/runtime/type-assertions';
import { Dictionary } from '../configuration/interfaces';

const isURLSearchParams = {
    name:      'URLSearchParams',
    predicate: (value: any) => value instanceof URLSearchParams,
};

const isURL = {
    name:      'URL',
    predicate: (value: any) => value instanceof URL,
};

interface Assertion {
    name: string;
    types: object;
    options: null | Assertion[];
    required: boolean;
}

const authOptionAssertions: Assertion[] = [
    { name: 'username', types: is.string, options: null, required: true },
    { name: 'password', types: is.string, options: null, required: false },
];

const proxyOptionAssertions: Assertion[] = [
    { name: 'protocol', types: is.string, options: null, required: false },
    { name: 'host', types: is.string, options: null, required: true },
    { name: 'port', types: [is.number, is.string], options: null, required: true },
    { name: 'auth', types: is.nonNullObject, options: authOptionAssertions, required: false },
];

const requestOptionAssertions: Assertion[] = [
    { name: 'url', types: [is.string, isURL], options: null, required: true },
    { name: 'method', types: is.string, options: null, required: false },
    { name: 'headers', types: is.nonNullObject, options: null, required: false },
    { name: 'params', types: [isURLSearchParams, is.nonNullObject], options: null, required: false },
    { name: 'timeout', types: is.number, options: null, required: false },
    { name: 'withCredentials', types: is.boolean, options: null, required: false },
    { name: 'auth', types: is.nonNullObject, options: authOptionAssertions, required: false },
    { name: 'proxy', types: is.nonNullObject, options: proxyOptionAssertions, required: false },
    { name: 'rawResponse', types: is.boolean, options: null, required: false },
    { name: 'isAjax', types: is.boolean, options: null, required: false },
];

function validateOptions (options: Dictionary<any>, callsiteName: string, assertions: Assertion[] = requestOptionAssertions, path = ''): void {
    for (const assertion of assertions) {
        const optionName = (path ? `${path}.` : '') + assertion.name;
        const optionValue = options[assertion.name];

        if (!optionValue && !assertion.required)
            continue;

        assertType(assertion.types, callsiteName, `The "${optionName}" argument`, optionValue);

        if (assertion.options)
            validateOptions(optionValue, callsiteName, assertion.options, optionName);
    }
}

export default validateOptions;
