import Logger from './logger.js';

export const properties = {
    loggers: Symbol('loggers')
};

export default class DelegateLogger extends Logger {
    constructor(loggers) {
        if (loggers === Object(loggers) && typeof loggers?.[Symbol.iterator] === 'function') {
            loggers = [...loggers];
        } else if (loggers instanceof Logger) {
            loggers = [loggers];
        } else {
            throw new TypeError('Expected parameter 1 to be a Logger or Iterable<Logger>');
        }
        if (!loggers.every(logger => logger instanceof Logger)) {
            throw new TypeError('Expected parameter 1 to be a Logger or Iterable<Logger>');
        }
        super(0);
        this[properties.lggers] = loggers;
    }

    async _log() {
        try {
            await Promise.all(this[properties.loggers].map(logger => logger[Logger.symbols.log](...arguments)));
        } catch (e) {
            console.error(e);
        }
    }

    _logSync() {
        try {
            this[properties.loggers].forEach(logger => logger[Logger.symbols.logSync](...arguments));
        } catch (e) {
            console.log(e);
        }
    }
}
