import { EOL } from 'os';

import Logger from './logger.js';

export const properties = {
    sync: Symbol('sync'),
    async: Symbol('async')
};

export default class CallbackLogger extends Logger {
    constructor(options) {
        options = { ...options };
        options.level ??= Logger.levels.info;
        options.sync = { ...options.sync };
        options.async = { ...options.async };
        super(options.level);
        this[properties.sync] = Object.create(null);
        this[properties.async] = Object.create(null);
        for (const type of ['sync', 'async']) {
            for (const levelName of Object.keys(options[type])) {
                const callback = options[type][levelName];
                if (callback == null) {
                    continue;
                }
                if (typeof callback === 'function') {
                    this[properties[type]][levelName] = { function: callback };
                } else if (typeof callback === 'object') {
                    if (typeof callback.function !== 'function') {
                        throw new TypeError(`Invalid callback given for ${type} log for level ${levelName}, expected object to contain a function`);
                    }
                    this[properties[type]][levelName] = {
                        context: callback.context,
                        function: callback.function,
                        levelName: Boolean(callback.levelName ?? false),
                        sync: Boolean(callback.sync ?? false)
                    };
                } else {
                    throw new TypeError(`Invalid callback given for ${type} log for level ${levelName}, expected function or object`);
                }
            }
        }
    }

    async _log(levelName, ...args) {
        try {
            const callbackMap = this[properties.async];
            if (callbackMap[levelName] != null) {
                const callback = callbackMap[levelName];
                if (callbackMap[levelName].levelName) {
                    args.unshift(levelName);
                }
                const fn = callback.function;
                if (callback.sync) {
                    Function.prototype.apply.call(fn, callback.context, args);
                } else {
                    await Function.prototype.apply.call(fn, callback.context, args);
                }
            }
        } catch (error) {
            console.error(error);
        }
    }

    _logSync(levelName, ...args) {
        try {
            const callbackMap = this[properties.sync];
            if (callbackMap[levelName] != null) {
                const callback = callbackMap[levelName];
                if (callbackMap[levelName].levelName) {
                    args.unshift(levelName);
                }
                const fn = callback.function;
                Function.prototype.apply.call(fn, callback.context, args);
            }
        } catch (error) {
            try {
                if (error != null) {
                    if (typeof error.stack === 'string') {
                        process.stdout.write(error.stack + EOL);
                    } else {
                        process.stdout.write(error + EOL);
                    }
                }
            } catch {}
        }
    }
}
