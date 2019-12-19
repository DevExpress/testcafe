import ChromeRuntimeInfo from '../chrome/runtime-info';
import path from "path";
import makeDir from "../chrome/create-temp-profile";
import { writeFile } from "../../../../../utils/promisified-functions";

export default class EdgeChromiumRuntimeInfo extends ChromeRuntimeInfo {
    async createTempProfile (proxyHostName: string, allowMultipleWindows: boolean) {
        const tempDir = await super.createTempProfile(proxyHostName, allowMultipleWindows);

        debugger;

        const preferences = {
            "fre": {
                "has_user_completed_fre": true,
                "has_user_imported_during_fre": true,
                "has_user_seen_fre": true,
            }
        };

        await writeFile(path.join(tempDir.path, 'Local State'), JSON.stringify(preferences));

        return tempDir;















































































        return tempDir;
    }
}
