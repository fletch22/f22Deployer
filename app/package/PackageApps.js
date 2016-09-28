import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import del from 'del';
import fsExtra from 'fs-extra';
import Q from 'q';
import PackApp from '../remoteAppCraft/PackApp';
import fileSystem from '../util/FileSystem';
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

  // usherAppsToStaging() {
  //   const self = this;
  //   logger.debug(`About to expect exists: ${this.localStagingPath}`);
  //
  //   const promises = [];
  //
  //   try {
  //     fileSystem.expectExists(this.localStagingPath);
  //   } catch (error) {
  //     promises.push(Promise.reject(error));
  //   }
  //
  //   _.each(this.preppedAppPaths, (filePath) => {
  //     let destPath;
  //
  //     try {
  //       logger.debug(`About to expect prepped path exists: ${filePath}`);
  //       fileSystem.expectExists(filePath);
  //
  //       logger.debug(`Packaging path for file: ${path.basename(filePath)}`);
  //       logger.debug(`About to create destination path using ${self.localExportAppsPath}`);
  //
  //       destPath = path.join(self.localExportAppsPath, path.basename(filePath));
  //
  //       logger.debug(`Created new destination path. ${destPath}`);
  //
  //       if (fs.existsSync(destPath)) {
  //         logger.debug(`Deleting ${destPath}`);
  //         del.sync(destPath, { force: true });
  //       }
  //
  //       logger.debug(`Copying ${filePath} to ${destPath}`);
  //     } catch (error) {
  //       promises.push(Promise.reject(error));
  //       return false;
  //     }
  //
  //     const promise = new Promise((resolve, reject) => {
  //       try {
  //         fsExtra.copy(filePath, destPath, (error) => {
  //           if (error) {
  //             reject(error);
  //           } else {
  //             resolve();
  //           }
  //         });
  //       } catch (error) {
  //         logger.error(`Encountered error copying file: ${error.stack}`);
  //         throw new Error(error);
  //       }
  //     });
  //     promises.push(promise);
  //
  //     return true;
  //   });
  //
  //   return Q.all(promises);
  // }

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
