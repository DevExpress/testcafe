import { ClientFunction } from 'testcafe';

const getFlag = ClientFunction(flagName => !!window[flagName]);

const getFlag1 = getFlag.bind(null, 'flag1');
const getFlag2 = getFlag.bind(null, 'flag2');

export { getFlag1, getFlag2 };
