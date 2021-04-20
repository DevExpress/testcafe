import dedent from 'dedent';


export const SCREEN_RECORDING_PERMISSION_REQUEST = dedent `
    TestCafe requires permission to record the screen. Open 'System Preferences > Security & Privacy > Privacy > Screen Recording' and check 'TestCafe Browser Tools' in the application list.

    Press any key to retry.
`;

export const FAILED_TO_GENERATE_DETAILED_DIFF = (errorMessage: string): string => dedent `
    Failed to generate diff due to an error:
    ${errorMessage}
`;
