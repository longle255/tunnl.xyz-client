import winston from 'winston';
import path from 'path';

winston.setLevels({
  silly: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4
});

winston.addColors({
  silly: 'magenta',
  debug: 'green',
  info: 'cyan',
  warn: 'yellow',
  error: 'red'
});

winston.remove(winston.transports.Console);

winston.add(winston.transports.Console, {
  level: 'debug',
  colorize: true
});

/**
 * get logger for specific module
 * @param  {string} module module tag will be appended to logging line
 * @return {logger} logger instance
 */
winston.getLogger = module => {
  if (!module) {
    module = 'generic';
  } else if (typeof module !== 'string') {
    module = path.basename(module.filename);
  }
  winston.loggers.add(module, {
    'console': {
      level: process.env.TUNNL_LOG || 'info',
      colorize: true,
      label: module
    },
    'file': {
      'filename': path.join(process.env.TUNNL_ROOT_DIR, './logs/output.log')
    }
  });
  return winston.loggers.get(module);
};

// export
module.exports = winston;
