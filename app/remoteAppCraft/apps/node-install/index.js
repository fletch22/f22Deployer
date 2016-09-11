const shell = require('shelljs');

shell.ls('../*.tar').forEach((file) => {
  console.log('Found file' + file);
  if (shell.exec('docker import').code !== 0) {
    shell.echo('Docker import failed.');
    shell.exit(1);
  }
});
