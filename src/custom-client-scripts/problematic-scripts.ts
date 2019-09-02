import ClientScript from './client-script';

interface ProblematicScripts {
    duplicatedContent: ClientScript[];
    empty: ClientScript[];
}

//NOTE: https://github.com/Microsoft/TypeScript/issues/3194
export default ProblematicScripts; /*eslint-disable-line no-undef*/
