import shell from 'shelljs';
import config from 'config';
import path from 'path';
import del from 'del';
import mkdirp from 'mkdirp';
import logger from './logging/Logger';

class Index {

  constructor() {
    this.stagingPath = path.join(__dirname, config.get('docker.export.staging.relativePath'));

    const appConfig = JSON.parse(process.env.APP_CONFIG);

    logger.info(`AppConfig: ${process.env.APP_CONFIG}`);

    this.podPath = appConfig.podPath;
    this.podName = appConfig.podName;

    if (!this.podPath) {
      throw new Error('Process stopped. POD_PATH not set correctly.');
    }
  }

  export() {
    logger.info('About to start Docker container export ...');
    this.cleanExportDirectory();
    this.exportDockerContainers();
    this.packExported();
  }

  packExported() {
    mkdirp.sync(this.podPath);

    const podFilePath = path.join(this.podPath, this.podName);
    logger.info(`About to pack to pod: ${podFilePath}`);
    const script = `tar -zcvf ${podFilePath} -C ${this.stagingPath} .`;

    logger.info(`About to execute ${script}`);
    if (shell.exec(script).code !== 0) {
      throw new Error(`Could not pack ${this.stagingPath} to ${podFilePath}.`);
    } else {
      logger.info(`Finished packing to pod ${podFilePath}`);
    }
  }

  execScript(script, prefixMessage, errorMessage) {
    logger.info(prefixMessage);
    if (shell.exec(script).code !== 0) {
      throw new Error(errorMessage);
    }
  }

  ensureStagingPermissions() {
    this.execScript(`sudo mkdir -p ${this.stagingPath}`, `About to make directory ${this.stagingPath} ...`, `Could not make directory ${this.stagingPath}.`);

    let script = `sudo chown -R f22:vagrant ${this.stagingPath}`;
    logger.info(`About to change ownership of staging path ${this.stagingPath}`);
    if (shell.exec(script).code !== 0) {
      throw new Error(`Could not change ownership on output directory ${this.stagingPath}`);
    }

    script = `chmod 775 ${this.stagingPath}`;
    logger.info(`About to change permission of staging path ${this.stagingPath}`);
    if (shell.exec(script).code !== 0) {
      throw new Error(`Could not change permission on output directory ${this.stagingPath}`);
    }
  }

  exportDockerContainers() {
    this.ensureStagingPermissions();

    logger.info('About to start exporting Docker containers ...');

    const containers = ['consul-server-f22', 'webapp-f22', 'registrator-f22', 'nginx-f22'];

    containers.forEach((containerName) => {
      const exportPath = path.join(this.stagingPath, `${containerName}.tar`);

      logger.info(`Exporting to ${exportPath}`);
      const dockerExportScript = `docker export --output="${exportPath}" ${containerName}`;

      logger.info(`About to execute \'${dockerExportScript}\'.`);
      if (shell.exec(dockerExportScript).code !== 0) {
        throw new Error(`Could not export ${containerName}.`);
      }
    });
  }

  cleanExportDirectory() {
    logger.info('About to remove previous exported containers ...');
    logger.info(`Aboutu to clean export directory: ${this.stagingPath}`);
    mkdirp(this.stagingPath);
    del.sync(path.join(this.stagingPath, '**'), !this.stagingPath);
    logger.info('Done cleaning staging.');
  }

  run() {
    this.export();
  }
}

const index = new Index();

index.run();

