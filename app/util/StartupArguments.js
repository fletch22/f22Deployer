import logger from '../logging/Logger';

class StartupArguments {
  wasArgumentUsed(argumentName) {
    logger.debug(`Args: ${JSON.stringify(process.argv)}`);

    return process.argv.indexOf(argumentName) >= 0;
  }
}

export default new StartupArguments();
