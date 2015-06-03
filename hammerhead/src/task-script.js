import path from 'path';
import fs from 'fs';

const TASK_TEMPLATE_FILE = path.join(__dirname, '../../_compiled_/hammerhead_client/task.jstmpl');
const TASK_TEMPLATE      = fs.readFileSync(TASK_TEMPLATE_FILE).toString();
const VAR_RE             = /"<@\s*(\S+)\s*@>"/g;

export function render (vars) {
    return TASK_TEMPLATE.replace(VAR_RE, (str, varName) => vars[varName] === void 0 ? str : vars[varName]);
}