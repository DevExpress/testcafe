import dedent from 'dedent';


export const SCREEN_RECORDING_PERMISSION_REQUEST = dedent `
    TestCafe requires permission to record the screen to execute browser actions and take screenshots. To ensure that screen recording is allowed, open 'System Preferences > Security & Privacy > Privacy > Screen Recording' and check 'TestCafe Browser Tools' in the application list.
    
    Press any key to retry.
`;
