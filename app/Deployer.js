import tarPack from 'tar-pack';
import pathExists from 'path-exists';
import fs from 'fs';
import del from 'delete';
import config from './config/config';
import FileSender from './FileSender';

const sshConfig = config.ServerInfo.SshConfig.LocalVagrant;

class Deployer {

  constructor(localLoadingDock, localShippingPackageFile, shippingProjectPath) {
    this.sshConfig = sshConfig;
    this.localShippingPackageFile = localShippingPackageFile;
    this.shippingProjectPath = shippingProjectPath;
    this.localLoadingDock = localLoadingDock;
  }

  deploy() {
    return new Promise((resolve, reject) => {
      if (pathExists(this.localShippingPackageFile)) {
        console.log(`Deleting locals shipping package file: ${this.localShippingPackageFile}`);
        del.sync(this.localShippingPackageFile);
      }

      console.log(`About to tar ${this.shippingProjectPath}`);
      tarPack.pack(this.shippingProjectPath)
        .pipe(fs.createWriteStream(this.localShippingPackageFile))
        .on('error', (error) => {
          console.log(error.stack);
        })
        .on('close', () => {
          const fileSender = new FileSender(sshConfig);
          fileSender.send(resolve, reject, this.localLoadingDock);
        });
    });
  }
}

export default Deployer;
