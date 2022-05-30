import prompts from 'prompts';
import chalk from 'chalk';
import DashboardConnector from './connector';
import emailValidator from 'email-validator';
import messages from './messages';
import getDefaultProjectLink from './get-default-project-link';
import DashboardConfigStorage from '../dashboard/config-storage';
import { SendReportState } from './interfaces';

import {
    info,
    warning,
    error,
    success,
} from './formatting';

import DASHBOARD_DOCUMENTATION_URL from './documentation-url';

const dashboardConnector     = new DashboardConnector();
const dashboardConfigStorage = new DashboardConfigStorage();

async function registerInDashboard (): Promise<void> {
    info(messages.REGISTRATION_ENTER_EMAIL_INVITATION);

    const { email } = await prompts({
        type:     'text',
        name:     'email',
        message:  messages.PROMPT_EMAIL_CAPTION,
        validate: (input: string) => {
            if (!emailValidator.validate(input))
                return messages.PROMPT_INVALID_EMAIL;

            return true;
        },
    });

    if (!email) {
        error(messages.REGISTRATION_CANCELLED);

        return;
    }

    const sendEmailResult = await dashboardConnector.sendEmail(email);

    if (!sendEmailResult.success) {
        const sendEmailErrorMessage = sendEmailResult.isDashboardError
            ? sendEmailResult.errorMessage
            : messages.REGISTRATION_EMAIL_SENDING_NETWORK_ERROR;

        error(sendEmailErrorMessage);

        return;
    }

    info(messages.REGISTRATION_EMAIL_SENT);

    const { token } = await prompts({
        type:    'text',
        name:    'token',
        message: messages.PROMPT_TOKEN_CAPTION,
    });

    if (!token) {
        error(messages.REGISTRATION_CANCELLED);

        return;
    }

    const validationResult = await dashboardConnector.validateToken(token);

    if (!validationResult.success) {
        const validationResultErrorMessage = validationResult.isDashboardError
            ? validationResult.errorMessage
            : messages.TOKEN_VALIDATION_NETWORK_ERROR;

        error(validationResultErrorMessage);

        return;
    }

    dashboardConfigStorage.options.sendReport = true;

    await saveNewToken(token);

    success(messages.REGISTRATION_FINISHED);

    info(
        'View test results at:\n' +
        `${chalk.underline.blueBright(getDefaultProjectLink(token))}`
    );

    info(
        `Run ${chalk.black.bgWhiteBright('testcafe dashboard off')} to disable this behavior.` +
        `Learn more at:\n${chalk.underline.blueBright(DASHBOARD_DOCUMENTATION_URL)}`
    );
}

async function saveNewToken (token: string): Promise<void> {
    dashboardConfigStorage.options.token = token;

    await dashboardConfigStorage.save();
}

async function updateDefaultToken (): Promise<void> {
    if (!dashboardConfigStorage.options.sendReport)
        warning(messages.TOKEN_UPDATING_NOT_SEND_REPORT);

    // NOTE: for the formatting reason
    info('');

    const { doYouWantToUpdateDefaultToken } = await prompts({
        type:    'confirm',
        name:    'doYouWantToUpdateDefaultToken',
        message: 'Your setup includes a default Dashboard token. Do you want to change it?:',
    });

    if (!doYouWantToUpdateDefaultToken) {
        error(messages.TOKEN_UPDATE_CANCELLED);

        return;
    }

    // NOTE: for the formatting reason
    info('');

    const { newToken } = await prompts({
        type:    'text',
        name:    'newToken',
        message: 'Enter the new default token value:',
    });

    if (!newToken) {
        error(messages.TOKEN_UPDATE_CANCELLED);

        return;
    }

    const validationResult = await dashboardConnector.validateToken(newToken);

    if (!validationResult.success) {
        const validationResultErrorMessage = validationResult.isDashboardError
            ? validationResult.errorMessage
            : messages.TOKEN_VALIDATION_NETWORK_ERROR;

        error(validationResultErrorMessage);

        return;
    }

    await saveNewToken(newToken);

    success(messages.TOKEN_UPDATED);
}

async function setSendReportState (state: SendReportState): Promise<void> {
    const sendReportAsBoolean = state === 'on';

    dashboardConfigStorage.options.sendReport = sendReportAsBoolean;

    await dashboardConfigStorage.save();

    const resultMessage = sendReportAsBoolean ? messages.SEND_REPORT_STATE_ON : messages.SEND_REPORT_STATE_OFF;

    success(resultMessage);
}

async function tryToRegisterInDashboard (): Promise<void> {
    info(messages.TOKEN_NO_DEFAULT_FOUND);

    const { launchConfigurationWizard } = await prompts({
        type:    'confirm',
        name:    'launchConfigurationWizard',
        message: 'Do you want to launch the configuration wizard?',
        initial: true,
    });

    if (!launchConfigurationWizard) {
        error(messages.REGISTRATION_CANCELLED);

        return;
    }

    await registerInDashboard();
}

export default async function (sendReportState: SendReportState): Promise<void> {
    const storageExists = await dashboardConfigStorage.load();

    if (sendReportState !== void 0) {
        if (storageExists)
            await setSendReportState(sendReportState);
        else
            await tryToRegisterInDashboard();

        return;
    }

    const thereIsDefaultToken = !!dashboardConfigStorage.options.token;

    if (thereIsDefaultToken)
        await updateDefaultToken();
    else
        await registerInDashboard();
}
