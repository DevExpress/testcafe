import { ClientFunction } from 'testcafe';


export const setPageTestData = ClientFunction(() => {
    window.testData = 'yo';
});

export const checkPageTestData = ClientFunction(() => window.testData === 'yo');
