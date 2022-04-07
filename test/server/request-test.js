const exportableLib                               = require('../../lib/api/exportable-lib');
const { Request } = exportableLib;
const { asyncAssertThrow }                             = require('./helpers/assert-runtime-error');

describe('Request', () => {
    it('Should validate URL', function () {
        asyncAssertThrow(() => Request('invalid URL'), {
            isTestCafeError: true,
            code:            'E90',
            actualValue:     'boolean',
            optionName:      'name',
            callsite:        null,
        });
    });

    it('Should validate request options', function () {
        asyncAssertThrow(() => Request('http://localhost:3000/', {
            method: true,
        }), {
            isTestCafeError: true,
            code:            'E90',
            actualValue:     'boolean',
            optionName:      'name',
            callsite:        null,
        });
        asyncAssertThrow(() => Request('http://localhost:3000/', {
            url: true,
        }), {
            isTestCafeError: true,
            code:            'E90',
            actualValue:     'boolean',
            optionName:      'name',
            callsite:        null,
        });
        asyncAssertThrow(() => Request('http://localhost:3000/', {
            path: true,
        }), {
            isTestCafeError: true,
            code:            'E90',
            actualValue:     'boolean',
            optionName:      'name',
            callsite:        null,
        });
        asyncAssertThrow(() => Request('http://localhost:3000/', {
            headers: true,
        }), {
            isTestCafeError: true,
            code:            'E90',
            actualValue:     'boolean',
            optionName:      'name',
            callsite:        null,
        });
        asyncAssertThrow(() => Request('http://localhost:3000/', {
            params: true,
        }), {
            isTestCafeError: true,
            code:            'E90',
            actualValue:     'boolean',
            optionName:      'name',
            callsite:        null,
        });
        asyncAssertThrow(() => Request('http://localhost:3000/', {
            body: true,
        }), {
            isTestCafeError: true,
            code:            'E90',
            actualValue:     'boolean',
            optionName:      'name',
            callsite:        null,
        });
        asyncAssertThrow(() => Request('http://localhost:3000/', {
            withCredentials: 'with credentials',
        }), {
            isTestCafeError: true,
            code:            'E90',
            actualValue:     'boolean',
            optionName:      'name',
            callsite:        null,
        });
        asyncAssertThrow(() => Request('http://localhost:3000/', {
            auth: true,
        }), {
            isTestCafeError: true,
            code:            'E90',
            actualValue:     'boolean',
            optionName:      'name',
            callsite:        null,
        });
        asyncAssertThrow(() => Request('http://localhost:3000/', {
            maxRedirects: true,
        }), {
            isTestCafeError: true,
            code:            'E90',
            actualValue:     'boolean',
            optionName:      'name',
            callsite:        null,
        });
        asyncAssertThrow(() => Request('http://localhost:3000/', {
            proxy: true,
        }), {
            isTestCafeError: true,
            code:            'E90',
            actualValue:     'boolean',
            optionName:      'name',
            callsite:        null,
        });
    });
});
