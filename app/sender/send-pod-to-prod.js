import FileSender from './FileSender';
import Config from '../config/config';

const sshConfig = Config.ServerInfo.SshConfig.DigitalOcean;

const folderToSend = '/Users/fletch22/workspaces/montreal/workspaces/docker/docker-compose/export/pods';

new Promise((resolve, reject) => {
  console.log('About to send ...');
  const fileSender = new FileSender(sshConfig);
  fileSender.send(resolve, reject, folderToSend);
})
.then(() => {
  console.log('Success!');
})
.catch((error) => {
  console.error(error.stack);
});

