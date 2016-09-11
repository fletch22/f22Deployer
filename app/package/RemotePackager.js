import 'moment-precise-range-plugin';
import path from 'path';
import { Client as SshClient } from 'ssh2';
import Config from '../config/config.js';
import RemoteCommandExecutor from '../RemoteCommandExecutor';

class RemotePackager {

  constructor() {
    this.sshConfig = Config.ServerInfo.SshConfig.LocalVagrant;
    this.dockerComposePath = '/vagrant/workspaces/docker/docker-compose';
    this.exportPath = path.join(this.dockerComposePath, 'export');
    this.staging = path.join(this.exportPath, 'staging');
  }

  package() {
    const conn1 = new SshClient();

    conn1.on('ready', () => {
      console.log('Command array execution ready ...');

      const podPath = path.join(this.exportPath, 'pods');
      const commands = [
        // `cd ${this.exportPath}; sudo ./e.sh`,
        `sudo cp ${this.dockerComposePath}/docker-compose.yml ${this.staging}`, // Copy docker-compose.yml to staging
        'echo \'Done copying.\'', // Copy apps (if any) to staging
        `ls ${podPath} -l`
      ];

      const remoteCommandExecutor = new RemoteCommandExecutor(conn1, commands);

      remoteCommandExecutor.execute().then(() => {
        conn1.end(); // close parent (and this) connection
      });
    }).on('error', (error) => {
      console.log(`Error: ${error.level}: ${error.message}`);
    }).on('end', () => {
      console.log('End.');
    })
      .connect(this.sshConfig);
  }
}

export default new RemotePackager();




