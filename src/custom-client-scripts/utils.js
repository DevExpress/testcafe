import { chain } from 'lodash';
import { generateUniqueId } from 'testcafe-hammerhead';
import ClientScript from './client-script';

function getDuplicatedScripts (collection, predicate) {
    return chain(collection)
        .groupBy(predicate)
        .pickBy(g => g.length > 1)
        .values()
        .map(value => {
            return value[0];
        })
        .value();
}

export function setUniqueUrls (collection) {
    const scriptsWithDuplicatedUrls = getDuplicatedScripts(collection, i => i.url);

    for (let i = 0; i < scriptsWithDuplicatedUrls.length; i++)
        scriptsWithDuplicatedUrls[i].url = scriptsWithDuplicatedUrls[i].url + '-' + generateUniqueId(ClientScript.URL_UNIQUE_PART_LENGTH);

    return collection;
}

export function findProblematicScripts (collection) {
    const nonEmptyScripts              = collection.filter(s => !!s.content);
    const scriptsWithDuplicatedContent = getDuplicatedScripts(nonEmptyScripts, s => s.content + s.page.toString());
    const emptyScripts                 = collection.filter(s => !s.content);

    return {
        duplicatedContent: scriptsWithDuplicatedContent,
        empty:             emptyScripts
    };
}
