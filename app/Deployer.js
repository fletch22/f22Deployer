import config from './config/config';
import FileSender from './FileSender';
import tarPack from 'tar-pack';
import pathExists from 'path-exists';
import del from 'delete';
import fs from 'fs';

const sshConfig = config.ServerInfo.SshConfig.LocalVagrant;

// const PodInstallationManual = {
//   PreTransferScripts: [
//     `sudo chown -R f22 ${sshConfig.loadingDockPath}`,
//     `rm -rf ${sshConfig.loadingDockPath}`,
//     `mkdir -p ${sshConfig.path}`
//   ],
//   TransferDetails: {
//     loadingDock: {
//       path: '',
//       folderToCreate: ''
//     }
//   },
//   PostTransferScripts: [
//     `cd ${sshConfig.path} && tar -xmf ${destTarPath}`,
//     'docker rmi -f f22website',
//     'docker rm -f f22website',
//     `cd ${destExtracted} && source ./build.sh`,
//     `cd ${destExtracted} && source ./run.sh`
//   ]
// };

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
