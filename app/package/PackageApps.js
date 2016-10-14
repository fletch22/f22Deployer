import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import del from 'del';
import Q from 'q';
import PackApp from '../remoteAppCraft/PackApp';
import logger from '../logging/Logger';

class PackageApps {

  constructor(appInfo, appsPath, localExportAppsPath, localStagingPath, sshConfig) {
    this.preppedAppPaths = [];
    this.appInfo = appInfo;
    this.appsHomePath = appsPath;
    this.localExportAppsPath = localExportAppsPath;
    this.localStagingPath = localStagingPath;
    this.sshConfig = sshConfig;
  }

  getAppPath(appName) {
    if (_.trim(appName) === '') {
      throw new Error('App name cannot be blank or empty.');
    }

    const appPath = path.resolve(this.appsHomePath, appName);

    if (!fs.existsSync(appPath)) {
      throw new Error(`Was trying to find app '${appName}' but could not find it. Looked in ${this.appsHomePath}. Not there.`);
    }

    return appPath;
  }

  cleanFolder(folderPath) {
    const globPath = path.join(folderPath, '*'); // Removes files
    del.sync([globPath], { force: true });
  }

  prepApp(appName, outputFolderPath) {
    const appPath = this.getAppPath(appName);
    const packageApp = new PackApp(appPath, outputFolderPath);

    return packageApp.pack()
      .then((outputPath) => {
        logger.debug(`After Packing exists ? ${fs.existsSync(outputPath)}`);

        this.preppedAppPaths.push(outputPath);
        return Promise.resolve();
      });
  }

  package() {
    const promises = [];

    this.cleanFolder(this.localStagingPath);

    const appKeys = Object.keys(this.appInfo);
    appKeys.forEach((appKey) => {
      const promise = this.prepApp(this.appInfo[appKey].appName, this.localStagingPath);
      promises.push(promise);
    });

    return Q.all(promises)
      .then(() => this.preppedAppPaths);
  }
}

export default PackageApps;
