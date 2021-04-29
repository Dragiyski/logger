export const properties = {
    level: Symbol('level')
};

export default class Logger {
    constructor(minLevel) {
        if (typeof this._log !== 'function') {
            throw new TypeError(`Missing abstract method override: Logger[Symbol(log)]`);
        }
        if (typeof this._logSync !== 'function') {
            throw new TypeError(`Missing abstract method override: Logger[Symbol(logSync)]`);
        }
        this[properties.level] = minLevel;
        const levels = this.constructor.levels;
        for (const levelName of Object.keys(levels)) {
            const level = levels[levelName];
            if (level >= minLevel) {
                Object.defineProperties(this, {
                    [levelName]: {
                        configurable: true,
                        writable: true,
                        value: this._log.bind(this, levelName)
                    },
                    [levelName + 'Sync']: {
                        configurable: true,
                        writable: true,
                        value: this._logSync.bind(this, levelName)
                    }
                });
            } else {
                Object.defineProperties(this, {
                    [levelName]: {
                        configurable: true,
                        writable: true,
                        value: noop
                    },
                    [levelName + 'Sync']: {
                        configurable: true,
                        writable: true,
                        value: noop
                    }
                });
            }
        }
    }

    get level() {
        return this[properties.level];
    }
}

Object.defineProperties(Logger, {
    levels: {
        value: Object.freeze(Object.assign(Object.create(null), {
            trace: 0,
            debug: 1,
            info: 2,
            warning: 3,
            error: 4,
            fatal: 5,
            silent: 6
        }))
    }
});

const noop = () => {};
