import path from 'path';
import ChromeRuntimeInfo from '../chrome/runtime-info';
import TempDirectory from '../../../../../utils/temp-directory';
import { writeFile } from '../../../../../utils/promisified-functions';

export default class EdgeRuntimeInfo extends ChromeRuntimeInfo {
    protected async createTempProfile (proxyHostName: string, allowMultipleWindows: boolean): Promise<TempDirectory> {
        const tempDir = await super.createTempProfile(proxyHostName, allowMultipleWindows);

        // NOTE: prevents Edge from automatically logging under system credentials
        // and showing the welcome screen
        const preferences = {
            'fre': {
                'has_user_seen_fre': true
            },
            'profiles': {
                'edge_implicitly_signed_in': [{
                    'edge_account_type': 3,
                    'id':                ''
                }]
            }
        };

        await writeFile(path.join(tempDir.path, 'Local State'), JSON.stringify(preferences));

        return tempDir;
    }
}
