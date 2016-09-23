import path from 'path';
import mkdirp from 'mkdirp';
import Winston from 'winston';

class Logger {

  constructor() {
    this.logger = undefined;
    this.init();
  }

  init() {
    Winston.emitErrs = true;
    const logPath = path.join(__dirname, 'logs');
    mkdirp(logPath);

    this.logger = new Winston.Logger({
      transports: [
        new Winston.transports.File({
          level: 'info',
          filename: path.join(logPath, 'all-logs.log'),
          handleExceptions: true,
          json: true,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          colorize: false
        }),
        new Winston.transports.Console({
          level: 'debug',
          handleExceptions: true,
          json: false,
          colorize: true
        })
      ],
      exitOnError: false
    });
  }
}

const logger = new Logger().logger;

const stream = {
  write: (message, encoding) => {
    logger.info(message);
  }
};
module.exports.stream = stream;

export default logger;
