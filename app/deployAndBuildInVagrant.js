import 'moment-precise-range-plugin';
import path from 'path';
import { Client as SshClient } from 'ssh2';
import Config from './config/config.js';
import RemoteCommandExecutor from './RemoteCommandExecutor';
import Deployer from './Deployer';

const sshConfig = Config.ServerInfo.SshConfig.LocalVagrant;
const projectPath = '/Users/fletch22/workspaces/fletch22Website/';
const localLoadingDock = path.join(__dirname, '../', 'loading-dock');
const appName = 'f22website';
const shippingPackageFileName = `${appName}.tar`;
const localShippingPackageFile = path.join(localLoadingDock, shippingPackageFileName);
const remoteLoadingDockPath = sshConfig.path;
const remoteShippingPackageFilePath = path.join(remoteLoadingDockPath, shippingPackageFileName);

const conn1 = new SshClient();

conn1.on('ready', () => {
  console.log('Command array execution ready ...');

  const dockerComposePath = '/vagrant/workspaces/docker/docker-compose';

  let commands = [
    `cd ${dockerComposePath}; docker-compose stop`,
    `mkdir -p ${sshConfig.loadingDockPath}`,
    `sudo chown -R f22 ${sshConfig.loadingDockPath}`,
    `rm -rf ${sshConfig.loadingDockPath}`,
    `mkdir -p ${sshConfig.path}`
  ];

  const remoteCommandExecutor = new RemoteCommandExecutor(conn1, commands);

  remoteCommandExecutor.execute().then(() => {
    const deployer = new Deployer(localLoadingDock, localShippingPackageFile, projectPath);

    console.log(`RSPFP: ${remoteShippingPackageFilePath}`);

    deployer.deploy().then(() => {
      commands = [
        `cd ${sshConfig.path} && tar -xmf ${remoteShippingPackageFilePath}`,
        'docker rmi -f f22website',
        `cd ${dockerComposePath}; docker-compose rm -f`,
        `cd ${dockerComposePath}; ./dc.sh`
      ];

      new RemoteCommandExecutor(conn1, commands).execute().then(() => {
        conn1.end(); // close parent (and this) connection
      });
    });
  });
}).on('error', (error) => {
  console.log(`Error: ${error.level}: ${error.message}`);
}).on('end', () => {
  console.log('End.');
})
  .connect(sshConfig);




