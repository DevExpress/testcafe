import { chain } from 'lodash';
import { generateUniqueId, RequestFilterRule } from 'testcafe-hammerhead';
import ClientScript from './client-script';
import ProblematicScripts from './problematic-scripts';

function getScriptGroupValues (collection: ClientScript[], groupByPredicate: Function, pickByPredicate?: ((value: ClientScript[], key: string) => unknown)): ClientScript[][] {
    return chain(collection)
        .groupBy(groupByPredicate)
        .pickBy(pickByPredicate)
        .values()
        .value() as ClientScript[][];
}

function getDuplicatedScripts (collection: ClientScript[]): ClientScript[] {
    const contentGroups                     = getScriptGroupValues(collection, (s: ClientScript) => s.hash, (g: ClientScript[]) => g.length > 1);
    const duplicatedScripts: ClientScript[] = [];

    contentGroups.forEach(contentGroup => {
        const pageGroups = getScriptGroupValues(contentGroup as ClientScript[], (s: ClientScript) => s.page.toString());

        if (pageGroups.length === 1 && RequestFilterRule.isANY((pageGroups[0][0] as ClientScript).page)) { /*eslint-disable-line no-extra-parens*/
            duplicatedScripts.push(pageGroups[0][0] as ClientScript);

            return;
        }

        const forAllPagesGroup = pageGroups.find(pg => RequestFilterRule.isANY((pg[0] as ClientScript).page)); /*eslint-disable-line no-extra-parens*/

        if (forAllPagesGroup) {
            pageGroups
                .filter(pg => !RequestFilterRule.isANY((pg[0] as ClientScript).page)) /*eslint-disable-line no-extra-parens*/
                .forEach(pg => {
                    duplicatedScripts.push(pg[0] as ClientScript);
                });
        }
        else {
            pageGroups
                .filter(pg => pg.length > 1)
                .forEach(pg => {
                    duplicatedScripts.push(pg[0] as ClientScript);
                });
        }
    });

    return duplicatedScripts;
}

export function setUniqueUrls (collection: ClientScript[]): ClientScript[] {
    const scriptsWithDuplicatedUrls = getDuplicatedScripts(collection);

    for (let i = 0; i < scriptsWithDuplicatedUrls.length; i++)
        scriptsWithDuplicatedUrls[i].url = scriptsWithDuplicatedUrls[i].url + '-' + generateUniqueId(ClientScript.URL_UNIQUE_PART_LENGTH);

    return collection;
}

export function findProblematicScripts (collection: ClientScript[]): ProblematicScripts {
    const nonEmptyScripts              = collection.filter(s => !!s.content);
    const duplicatedContent            = getDuplicatedScripts(nonEmptyScripts);
    const empty                        = collection.filter(s => !s.content);

    return {
        duplicatedContent,
        empty
    };
}
