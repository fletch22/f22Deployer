import 'moment-precise-range-plugin';
import path from 'path';
import { Client as SshClient } from 'ssh2';
import Config from '../config/config.js';
import RemoteCommandExecutor from '../RemoteCommandExecutor';
import logger from '../logging/Logger';
import PackageApps from './PackageApps';
import RemoteAppStartCommandGenerator from '../remoteAppCraft/RemoteAppStartCommandGenerator';
import Shuttler from '../shuttler/Shuttler';

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

  getStartupScript() {
    let commands = [];

    const remoteStartConfig = {
      podName: Config.podName,
      podPath: this.podPath
    };

    const remoteConfig = JSON.stringify(remoteStartConfig);

    const environmentVariables = [
      { name: 'APP_CONFIG', value: remoteConfig }
    ];

    const remoteAppStartCommandGenerator = new RemoteAppStartCommandGenerator(this.sshConfig.username, this.appInfo.ExportContainers.appName, this.vagMontStagAppsPath, environmentVariables);
    commands = commands.concat(remoteAppStartCommandGenerator.getInstallScriptCommands());

    return commands;
  }

  transferStep1(conn1) {
    logger.debug('About to add apps.');
    const packageApps = new PackageApps(this.appInfo, this.appsHomePath, this.localExportAppsPath, this.localStagingPath, this.sshConfig);
    const promise = packageApps.package();

    const shuttler = new Shuttler(this.sshConfig, this.vagMontStagAppsPath);
    promise.then((preppedPaths) => shuttler.shuttleFiles(preppedPaths, conn1))
    .then(() => {
      const commands = this.getStartupScript();
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


