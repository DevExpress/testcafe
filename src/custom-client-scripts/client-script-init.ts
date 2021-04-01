import { RequestFilterRuleInit } from 'testcafe-hammerhead';

interface ClientScriptInit {
    path: string;
    content: string;
    module: string;
    page: RequestFilterRuleInit;
}

//NOTE: https://github.com/Microsoft/TypeScript/issues/3194
export default ClientScriptInit; /*eslint-disable-line no-undef*/
