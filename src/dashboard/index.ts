/* eslint-disable no-console */

import prompts from 'prompts';
import chalk from 'chalk';
import DashboardConnector from './connector';
import emailValidator from 'email-validator';
import messages from './messages';
import getDefaultProjectLink from './get-default-project-link';
import DashboardConfigStorage from '../dashboard/config-storage';
import { SendReportState } from './interfaces';

const DASHBOARD_DOCUMENTATION_URL = 'https://testcafe.io/dashboard-alpha';

const dashboardConnector     = new DashboardConnector();
const dashboardConfigStorage = new DashboardConfigStorage();

async function registerInDashboard (): Promise<void> {
    console.log(messages.REGISTRATION_ENTER_EMAIL_INVITATION);

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
        console.log(messages.REGISTRATION_CANCELLED);

        return;
    }

    const sendEmailResult = await dashboardConnector.sendEmail(email);

    if (!sendEmailResult.success) {
        const sendEmailErrorMessage = sendEmailResult.isDashboardError
            ? sendEmailResult.errorMessage
            : messages.REGISTRATION_EMAIL_SENDING_NETWORK_ERROR;

        console.log(chalk.red(sendEmailErrorMessage));

        return;
    }

    console.log(messages.REGISTRATION_EMAIL_SENT);

    const { token } = await prompts({
        type:    'text',
        name:    'token',
        message: messages.PROMPT_TOKEN_CAPTION,
    });

    if (!token) {
        console.log(messages.REGISTRATION_CANCELLED);

        return;
    }

    const validationResult = await dashboardConnector.validateToken(token);

    if (!validationResult.success) {
        const validationResultErrorMessage = validationResult.isDashboardError
            ? validationResult.errorMessage
            : messages.TOKEN_VALIDATION_NETWORK_ERROR;

        console.log(chalk.red(validationResultErrorMessage));

        return;
    }

    dashboardConfigStorage.options.sendReport = true;

    await saveNewToken(token);

    console.log(
        chalk.green('You have successfully configured the TestCafe Dashboard reporter.\n' +
        'The next time you launch TestCafe, the framework will share test run data with TestCafe Dashboard.\n' +
        `View test results at ${getDefaultProjectLink(token)}.\n` +
        'Run "testcafe dashboard off" to disable this behavior.\n' +
        `Learn more at ${DASHBOARD_DOCUMENTATION_URL}.`)
    );
}

async function saveNewToken (token: string): Promise<void> {
    dashboardConfigStorage.options.token = token;

    await dashboardConfigStorage.save();
}

async function updateDefaultToken (): Promise<void> {
    if (!dashboardConfigStorage.options.sendReport)
        console.log(messages.TOKEN_UPDATING_NOT_SEND_REPORT);

    const { doYouWantToUpdateDefaultToken } = await prompts({
        type:    'confirm',
        name:    'doYouWantToUpdateDefaultToken',
        message: 'Your setup includes a default Dashboard token. Do you want to change it?:',
    });

    if (!doYouWantToUpdateDefaultToken) {
        console.log(messages.TOKEN_UPDATE_CANCELLED);

        return;
    }

    const { newToken } = await prompts({
        type:    'text',
        name:    'newToken',
        message: 'Enter the new default token value:',
    });

    if (!newToken) {
        console.log(messages.TOKEN_UPDATE_CANCELLED);

        return;
    }

    const validationResult = await dashboardConnector.validateToken(newToken);

    if (!validationResult.success) {
        const validationResultErrorMessage = validationResult.isDashboardError
            ? validationResult.errorMessage
            : messages.TOKEN_VALIDATION_NETWORK_ERROR;

        console.log(chalk.red(validationResultErrorMessage));

        return;
    }

    await saveNewToken(newToken);

    console.log(chalk.green(messages.TOKEN_UPDATED));
}

async function setSendReportState (state: SendReportState): Promise<void> {
    const sendReportAsBoolean = state === 'on';

    dashboardConfigStorage.options.sendReport = sendReportAsBoolean;

    await dashboardConfigStorage.save();

    const resultMessage = sendReportAsBoolean ? messages.SEND_REPORT_STATE_ON : messages.SEND_REPORT_STATE_OFF;

    console.log(chalk.green(resultMessage));
}

export default async function (sendReportState: SendReportState): Promise<void> {
    await dashboardConfigStorage.load();

    if (sendReportState !== void 0) {
        await setSendReportState(sendReportState);

        return;
    }

    const thereIsDefaultToken = !!dashboardConfigStorage.options.token;

    if (thereIsDefaultToken)
        await updateDefaultToken();
    else
        await registerInDashboard();
}
