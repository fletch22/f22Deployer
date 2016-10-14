import FileSender from './FileSender';
import Config from '../config/config';

const sshConfig = Config.ServerInfo.SshConfig.DigitalOcean;

class PodSender {

  constructor() {
    this.folderToSend = Config.podPath.local; // /Users/fletch22/workspaces/montreal/workspaces/docker/docker-compose/export/staging/pod
  }

  send() {
    new Promise((resolve, reject) => {
      console.log(`About to send ${this.folderToSend} ...`);
      const fileSender = new FileSender(sshConfig);
      fileSender.send(resolve, reject, this.folderToSend);
    })
      .then(() => {
        console.log('Success!');
      })
      .catch((error) => {
        console.error(error.stack);
      });
  }
}

export default PodSender;
