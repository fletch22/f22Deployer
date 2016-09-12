import 'moment-precise-range-plugin';
import _ from 'lodash';
import fs from 'fs';
import fsExtra from 'fs-extra';
import path from 'path';
import mkdirp from 'mkdirp';
import { Client as SshClient } from 'ssh2';
import Config from '../config/config.js';
import RemoteCommandExecutor from '../RemoteCommandExecutor';
import PackageApp from '../remoteAppCraft/PackageApp';
import logger from '../logging/Logger';

class RemotePackager {

  constructor() {
    this.sshConfig = Config.ServerInfo.SshConfig.LocalVagrant;

    const stagingFolderName = 'staging';
    const vagrantMontrealVolumeShareRoot = '/vagrant';
    const localMontrealRoot = '/Users/fletch22/workspaces/montreal';
    const relativeDockerComposePath = 'workspaces/docker/docker-compose';
    const relativeExportPath = path.join(relativeDockerComposePath, 'export');

    this.localStagingPath = path.join(localMontrealRoot, relativeExportPath, stagingFolderName);

    this.dockerComposePath = path.join(vagrantMontrealVolumeShareRoot, relativeDockerComposePath);
    this.exportPath = path.join(vagrantMontrealVolumeShareRoot, relativeExportPath);
    this.stagingPath = path.join(this.exportPath, stagingFolderName);

    this.appsPath = path.resolve(__dirname, '../../app/remoteAppCraft/apps');
    this.preppedAppPaths = [];
  }

  expectExists(resourcePath) {
    if (!fs.existsSync(resourcePath)) {
      throw new Error(`Was trying to find '${resourcePath}' but could not find it.`);
    }
  }

  getAppPath(appName) {
    if (_.trim(appName) === '') {
      throw new Error('App name cannot be blank or empty.');
    }

    const appPath = path.resolve(this.appsPath, appName);

    if (!fs.existsSync(appPath)) {
      throw new Error(`Was trying to find app '${appName}' but could not find it. Looked in ${this.appsPath}. Not there.`);
    }
    return appPath;
  }

  prepApp(appName) {
    const appPath = this.getAppPath(appName);
    const packageApp = new PackageApp(appPath);
    this.preppedAppPaths.push(packageApp.package());
  }

  usherAppsToStaging() {
    this.expectExists(this.localStagingPath);

    const exportAppsPath = path.join(this.localStagingPath, 'apps');
    mkdirp(exportAppsPath);

    this.preppedAppPaths.forEach((filePath) => {
      this.expectExists(filePath);
      try {
        const destPath = path.join(exportAppsPath, path.basename(filePath));
        logger.debug(`Copying ${filePath} to ${destPath}`);
        fsExtra.copySync(filePath, destPath);
      } catch (error) {
        logger.error(`Encountered error copying file: ${error.stack}`);
      }
    });
  }

  addApps() {
    this.prepApp('install-containers');
    this.usherAppsToStaging();
  }

  transferStep1(conn1) {
    logger.debug('Command array execution ready ...');

    const commands = [
      'echo \'About to start export\''
    ];
    // `cd ${this.exportPath}; sudo ./e.sh`,

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
  }

  transferStep2(conn1) {
    const podPath = path.join(this.exportPath, 'pods');
    logger.debug('About to add apps.');
    this.addApps();

    logger.debug('About to compose commands.');
    const innerCommands = [
      `sudo cp ${this.dockerComposePath}/docker-compose.yml ${this.stagingPath}`, // Copy docker-compose.yml to staging
      'echo \'Done copying.\'', // Copy apps (if any) to staging
      `ls ${podPath} -l`
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
      logger.error('End.');
    })
      .connect(this.sshConfig);
  }
}

export default new RemotePackager();




