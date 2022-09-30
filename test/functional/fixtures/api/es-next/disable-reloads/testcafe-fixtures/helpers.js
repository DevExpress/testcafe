import { ClientFunction } from 'testcafe';


export const setPageTestData = ClientFunction(() => {
    window.testData = 'yo';

    window.localStorage.setItem('testData', 'yo');
});

export const checkPageTestData = ClientFunction(() => {
    const isLocalStorageNotCleared = window.localStorage.getItem('testData') === 'yo';
    const isPageNotReloaded        = window.testData === 'yo';

    return isLocalStorageNotCleared && isPageNotReloaded;
});
