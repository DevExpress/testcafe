import CONTENT_TYPES from '../../assets/content-types';

const INVALID_INTERCEPTED_RESPONSE_ERROR_MSG = 'Invalid InterceptionId.';

const FAVICON_CONTENT_TYPE_HEADER = {
    name:  'content-type',
    value: CONTENT_TYPES.icon,
};

export {
    INVALID_INTERCEPTED_RESPONSE_ERROR_MSG,
    FAVICON_CONTENT_TYPE_HEADER,
};
