# @dragiyski/logger

This is a small logger library that allow simple logging.

Unlike most logging libraries, it offers two modes of operations: sync and     
async. By default, logging users should use async. However, certain scenarios,
like the `exit` event in `process` cannot guarantee that the files written would
be flushed to the disk before the node exits (sometimes will work, but not
always). In this scenarios, you can use the sync version of the logger, to
guarantee that the files are appended before the process exits.

## Installation

Install using `npm`:

```bash
npm install @dragiyski/logger
```

or

```bash
npm install git+https://github.com/Dragiyski/logger.git
```

## Usage

The logger provide several classes to facilitate different logging scenarios.

An example usage:

```javascript
import { ConsoleLogger, FileLogger, DelegateLogger } from '@dragiyski/logger';

const logger = new DelegateLogger(
    new ConsoleLogger(ConsoleLogger.levels.info),
    new FileLogger('/var/log/my-app/access.log', { level: FileLogger.levels.info })
);

logger.info('Something happened, see %O for more info', object);
logger.debugSync('This will be logged in immediately, before the call returns');
```

## Basic Information

The ``ConsoleLogger`` class logs messages to the console. The messages will
appear in both the terminal that run the process and if available, in the
inspector debugging the process. You can optimize the logger by providing
objects with `%O` notation and having a
``Symbol.for('nodejs.util.inspect.custom')`` method in their prototype chain
to display the object textually.

This allows an object to appears as custom text in the terminal, while it
remains an inspectable object in the inspector console. You can expand that
object and look at its properties.

Currently the console logger is not customizable. In near future versions,
more options will be available to control whether and when the logging
will appear at stdout or stderr, or whether ``console.error``, ``console.warn``,
or ``console.log`` will be used and for which levels.

The caller to any ``Logger`` will always have access to any level, but if the
logger level is above the level we are trying to log, the result is no-op. For
the example above, the ``logger.trace`` will be a function, but it won't do
anything.

The ``FileLogger`` logs a message to a file, automatically appending end-of-line
at the end of the message (the end-of-line of the current system). In the near
future log rotation will be available.

The ``DelegateLogger`` can be used to delegate a logging to one or more loggers.
This allows to log to both file and the console with a single call.

The ``CallbackLogger`` accepts one or more functions to be called to do the
logging. This logger allow to extend the logging process easily, without
creating a new class.

## Future extension (TODO)

* The ``ConsoleLogger`` would be update with options to control the calls to
the ``console.*()`` and whether to use ``stdout`` or ``stderr``.

* Add ``FileRotateLogger`` would be an extension of ``FileLogger``, that would
check, if the desired log file is too large and rotate and compress, if
required.

## Hacking

All private properties are realized through symbols. By default, the
``index.js`` file would export only the public classes. You can export
the private properties of a certain class by its module file:

```javascript
import FileLogger, { properties as FileLogger_properties } from '@dragiyski/logger/file-logger.js';
```

You can now use ``FileLogger_properties`` to access the private properties of
the ``FileLogger`` class. Be aware, that the private properties are subject to
change in any version (major, minor, revision and patch). Please, make sure
that your version is specified in the ``package-lock.json`` to prevent
unexpected results.

Most of the loggers assume the options specified in the constructor are
immutable. The behavior of the loggers under external change is undefined.
