import RemoteInstaller from './RemoteInstaller';

const podInfo = {
  containers: [
    { name: 'consul-server-f22' },
    { name: 'nginx-f22' },
    { name: 'registrator-f22' },
    { name: 'webapp-f22' }
  ]
};

new RemoteInstaller(podInfo).install();
