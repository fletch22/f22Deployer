import fs from 'fs';
import path from 'path';

const loadingDockPath = '/home/f22/loading-dock/';
const stagingPath = path.join(loadingDockPath, 'staging');

const Config = {
  ServerInfo: {
    SshConfig: {
      LocalVagrant: {
        host: 'localhost',
        port: '2222',
        username: 'f22',
        loadingDockPath,
        path: stagingPath,
        privateKey: fs.readFileSync('/Users/fletch22/.ssh/remote-deploy', 'utf-8') // Passing as buffer does not work. FileSync is not creating an object recognized as a buffer.
      },
      DigitalOcean: {
        host: '104.236.252.246',
        username: 'fletch22',
        path: '/tmp/bar',
        port: '22',
        privateKey: fs.readFileSync('/Users/fletch22/.ssh/id_rsa', 'utf-8'), // Passing as buffer does not work. FileSync is not creating an object recognized as a buffer.
        forceIPv4: true,
        tryKeyboard: false
      }
    }
  }
};

export default Config;

