import shell from 'shelljs';
import config from 'config';
import path from 'path';
import del from 'del';
import mkdirp from 'mkdirp';
import logger from './logging/Logger';

class Index {

  constructor() {
    this.stagingPath = path.join(__dirname, config.get('docker.export.staging.relativePath'));

    logger.info(`Env Var: ${JSON.stringify(process.env)}`);

    this.podPath = process.env.POD_PATH;

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
    const podFilePath = path.join(this.podPath, 'pod.tar.gz');
    const script = `tar -zcvf ${podFilePath} ${this.stagingPath}`;

    if (shell.exec(script).code !== 0) {
      logger.error(`Could not pack ${this.stagingPath}.`);
    }
  }

  exportDockerContainers() {
    logger.info('About to start exporting Docker containers ...');

    const containers = ['webapp-f22', 'consul-server-f22', 'registrator-f22', 'nginx-f22'];

    containers.forEach((containerName) => {
      let dockerExportScript = `docker export ${containerName} > ${this.stagingPath}/${containerName}.tar`;
      dockerExportScript = `docker export --output="${this.stagingPath}/${containerName}.tar" ${containerName}`;

      if (shell.exec(dockerExportScript).code !== 0) {
        logger.error(`Could not export ${containerName}.`);
      }
    });
  }

  cleanExportDirectory() {
    logger.info('About to remove previous exported containers ...');
    logger.info(`Aboutu to clean export directory: ${this.stagingPath}`);
    mkdirp(this.stagingPath);
    del.sync(path.join(this.stagingPath, '*'));
    logger.info('Done cleaning staging.');
  }

  run() {
    this.export();
  }
}


const index = new Index();

index.run();

