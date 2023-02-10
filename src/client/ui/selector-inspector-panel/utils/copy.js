import { createElementFromDescriptor } from './create-element-from-descriptor';
import { addToUiRoot, removeFromUiRoot } from './ui-root';

import { auxiliaryCopyInput } from '../descriptors';

export function copy (value) {
    const element = createElementFromDescriptor(auxiliaryCopyInput);

    addToUiRoot(element);

    // eslint-disable-next-line no-restricted-properties
    element.value = value;

    element.select();

    document.execCommand('copy');

    removeFromUiRoot(element);
}
