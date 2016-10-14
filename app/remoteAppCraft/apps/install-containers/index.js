import shell from 'shelljs';
import path from 'path';
import _ from 'lodash';
import pathExists from 'path-exists';

class InstallContainers {

  constructor() {
    const appName = 'install-container';

    this.constants = {
      loadingDockPath: '/home/fletch22/loading-dock/'
    };

    this.constants.installContainerPath = path.join(this.constants.loadingDockPath, appName);
  }

  exCom(command, messageError, messageSuccess) {
    const result = shell.exec(command);
    if (result.code !== 0) {
      shell.echo(`${messageError}; exit code ${result.code}: ${result.stderr}`);
      process.exit(result.code);
    } else if (messageSuccess) {
      shell.echo(messageSuccess);
    }
    return result;
  }

  initialClean() {
    if (pathExists.sync(this.constants.installContainerPath)) {
      const globRemove = path.join(this.constants.installContainerPath, '*');
      this.exCom(`rm -rf ${globRemove}`);
    }
    shell.mkdir('-p', this.constants.installContainerPath);
    shell.cd(this.constants.installContainerPath);
    this.exCom('ls -la', `Error could not list ${this.constants.installContainerPath} contents.`);
  }

  unpack() {
    const podPath = 'pod.tar.gz';
    shell.cd(this.constants.loadingDockPath);
    this.exCom(`tar -xvf ${podPath} -C ${this.constants.installContainerPath}`, `Untarring ${podPath} failed.`);
  }

  removePreviousImage(imageName) {
    const result = this.exCom(`docker images -q ${imageName}`, `Could not query system for docker image '${imageName}'.`);
    if (result.code === 0
    && result.stdout
    && _.trim(result.stdout).length > 0) {
      this.exCom(`docker rmi ${imageName}`, `Could not remove docker image '${imageName}'.`);
    }
  }

  import() {
    shell.cd(this.constants.installContainerPath);
    shell.ls('*.tar').forEach((filename) => {
      const containerName = path.basename(filename, path.extname(filename));
      this.removePreviousImage(containerName);
      this.exCom(`cat ./${filename} | docker import - ${containerName}:latest`, `Could not docker import file '${filename}'.`, `Successfully docker imported '${filename}' as image ${containerName}.`);
    });
  }

  start() {
    this.initialClean();
    this.unpack();
    this.import();
  }
}

shell.echo('About to start Docker container import...');
const installContainer = new InstallContainers();

installContainer.start();
