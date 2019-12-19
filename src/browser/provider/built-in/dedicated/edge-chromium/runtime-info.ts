import ChromeRuntimeInfo from '../chrome/runtime-info';
import path from "path";
import makeDir from "../chrome/create-temp-profile";
import { writeFile } from "../../../../../utils/promisified-functions";

export default class EdgeChromiumRuntimeInfo extends ChromeRuntimeInfo {
    async createTempProfile (proxyHostName: string, allowMultipleWindows: boolean) {
        const tempDir = await super.createTempProfile(proxyHostName, allowMultipleWindows);

        const preferences = {
            "fre": {
                "has_user_seen_fre": true
            },
            "profiles": {
                "edge_implicitly_signed_in": [{
                    "edge_account_type": 3,
                    "id": ""
                }]
            },
        };

        await writeFile(path.join(tempDir.path, 'Local State'), JSON.stringify(preferences));

        return tempDir;
    }
}
