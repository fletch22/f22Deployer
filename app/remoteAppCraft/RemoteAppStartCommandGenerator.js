import path from 'path';
import _ from 'lodash';
import StartupArguments from '../util/StartupArguments';

class RemoteAppStartCommandGenerator {

  constructor(appName, remoteAppsPath, environmentVariables) {
    this.appName = appName;
    this.remoteAppsPath = remoteAppsPath;
    this.remoteAppsExecutionPath = '/tmp';
    this.environmentVariables = environmentVariables;
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

    let optionalInstallScript = '';
    if (cleanInstall) {
      optionalInstallScript = ' sudo npm install;'; // outputs STDERR to STDOUT.
    }

    let optionalEnvVariables = '';

    console.log(JSON.stringify(this.environmentVariables));

    if (this.environmentVariables) {
      if (!_.isArray(this.environmentVariables)) {
        throw new Error('Environment variables parameter not correct type.');
      }
      this.environmentVariables.forEach((envVar) => {
        optionalEnvVariables += `${envVar.name}='${envVar.value}' `;
      });
    }
    commands.push(`${optionalEnvVariables}; cd ${tmpAppPath}; ${optionalInstallScript} npm start`);

    return commands;
  }
}

export default RemoteAppStartCommandGenerator;
