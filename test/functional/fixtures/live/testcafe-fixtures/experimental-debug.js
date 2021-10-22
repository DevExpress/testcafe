import fs from 'fs';
import { join } from 'path';

fixture `Fixture`;

test('test', async () => {
    const markerFile = join(__dirname, '.test-completed.marker');

    fs.writeFileSync(markerFile, process.title);
});
