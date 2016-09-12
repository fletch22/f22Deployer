const shell = require('shelljs');

shell.ls('../*.tar').forEach((file) => {
  console.log('Found file' + file);
  if (shell.exec('echo \'Hello!!!\'').code !== 0) {
    shell.echo('Docker import failed.');
    shell.exit(1);
  }
});
