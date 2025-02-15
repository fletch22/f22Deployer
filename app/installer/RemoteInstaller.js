import 'moment-precise-range-plugin';
import path from 'path';
import { Client as SshClient } from 'ssh2';
import RemoteCommandExecutor from '../RemoteCommandExecutor';
import Config from '../config/config';
import PackageApps from '../package/PackageApps';
import RemoteAppStartCommandGenerator from '../remoteAppCraft/RemoteAppStartCommandGenerator';
import Shuttler from '../shuttler/Shuttler';
import logger from '../logging/Logger';

class RemoteInstaller {

  constructor(podInfo) {
    this.sshConfig = Config.ServerInfo.SshConfig.DigitalOcean;

    console.log(`Got this far....${podInfo.containers.length}`);
    this.podInfo = podInfo;

    this.appsHomePath = path.resolve(__dirname, '../../app/remoteAppCraft/apps');
    this.localStagingPath = Config.localStagingPath;
    this.localExportAppsPath = Config.localExportAppsPath;
    this.remoteAppsPath = path.join(this.sshConfig.path, 'apps');

    this.appInfo = {
      ExportContainers: {
        appName: 'install-containers',
        folderName: 'install-containers'
      }
    };
  }

  transferFiles(connection) {
    const shuttler = new Shuttler(this.sshConfig, this.remoteAppsPath);

    const packageApps = new PackageApps(this.appInfo, this.appsHomePath, this.localExportAppsPath, this.localStagingPath);
    return packageApps.package()
      .then((preppedPaths) => shuttler.shuttleFiles(preppedPaths, connection))
      .then(() => {
        let commands = [
          `ls ${this.remoteAppsPath}`
        ];

        const remoteAppStartCommandGenerator = new RemoteAppStartCommandGenerator(this.sshConfig.username, this.appInfo.ExportContainers.appName, this.remoteAppsPath);
        commands = commands.concat(remoteAppStartCommandGenerator.getInstallScriptCommands());

        const remoteCommandExecutor = new RemoteCommandExecutor(connection, commands);
        remoteCommandExecutor.execute().then(() => {
          connection.end(); // close parent (and this) connection
        });
      });
  }

  install() {
    const conn1 = new SshClient();
    conn1.on('ready', () => {
      console.log('Command array execution ready ...');
      this.transferFiles(conn1)
        .catch((error) => {
          logger.error(error);
          conn1.end();
        });
    }).on('error', (error) => {
      console.log(`Error: ${error.level}: ${error.message}`);
    }).on('end', () => {
      console.log('End.');
    })
      .connect(this.sshConfig);
  }
}

export default RemoteInstaller;
