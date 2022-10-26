import { isMatch } from 'lodash';

// NOTE: this method will duplicate the matching items
// currently cookies-tests use incorrect behavior of this method
// the method and cookies-tests should be rewritten
export default function matchCollection (items: object[], filters: object[]): object[] {
    if (!filters.length)
        return items;

    const result = [];

    for (const item of items) {
        for (const filter of filters) {
            if (isMatch(item, filter))
                result.push(item);
        }
    }

    return result;
}
