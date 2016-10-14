import path from 'path';
import _ from 'lodash';
import fs from 'fs';

import StartupArguments from '../util/StartupArguments';

class RemoteAppStartCommandGenerator {

  constructor(userId, appName, remoteAppsPath, environmentVariables) {
    this.userId = userId;
    this.appName = appName;
    this.remoteAppsPath = remoteAppsPath;
    this.remoteAppsExecutionPath = '/tmp';
    this.environmentVariables = environmentVariables;
  }

  convertStringToEnvironmentVariable(value) {
    let result = value;
    if (value && typeof value === 'string') {
      result = `$'${value.replace(new RegExp('\'', 'g'), '\\\'')}'`;
    }

    return result;
  }

  install(commands, tmpAppsParentPath, tmpAppPath) {
    const cleanInstall = StartupArguments.wasArgumentUsed('installRemoteNodeApp');
    if (cleanInstall) {
      commands.push(`rm -rf ${this.remoteAppsPath}/${this.appName}`);
    }

    commands.push(`cd ${this.remoteAppsPath}; cat *.tar | tar -xvf - -i`);

    if (cleanInstall) {
      commands.push(`rm -rf ${tmpAppsParentPath}`);
    }

    commands.push(`cp -r ${this.remoteAppsPath}/ ${this.remoteAppsExecutionPath}`);

    commands.push(`chown -R ${this.userId}: ${tmpAppPath}`);

    const npmrcPath = path.join(tmpAppPath, '.npmrc');

    if (fs.existsSync(npmrcPath)) {
      commands.push(`chmod 600 ${npmrcPath}`);
    }

    if (cleanInstall) {
      commands.push(`cd ${tmpAppPath}; npm --cache-min 9999999 install;`);
    }
  }

  getInstallScriptCommands() {
    const commands = [];

    const baseFolderName = path.basename(this.remoteAppsPath);
    const tmpAllAppsPath = path.join(this.remoteAppsExecutionPath, baseFolderName);
    const tmpAppPath = path.join(tmpAllAppsPath, this.appName);

    this.install(commands, tmpAllAppsPath, tmpAppPath);

    // Build
    commands.push(`cd ${tmpAppPath}; npm run gulp`);

    let envVarScript = '';
    if (this.environmentVariables) {
      if (!Array.isArray(this.environmentVariables)) {
        throw new Error('Environment variables parameter not correct type.');
      }
      this.environmentVariables.forEach((envVar) => {
        envVarScript += `export ${envVar.name}=${this.convertStringToEnvironmentVariable(envVar.value)}&& `;
      });
    }
    commands.push(`cd ${tmpAppPath}; ${envVarScript} npm start`);

    return commands;
  }
}

export default RemoteAppStartCommandGenerator;
