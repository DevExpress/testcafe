import { ClientFunction } from 'testcafe';

const setFlag = ClientFunction(() => {
    window.flag = true;
});
const hasFlag = ClientFunction(() => !!window.flag);

export {
    setFlag,
    hasFlag
};
