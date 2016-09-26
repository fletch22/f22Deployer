import 'moment-precise-range-plugin';
import path from 'path';
import { Client as SshClient } from 'ssh2';
import RemoteCommandExecutor from '../RemoteCommandExecutor';
import Config from '../config/config';
import PackageApps from '../package/PackageApps';
import RemoteAppStartCommandGenerator from '../remoteAppCraft/RemoteAppStartCommandGenerator';

class RemoteInstaller {

  constructor(podInfo) {
    this.sshConfig = Config.ServerInfo.SshConfig.DigitalOcean;
    // this.remotePath = path.join(this.sshConfig.path, 'pods');

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

  // import StartupArguments from '../util/StartupArguments';
  // getRemoteAppInstallScriptCommands() {
  //   const commands = [];
  //   const appName = 'install-containers';
  //
  //   const cleanInstall = StartupArguments.wasArgumentUsed('installRemoteNodeApp');
  //   if (cleanInstall) {
  //     commands.push(`rm -rf ${this.vagMontStagAppsPath}/${appName}`);
  //   }
  //
  //   commands.push(`cd ${this.vagMontStagAppsPath}; cat *.tar | tar -xvf - -i`);
  //
  //   let optionalScript = '';
  //   if (cleanInstall) {
  //     optionalScript = ' npm install;';
  //   }
  //   commands.push(`cd ${this.vagMontStagAppsPath}/${appName}; ${optionalScript} npm start`);
  //
  //   return commands;
  // }

  install() {
    const packageApps = new PackageApps(this.appInfo, this.appsHomePath, this.localExportAppsPath, this.localStagingPath);
    const promise = packageApps.package();

    // Copy tar to destination.

    promise.then(() => {
      const conn1 = new SshClient();

      conn1.on('ready', () => {
        console.log('Command array execution ready ...');

        // const stagingPath = path.join(this.sshConfig.path, 'staging');
        let commands = [
          `ls ${this.sshConfig.path}`
        ];

        // `ls ${this.sshConfig.path}/staging`,
        // `cd ${this.sshConfig.path}; rm -rf staging`,
        // `cd ${this.sshConfig.path}; tar xf pod.tar.gz`,
        // 'docker rmi consul-server-f22',
        // `cd ${this.sshConfig.path}/staging; cat consul-server-f22.tar | docker import - consul-server-f22:latest`,

        const remoteAppStartCommandGenerator = new RemoteAppStartCommandGenerator(this.sshConfig.username, this.appInfo.ExportContainers.appName, this.remoteAppsPath);
        commands = commands.concat(remoteAppStartCommandGenerator.getInstallScriptCommands());

        // this.podInfo.containers.forEach((container) => {
        //   commands.push(`cd ${this.sshConfig.path}/staging; cat ${container.name}.tar | docker import - ${container.name}:latest`);
        // });

        const remoteCommandExecutor = new RemoteCommandExecutor(conn1, commands);
        remoteCommandExecutor.execute().then(() => {
          conn1.end(); // close parent (and this) connection
        });
      }).on('error', (error) => {
        console.log(`Error: ${error.level}: ${error.message}`);
      }).on('end', () => {
        console.log('End.');
      })
        .connect(this.sshConfig);
    });
  }
}

export default RemoteInstaller;
