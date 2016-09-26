import 'moment-precise-range-plugin';
import path from 'path';
import { Client as SshClient } from 'ssh2';
import _ from 'lodash';
import fs from 'fs';
import del from 'del';
import fsExtra from 'fs-extra';
import Q from 'q';
import Config from '../config/config.js';
import RemoteCommandExecutor from '../RemoteCommandExecutor';
import logger from '../logging/Logger';
import PackageApps from './PackageApps';
import RemoteAppStartCommandGenerator from '../remoteAppCraft/RemoteAppStartCommandGenerator';
import FileSender from '../sender/FileSender';
import fileSystem from '../util/FileSystem';

class RemotePackager {

  constructor() {
    this.sshConfig = Config.ServerInfo.SshConfig.LocalVagrant;

    this.localStagingPath = Config.localStagingPath;
    this.localExportAppsPath = Config.localExportAppsPath;

    this.dockerComposePath = Config.dockerComposePath;
    this.vagrantMontrealExportPath = Config.vagrantMontrealExportPath;
    this.vagrantMontrealStagingPath = Config.vagrantMontrealStagingPath;
    this.vagMontStagAppsPath = Config.vagMontStagAppsPath;

    this.appsHomePath = path.resolve(__dirname, '../../app/remoteAppCraft/apps');

    this.appInfo = {
      ExportContainers: {
        appName: 'export-containers',
        folderName: 'export-containers'
      }
    };

    this.podPath = Config.podPath.remote;
  }

  getExportScript() {
    let commands = [];

    commands.push('echo \'About to start container export ...\'');

    const remoteStartConfig = {
      podName: Config.podName,
      podPath: this.podPath
    };

    const remoteConfig = JSON.stringify(remoteStartConfig);

    const environmentVariables = [
      { name: 'APP_CONFIG', value: remoteConfig }
    ];

    logger.info(`PodPath: ${this.podPath}`);

    const remoteAppStartCommandGenerator = new RemoteAppStartCommandGenerator(this.sshConfig.username, this.appInfo.ExportContainers.appName, this.vagMontStagAppsPath, environmentVariables);
    commands = commands.concat(remoteAppStartCommandGenerator.getInstallScriptCommands());

    return commands;
  }

  getFileSender() {
    const shuttleConfig = _.cloneDeep(this.sshConfig);
    shuttleConfig.path = this.vagMontStagAppsPath;

    return new FileSender(shuttleConfig);
  }

  shuttleFilesX() {
    return new Promise((resolve, reject) => {
      this.getFileSender().send(resolve, reject, this.localExportAppsPath);
    });
  }

  shuttleFiles(preppedPaths) {
    const self = this;
    logger.debug(`About to expect exists: ${this.localStagingPath}`);

    const promises = [];

    try {
      fileSystem.expectExists(this.localStagingPath);
    } catch (error) {
      promises.push(Promise.reject(error));
    }

    _.each(preppedPaths, (filePath) => {
      logger.debug(`FP: ${filePath}`);
      let destPath;

      // try {
      //   logger.debug(`About to expect prepped path exists: ${filePath}`);
      //   fileSystem.expectExists(filePath);
      //
      //   logger.debug(`Packaging path for file: ${path.basename(filePath)}`);
      //   logger.debug(`About to create destination path using ${self.localExportAppsPath}`);
      //
      //   destPath = path.join(self.localExportAppsPath, path.basename(filePath));
      //
      //   logger.debug(`Created new destination path. ${destPath}`);
      //
      //   if (fs.existsSync(destPath)) {
      //     logger.debug(`Deleting ${destPath}`);
      //     del.sync(destPath, { force: true });
      //   }
      //
      //   logger.debug(`Copying ${filePath} to ${destPath}`);
      // } catch (error) {
      //   promises.push(Promise.reject(error));
      //   return false;
      // }
      //
      // const promise = new Promise((resolve, reject) => {
      //   try {
      //     fsExtra.copy(filePath, destPath, (error) => {
      //       if (error) {
      //         reject(error);
      //       } else {
      //         resolve();
      //       }
      //     });
      //   } catch (error) {
      //     logger.error(`Encountered error copying file: ${error.stack}`);
      //     throw new Error(error);
      //   }
      // });

      const promise = new Promise((resolve, reject) => {

        // Change to promise but remote execute code that will create the destination folder first.
        throw new Error('Not yet implemented');

        this.getFileSender().send(resolve, reject, filePath);
      });
      promises.push(promise);

      return true;
    });

    return Q.all(promises);
  }

  transferStep1(conn1) {
    logger.debug('About to add apps.');
    const packageApps = new PackageApps(this.appInfo, this.appsHomePath, this.localExportAppsPath, this.localStagingPath, this.sshConfig);
    const promise = packageApps.package();

    logger.debug('Command array execution ready ...');

    promise.then((preppedPaths) => this.shuttleFiles(preppedPaths))
    .then(() => {
      const commands = []; //this.getExportScript();
      const remoteCommandExecutor = new RemoteCommandExecutor(conn1, commands);
      remoteCommandExecutor.execute()
      .then(() => {
        try {
          this.transferStep2(conn1);
        } catch (error) {
          logger.error(error.stack);
          conn1.end();
        }
      })
      .catch((error) => {
        throw new Error(error.stack);
      });
    })
    .catch((error) => {
      logger.error(error.stack);
    });
  }

  transferStep2(conn1) {
    logger.debug('About to compose commands.');

    // const podPath = path.join(this.vagrantMontrealExportPath, 'pods');
    const innerCommands = [
      `sudo cp ${this.dockerComposePath}/docker-compose.yml ${this.podPath}` // Copy docker-compose.yml to staging
    ];

    logger.debug('About to attempt to connect again.');
    const rExec = new RemoteCommandExecutor(conn1, innerCommands);
    rExec.execute().then(() => {
      conn1.end(); // close parent (and this) connection
    });
  }

  package() {
    const conn1 = new SshClient();

    conn1.on('ready', () => {
      this.transferStep1(conn1);
    }).on('error', (error) => {
      logger.error(`Error: ${error.level}: ${error.message}`);
      conn1.end();
    }).on('end', () => {
      logger.info('End.');
    })
      .connect(this.sshConfig);
  }
}

export default new RemotePackager();


