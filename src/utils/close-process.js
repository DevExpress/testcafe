import childProcess from 'child_process';

const CHECK_PROCESS_IS_KILLED_TIMEOUT = 5000;
const NEW_LINE_SEPERATOR_RE           = /(\r\n)|(\n\r)|\n|\r/g;

const findProcessId = (browserId, psOutput) => {
    const processIdRegex   = new RegExp('^\\s*(\\d+)\\s+.*' + browserId);
    const lines            = psOutput.split(NEW_LINE_SEPERATOR_RE);

    for (let i = 0; i < lines.length; i++) {
        const match = processIdRegex.exec(lines[i]);

        if (match)
            return parseInt(match[1], 10);
    }

    return null;
};

const isProcessExist = (processId, psOutput) => {
    const processIdRegex   = new RegExp('^\\s*' + processId + '\\s+.*');
    const lines            = psOutput.split(NEW_LINE_SEPERATOR_RE);

    return lines.some(line => processIdRegex.test(line));
};

const getProcessOutput = callback => {
    const child = childProcess.spawn('ps', ['-eo', 'pid,command']);
    let stdout  = '';
    let stderr  = null;

    child.stdout.on('data', data => {
        stdout += data.toString();
    });

    child.stderr.on('data', data => {
        if (stderr === null)
            stderr = data.toString();
        else
            stderr += data.toString();
    });

    child.on('exit', () => {
        if (stderr)
            throw new Error('Can not get list of processes');
        else
            callback(stdout);
    });
};

const getProcessById = (processId, callback) => {
    return getProcessOutput(output => {
        callback(null, isProcessExist(processId, output));
    });
};

export function lookup (browserId, callback) {
    return getProcessOutput(output => {
        callback(null, findProcessId(browserId, output));
    });
}

export function kill (pid, next) {
    try {
        process.kill(pid);
    }
    catch (e) {
        next(e);
    }

    const killTimeoutTimer = setTimeout(() => {
        throw new Error('Kill process timeout');
    }, CHECK_PROCESS_IS_KILLED_TIMEOUT);

    const checkKilled = () => {
        getProcessById(pid, (err, isProcessNotKilled) => {
            if (isProcessNotKilled)
                checkKilled();
            else {
                clearTimeout(killTimeoutTimer);
                next();
            }
        });
    };

    checkKilled();
}
