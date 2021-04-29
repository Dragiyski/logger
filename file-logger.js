import Logger from './logger.js';
import fs from 'fs';
import os from 'os';
import util from 'util';

export const properties = {
    filename: Symbol('filename'),
    options: Symbol('options')
};

export default class FileLogger extends Logger {
    constructor(filename, options) {
        options = { ...options };
        options.encoding ??= 'utf-8';
        options.newLine ??= os.EOL;
        options.level ??= Logger.levels.trace;
        options.formatter ??= util.format;
        if (typeof options.formatter === 'function') {
            options.formatter = { function: options.formatter };
        }
        if (typeof options.formatter !== 'object') {
            throw new TypeError(`Expected option 'formatter' to be a function or an object`);
        }
        options.formatter = { ...options.formatter };
        if (typeof options.formatter.function !== 'function') {
            throw new TypeError(`Expected option 'formatter.function' to be a function`);
        }
        super(options.level);
        this[properties.filename] = filename;
        this[properties.options] = options;
    }

    get filename() {
        return this[properties.filename];
    }

    get encoding() {
        return this[properties.options].encoding;
    }

    get newLine() {
        return this[properties.options].newLine;
    }

    async _log(levelName, message, ...args) {
        try {
            let string = Function.prototype.call.call(this[properties.options].formatter.function, this[properties.options].formatter.context, message, ...args);
            if (typeof string !== 'string') {
                throw new TypeError(`Logger's option 'formatter' function does not return a string`);
            }
            string += this.newLine;
            await fs.promises.appendFile(this.filename, string, this.encoding);
        } catch (e) {
            console.error(e);
        }
    }

    _logSync(levelName, message, ...args) {
        try {
            let string = Function.prototype.call.call(this[properties.options].formatter.function, this[properties.options].formatter.context, message, ...args);
            if (typeof string !== 'string') {
                throw new TypeError(`Logger's option 'formatter' function does not return a string`);
            }
            string += this.newLine;
            fs.appendFileSync(this.filename, string, this.encoding);
        } catch (e) {
            console.error(e);
        }
    }
}
