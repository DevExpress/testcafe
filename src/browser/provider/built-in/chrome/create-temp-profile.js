import path from 'path';
import tmp from 'tmp';
import { writeFile, ensureDir } from '../../../../utils/promisified-functions';


export default async function (proxyHostName) {
    tmp.setGracefulCleanup();

    const tempDir        = tmp.dirSync({ unsafeCleanup: true });
    const profileDirName = path.join(tempDir.name, 'Default');

    await ensureDir(profileDirName);

    const preferences = {
        'credentials_enable_service': false,

        'devtools': {
            'preferences': {
                'currentDockState': '"undocked"',
                'lastDockState':    '"bottom"'
            }
        },

        'profile': {
            'content_settings': {
                'exceptions': {
                    'automatic_downloads': {
                        [proxyHostName]: { setting: 1 }
                    }
                }
            },

            'password_manager_enabled': false
        },

        'translate': {
            'enabled': false
        }
    };

    await writeFile(path.join(profileDirName, 'Preferences'), JSON.stringify(preferences));
    await writeFile(path.join(tempDir.name, 'First Run'), '');

    return tempDir;
}
