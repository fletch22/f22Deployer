const shell = require('shelljs');

// shell.ls('../../*.tar').forEach((file) => {
//   console.log('Found file' + file);
//   if (shell.exec('echo \'Hello!!!\'').code !== 0) {
//     shell.echo('Docker import failed.');
//     shell.exit(1);
//   }
// });

shell.echo('About to start Docker container import...');

// shell.ls('../../').forEach(function (file) {
//   console.log('Found file ' + file + '. Will now try to import file.');
//
//   var cmdDocker = ''; // import
//   if (shell.exec('' + file).code !== 0) {
//     shell.echo('Docker import failed.');
//   }
// });

// shell.ls('*.*').forEach((file) => {
//   console.log('Found file ');
// });
