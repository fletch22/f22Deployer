import path from 'path';
import StartupArguments from '../util/StartupArguments';

class RemoteAppStartCommandGenerator {

  constructor(appName, remoteAppsPath) {
    this.appName = appName;
    this.remoteAppsPath = remoteAppsPath;
    this.remoteAppsExecutionPath = '/tmp';
  }

  getInstallScriptCommands() {
    const commands = [];

    const cleanInstall = StartupArguments.wasArgumentUsed('installRemoteNodeApp');
    if (cleanInstall) {
      commands.push(`rm -rf ${this.remoteAppsPath}/${this.appName}`);
    }

    commands.push(`cd ${this.remoteAppsPath}; cat *.tar | tar -xvf - -i`);

    const baseFolderName = path.basename(this.remoteAppsPath);
    const tmpAllAppsPath = path.join(this.remoteAppsExecutionPath, baseFolderName);

    if (cleanInstall) {
      commands.push(`sudo rm -rf ${tmpAllAppsPath}`);
    }

    commands.push(`sudo cp -r ${this.remoteAppsPath}/ ${this.remoteAppsExecutionPath}`);

    const tmpAppPath = path.join(tmpAllAppsPath, this.appName);
    commands.push(`sudo chown -R f22:vagrant ${tmpAppPath}`);

    const npmrcPath = path.join(tmpAppPath, '.npmrc');
    commands.push(`sudo chmod 600 ${npmrcPath}`);

    let optionalScript = '';
    if (cleanInstall) {
      optionalScript = ' npm install;';
    }
    commands.push(`cd ${tmpAppPath}; ${optionalScript} npm start`);

    return commands;
  }
}

export default RemoteAppStartCommandGenerator;
