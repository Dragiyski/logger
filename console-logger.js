import { format } from 'util';
import { EOL } from 'os';
import node_fs from 'node:fs';

import CallbackLogger from './callback-logger.js';
import Logger from './logger.js';

const consoleOptions = {
    async: {},
    sync: {}
};

const syncLoggers = {
    stdout: logSync(1),
    stderr: logSync(2)
};

const levels = Logger.levels;
for (const levelName of Object.keys(levels)) {
    const level = levels[levelName];
    if (level < levels.warning) {
        consoleOptions.async[levelName] = {
            context: console,
            function: console.log,
            sync: true
        };
        consoleOptions.sync[levelName] = syncLoggers.stdout;
    } else if (level > levels.warning) {
        consoleOptions.async[levelName] = {
            context: console,
            function: console.error,
            sync: true
        };
        consoleOptions.sync[levelName] = syncLoggers.stderr;
    } else {
        consoleOptions.async[levelName] = {
            context: console,
            function: console.warn,
            sync: true
        };
        consoleOptions.sync[levelName] = syncLoggers.stderr;
    }
}

export default class ConsoleLogger extends CallbackLogger {
    constructor(level) {
        super({ ...consoleOptions, level });
    }
}

function logSync(fd) {
    return function (message, ...args) {
        if (typeof message === 'string' && message.length > 0) {
            node_fs.writeFileSync(fd, format(message, ...args) + EOL);
        }
    };
}
