import chalk from 'chalk';
import inquirer from 'inquirer';

async function generateConfigFile (configFile: File, browserNames = []): Promise<object> {
    if (!await canGenerateConfigFile(configFile)) {
        console.log('Goodbye! 👋');
        process.exit(0);
    }

    console.log(
        chalk.underline(
            `The following questions will help Testcafe to create a suitable configuration for your project\n`,
        )
    );

    let generatedConfig = {};

    if (browserNames) {
        const browsers = await inquirer
            .prompt([
                {
                    type:    'checkbox',
                    name:    'browsers',
                    message: 'Browsers choices?',
                    choices: browserNames,
                }
            ]);

        generatedConfig = Object.assign(generatedConfig, browsers);
    }

    const src = await inquirer
        .prompt([
            {
                type:    'text',
                name:    'src',
                message: 'Specifiy files or directories from which to run tests. (Separated by commas.)',
                filter:  function (value) {
                    value = value.split(',');

                    if (value.length === 1)
                        value = value.join().trim();
                    else if (value.length > 1)
                        value = value.map((file: string) => file.trim());
                    return value;
                }
            }
        ]);

    generatedConfig = Object.assign(generatedConfig, src);

    const disableScreenshots = await inquirer
        .prompt([
            {
                type:    'confirm',
                name:    'disableScreenshots',
                message: 'Do you want to disable screenshots?',
                default: true
            }
        ]);

    if (disableScreenshots.disableScreenshots)
        generatedConfig = Object.assign(generatedConfig, disableScreenshots);
    else {
        let screenshots = {};
        const screenshotsTakeOnFails = await inquirer
            .prompt([
                {
                    type:    'confirm',
                    name:    'takeOnFails',
                    message: 'Screenshot should be taken whenever a test fails?',
                    default: true
                }
            ]);

        screenshots = Object.assign(screenshots, screenshotsTakeOnFails);

        const screenshotsFullPage = await inquirer
            .prompt([
                {
                    type:    'confirm',
                    name:    'fullPage',
                    message: 'The full page should be captured, including content that is not visible due to overflow?',
                    default: true
                }
            ]);

        screenshots = Object.assign(screenshots, screenshotsFullPage);
        generatedConfig = Object.assign(generatedConfig, { screenshots });
    }

    const quarantineMode = await inquirer
        .prompt([
            {
                type:    'confirm',
                name:    'quarantineMode',
                message: 'Do you want to enable quarantine mode?',
                default: true
            }
        ]);

    generatedConfig = Object.assign(generatedConfig, quarantineMode);

    const debugMode = await inquirer
        .prompt([
            {
                type:    'confirm',
                name:    'debugMode',
                message: 'Do you want to enable debug mode?',
                default: true
            }
        ]);

    generatedConfig = Object.assign(generatedConfig, debugMode);

    const debugOnFail = await inquirer
        .prompt([
            {
                type:    'confirm',
                name:    'debugOnFail',
                message: 'Do you want to enable debug mode only when a test fails?',
                default: true
            }
        ]);

    generatedConfig = Object.assign(generatedConfig, debugOnFail);

    const skipJsErrors = await inquirer
        .prompt([
            {
                type:    'confirm',
                name:    'skipJsErrors',
                message: 'Do you want to skip Javascript errors they occurs on a tested webpage?',
                default: true
            }
        ]);

    generatedConfig = Object.assign(generatedConfig, skipJsErrors);

    const skipUncaughtErrors = await inquirer
        .prompt([
            {
                type:    'confirm',
                name:    'skipUncaughtErrors',
                message: 'Do you want to skip uncaught errors on theserver during test execution?',
                default: true
            }
        ]);

    generatedConfig = Object.assign(generatedConfig, skipUncaughtErrors);

    const appCommand = await inquirer
        .prompt([
            {
                type:    'input',
                name:    'appCommand',
                message: 'Would you like to execute a specified shell command before running tests?',
                default: false
            }
        ]);

    if (appCommand.appCommand) {
        generatedConfig = Object.assign(generatedConfig, appCommand);
        const appInitDelay = await inquirer
            .prompt([
                {
                    type:     'number',
                    name:     'appInitDelay',
                    message:  'Specify the time (in ms) allowed for your application launched using the appCommand option to initialize.',
                    default:  1000,
                    validate: function (value) {
                        return !isNaN(parseFloat(value)) && isFinite(value) || 'Please enter a number';
                    }
                }
            ]);

        generatedConfig = Object.assign(generatedConfig, appInitDelay);
    }

    const concurrency = await inquirer
        .prompt([
            {
                type:     'number',
                name:     'concurrency',
                message:  'Specify the number of browser instances that should run tests concurrently.',
                default:  1,
                validate: function (value) {
                    return !isNaN(parseFloat(value)) && isFinite(value) || 'Please enter a number';
                }
            }
        ]);

    generatedConfig = Object.assign(generatedConfig, concurrency);

    return generatedConfig;
}

async function canGenerateConfigFile (configFile: File): Promise<boolean> {
    if (configFile) {
        const overwriteAnswer = await inquirer
            .prompt([
                {
                    type:    'confirm',
                    name:    'overwrite',
                    message: '.testcafe.json already exists! Would you like to overwrite it?',
                    default: false
                }
            ]);

        return overwriteAnswer.overwrite;
    }
    return true;
}

export default generateConfigFile;
