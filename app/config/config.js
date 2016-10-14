import fs from 'fs';
import path from 'path';

const loadingDockPath = '/home/f22/loading-dock/';
const stagingPath = path.join(loadingDockPath, 'staging');

const stagingFolderName = 'staging';
const vagrantMontrealVolumeShareRoot = '/vagrant';
const localMontrealRoot = '/Users/fletch22/workspaces/montreal';
const relativeDockerComposePath = 'workspaces/docker/docker-compose';
const relativeExportPath = path.join(relativeDockerComposePath, 'export');

const localStagingPath = path.join(localMontrealRoot, relativeExportPath, stagingFolderName);

const appsFolderName = 'apps';
const localExportAppsPath = path.join(localStagingPath, appsFolderName);

const podFolderName = 'pod';
const localPodPath = path.join(localStagingPath, podFolderName);

const dockerComposePath = path.join(vagrantMontrealVolumeShareRoot, relativeDockerComposePath);
const vagrantMontrealExportPath = path.join(vagrantMontrealVolumeShareRoot, relativeExportPath);
const vagrantMontrealStagingPath = path.join(vagrantMontrealExportPath, stagingFolderName);
const vagMontPodPath = path.join(vagrantMontrealStagingPath, podFolderName);

const vagMontStagAppsPath = path.join(vagrantMontrealStagingPath, appsFolderName);

const Config = {
  podName: 'pod.tar.gz',
  localStagingPath,
  localExportAppsPath,
  dockerComposePath,
  vagrantMontrealExportPath,
  vagrantMontrealStagingPath,
  vagMontStagAppsPath,
  vagMontPodPath,
  podPath: {
    local: localPodPath,
    remote: vagMontPodPath
  },
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
        path: '/home/fletch22/loading-dock/',
        port: '22',
        privateKey: fs.readFileSync('/Users/fletch22/.ssh/id_rsa', 'utf-8'), // Passing as buffer does not work. FileSync is not creating an object recognized as a buffer.
        forceIPv4: true,
        tryKeyboard: false,
        sharedDataPath: '/var/docker-data'
      }
    }
  }
};

export default Config;

