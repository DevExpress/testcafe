import { ClientFunction } from 'testcafe';

const focusInput    = ClientFunction(() => document.getElementById('input').focus());
const getInputValue = ClientFunction(() => document.getElementById('input').value);
const getEventLog   = ClientFunction(() => document.getElementById('eventLog').textContent.trim());
const setInputValue = ClientFunction(value => {
    document.getElementById('input').value = value;
});

export {
    focusInput,
    getInputValue,
    setInputValue,
    getEventLog,
};
