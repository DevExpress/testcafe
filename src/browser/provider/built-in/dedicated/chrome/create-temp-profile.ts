import path from 'path';
import makeDir from 'make-dir';
import TempDirectory from '../../../../../utils/temp-directory';
import { writeFile } from '../../../../../utils/promisified-functions';

export default async function (proxyHostName: string, disableMultipleWindows: boolean): Promise<TempDirectory> {
    const tempDir        = await TempDirectory.createDirectory('chrome-profile');
    const profileDirName = path.join(tempDir.path, 'Default');

    await makeDir(profileDirName);

    const preferences = {
        'credentials_enable_service': false,

        'devtools': {
            'preferences': {
                'currentDockState': '"undocked"',
                'lastDockState':    '"bottom"'
            }
        },
        'plugins': {
            'always_open_pdf_externally': true
        },
        'profile': {
            'content_settings': {
                'exceptions': {
                    'automatic_downloads': {
                        [proxyHostName]: { setting: 1 }
                    },
                    ...!disableMultipleWindows && {
                        'popups': {
                            [proxyHostName]: { setting: 1 }
                        }
                    },
                }
            },

            'password_manager_enabled': false
        },

        'translate': {
            'enabled': false
        }
    };

    await writeFile(path.join(profileDirName, 'Preferences'), JSON.stringify(preferences));
    await writeFile(path.join(tempDir.path, 'First Run'), '');

    return tempDir;
}
