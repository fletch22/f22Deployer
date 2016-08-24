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
        privateKey: fs.readFileSync('/Users/fletch22/.ssh/remote-deploy')
      },
      host: '104.236.252.246',
      DigitalOcean: {
        port: '22',
        username: 'fletch22',
        password: 'iwaglmlah'
      }
    }
  }
};

export default Config;

