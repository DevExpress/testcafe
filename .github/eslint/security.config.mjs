import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import security from '@devexpress/eslint-security-config';

const CI = process.env.SECURITY_LINT === '1';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IGNORE_FILE_PATH = path.resolve(__dirname, 'ignore-security.txt');

let extraIgnores = [];
if (fs.existsSync(IGNORE_FILE_PATH)) {
  extraIgnores = fs
    .readFileSync(IGNORE_FILE_PATH, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

export default [
  {
	ignores: [
		'**/node_modules/**',
		...extraIgnores,
	],  
  },
  ...(CI ? [{ linterOptions: { noInlineConfig: true } }] : []),
  ...security.recommended
];