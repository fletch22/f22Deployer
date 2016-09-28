import Q from 'q';
import _ from 'lodash';
import RemoteCommandExecutor from '../RemoteCommandExecutor';
import logger from '../logging/Logger';
import FileSender from '../sender/FileSender';

class Shuttler {

  constructor(sshConfig, remoteDestinationPath) {
    this.sshConfig = sshConfig;
    this.remoteDestinationPath = remoteDestinationPath;

    const shuttleConfig = _.cloneDeep(this.sshConfig);
    shuttleConfig.path = this.remoteDestinationPath;
    this.fileSender = new FileSender(shuttleConfig);
  }

  shuttleFiles(preppedPaths, connection) {
    const promises = [];

    _.each(preppedPaths, (filePath) => {
      logger.debug(`FP: ${filePath}`);

      const promise = new Promise((resolve, reject) => {
        const commands = [`mkdir -p ${this.remoteDestinationPath}`];

        const remoteCommandExecutor = new RemoteCommandExecutor(connection, commands);
        remoteCommandExecutor.execute()
          .then(() => {
            try {
              this.fileSender.send(resolve, reject, filePath);
            } catch (error) {
              logger.error(error.stack);
            }
          })
          .catch((error) => {
            throw new Error(error.stack);
          });
      });
      promises.push(promise);

      return true;
    });

    return Q.all(promises);
  }
}

export default Shuttler;
