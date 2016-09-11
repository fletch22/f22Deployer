import 'moment-precise-range-plugin';
import path from 'path';
import { Client as SshClient } from 'ssh2';
import RemoteCommandExecutor from '../RemoteCommandExecutor';
import Config from '../config/config';

class RemoteInstaller {

  constructor(podInfo) {
    this.sshConfig = Config.ServerInfo.SshConfig.DigitalOcean;
    this.remotePath = path.join(this.sshConfig.path, 'pods');

    console.log(`Got this far....${podInfo.containers.length}`);
    this.podInfo = podInfo;
  }

  install() {
    const conn1 = new SshClient();

    conn1.on('ready', () => {
      console.log('Command array execution ready ...');

      const commands = [
        // `ls ${this.sshConfig.path}/staging`,
        // `cd ${this.sshConfig.path}; rm -rf staging`,
        // `cd ${this.sshConfig.path}; tar xf pod.tar.gz`,
        `ls ${this.sshConfig.path}/staging`
        // 'docker rmi consul-server-f22',
        // `cd ${this.sshConfig.path}/staging; cat consul-server-f22.tar | docker import - consul-server-f22:latest`,

      ];

      this.podInfo.containers.forEach((container) => {
        commands.push(`cd ${this.sshConfig.path}/staging; cat ${container.name}.tar | docker import - ${container.name}:latest`);
      });

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

export default RemoteInstaller;
