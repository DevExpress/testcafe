import { preventRealEvents } from './deps/testcafe-core';
import { fill as fillAutomationStorage } from './automation-storage';

var initialized = false;

export default function init () {
    if (initialized)
        return;

    preventRealEvents();
    fillAutomationStorage();
    initialized = true;
}