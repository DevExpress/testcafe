import { chain } from 'lodash';
import { generateUniqueId, RequestFilterRule } from 'testcafe-hammerhead';
import ClientScript from './client-script';

function getScriptGroupValues (collection, groupByPredicate, pickUpPredicate) {
    return chain(collection)
        .groupBy(groupByPredicate)
        .pickBy(pickUpPredicate)
        .values()
        .value();
}

function getDuplicatedScripts (collection) {
    const contentGroups     = getScriptGroupValues(collection, s => s.hash, g => g.length > 1);
    const duplicatedScripts = [];

    contentGroups.forEach(contentGroup => {
        const pageGroups = getScriptGroupValues(contentGroup, s => s.page.toString());

        if (pageGroups.length === 1 && RequestFilterRule.isANY(pageGroups[0][0].page)) {
            duplicatedScripts.push(pageGroups[0][0]);

            return;
        }

        const forAllPagesGroup = pageGroups.find(pg => RequestFilterRule.isANY(pg[0].page));

        if (forAllPagesGroup) {
            pageGroups
                .filter(pg => !RequestFilterRule.isANY(pg[0].page))
                .forEach(pg => {
                    duplicatedScripts.push(pg[0]);
                });
        }
        else {
            pageGroups
                .filter(pg => pg.length > 1)
                .forEach(pg => {
                    duplicatedScripts.push(pg[0]);
                });
        }
    });

    return duplicatedScripts;
}

export function setUniqueUrls (collection) {
    const scriptsWithDuplicatedUrls = getDuplicatedScripts(collection, i => i.url);

    for (let i = 0; i < scriptsWithDuplicatedUrls.length; i++)
        scriptsWithDuplicatedUrls[i].url = scriptsWithDuplicatedUrls[i].url + '-' + generateUniqueId(ClientScript.URL_UNIQUE_PART_LENGTH);

    return collection;
}

export function findProblematicScripts (collection) {
    const nonEmptyScripts              = collection.filter(s => !!s.content);
    const duplicatedContent            = getDuplicatedScripts(nonEmptyScripts);
    const empty                        = collection.filter(s => !s.content);

    return {
        duplicatedContent,
        empty
    };
}
