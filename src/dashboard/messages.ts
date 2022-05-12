export default {
    REGISTRATION_CANCELLED:                   'The setup process has been aborted.',
    REGISTRATION_ENTER_EMAIL_INVITATION:      "Welcome to the TestCafe Dashboard setup wizard. This wizard requires an Internet connection.\n\nEnter your email address to receive a TestCafe Dashboard authentication link.\nIf you don't have a TestCafe Dashboard account, the link will prompt you to sign up.\n\n",
    REGISTRATION_EMAIL_SENDING_NETWORK_ERROR: 'Error: cannot request the log-in email. Please check your internet connection.',
    REGISTRATION_EMAIL_SENT:                  'Check your inbox for the TestCafe Dashboard log-in email. Follow the enclosed link to open the Token Setup page.\n\nProject tokens are unique authorization keys that let you upload data to Dashboard. Copy the project token and paste it here.\n\n',
    REGISTRATION_FINISHED:                    'You have successfully configured the TestCafe Dashboard reporter.\nThe next time you launch TestCafe, the framework will share test run data with TestCafe Dashboard.',
    PROMPT_EMAIL_CAPTION:                     'Email:',
    PROMPT_TOKEN_CAPTION:                     'Enter the project token:',
    PROMPT_INVALID_EMAIL:                     'Please enter a valid email address',
    TOKEN_VALIDATION_NETWORK_ERROR:           'Error: cannot validate the project token. Please check your internet connection.',
    TOKEN_UPDATE_CANCELLED:                   'Process aborted. The default token has not been updated.',
    TOKEN_UPDATED:                            'The default TestCafe Dashboard token has been updated.',
    TOKEN_UPDATING_NOT_SEND_REPORT:           'You have previously disabled the TestCafe Dashboard reporter. The changes you make will not come into effect unless you turn the reporter back on. To turn the reporter on, run the `testcafe dashboard on` command.',
    TOKEN_NO_DEFAULT_FOUND:                   'No default token found. You attempted to enable the Dashboard reporter but did not configure it.\n',
    SEND_REPORT_STATE_ON:                     'TestCafe Dashboard reporter enabled. From now on, this TestCafe installation will upload test report data to TestCafe Dashboard.',
    SEND_REPORT_STATE_OFF:                    'TestCafe Dashboard reporter disabled. From now on, this TestCafe installation will no longer upload test report data to TestCafe Dashboard.',
};

