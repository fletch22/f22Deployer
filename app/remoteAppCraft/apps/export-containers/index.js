var shell = require('shelljs');

shell.echo('About to start Docker container export...');

shell.ls('../../').forEach(function (file) {
  console.log('Found file ' + file + '. Will now try to import file.');

  var cmdDocker = ''; // import
  if (shell.exec('' + file).code !== 0) {
    shell.echo('Docker import failed.');
  }
});

console.log('xXXXXXX xxxxxX  xXXXXXXX');

