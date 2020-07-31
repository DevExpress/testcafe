import { RequestFilterRule } from 'testcafe-hammerhead';

interface ClientScriptInit {
    path: string;
    content: string;
    page: RequestFilterRule;
}

//NOTE: https://github.com/Microsoft/TypeScript/issues/3194
export default ClientScriptInit; /*eslint-disable-line no-undef*/
