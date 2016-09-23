import 'moment-precise-range-plugin';
import path from 'path';
import { Client as SshClient } from 'ssh2';
import Config from '../config/config.js';
import RemoteCommandExecutor from '../RemoteCommandExecutor';
import logger from '../logging/Logger';
import PackageApps from './PackageApps';
import StartupArguments from '../util/StartupArguments';
import RemoteAppStartCommandGenerator from '../remoteAppCraft/RemoteAppStartCommandGenerator';

class RemotePackager {

  constructor() {
    this.sshConfig = Config.ServerInfo.SshConfig.LocalVagrant;

    const stagingFolderName = 'staging';
    const vagrantMontrealVolumeShareRoot = '/vagrant';
    const localMontrealRoot = '/Users/fletch22/workspaces/montreal';
    const relativeDockerComposePath = 'workspaces/docker/docker-compose';
    const relativeExportPath = path.join(relativeDockerComposePath, 'export');

    this.localStagingPath = path.join(localMontrealRoot, relativeExportPath, stagingFolderName);
    this.localExportAppsPath = path.join(this.localStagingPath, 'apps');

    this.dockerComposePath = path.join(vagrantMontrealVolumeShareRoot, relativeDockerComposePath);
    this.vagrantMontrealExportPath = path.join(vagrantMontrealVolumeShareRoot, relativeExportPath);
    this.vagrantMontrealStagingPath = path.join(this.vagrantMontrealExportPath, stagingFolderName);
    this.vagMontStagAppsPath = path.join(this.vagrantMontrealStagingPath, 'apps');

    this.appsHomePath = path.resolve(__dirname, '../../app/remoteAppCraft/apps');
    this.preppedAppPaths = [];

    this.appInfo = {
      ExportContainers: {
        appName: 'export-containers',
        folderName: 'export-containers'
      }
    };

    this.podPath = path.join(this.vagrantMontrealExportPath, 'pods');
  }

  getExportScript() {
    let commands = [];

    commands.push('echo \'About to start container export ...\'');

    const environmentVariables = [
      { name: 'POD_PATH', value: this.podPath }
    ];

    console.log(JSON.stringify(environmentVariables));

    const remoteAppStartCommandGenerator = new RemoteAppStartCommandGenerator(this.appInfo.ExportContainers.appName, this.vagMontStagAppsPath, environmentVariables);
    commands = commands.concat(remoteAppStartCommandGenerator.getInstallScriptCommands());

    return commands;
  }

  transferStep1(conn1) {
    logger.debug('About to add apps.');
    const packageApps = new PackageApps(this.appInfo, this.appsHomePath, this.localExportAppsPath, this.localStagingPath);
    const promise = packageApps.package();

    logger.debug('Command array execution ready ...');

    const commands = this.getExportScript();

    promise.then(() => {
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

    const podPath = path.join(this.vagrantMontrealExportPath, 'pods');
    const innerCommands = [
      `sudo cp ${this.dockerComposePath}/docker-compose.yml ${podPath}` // Copy docker-compose.yml to staging
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


