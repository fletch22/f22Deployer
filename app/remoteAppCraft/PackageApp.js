import tar from 'tar';
import fstream from 'fstream';
import fs from 'fs';
import path from 'path';
import del from 'del';

class PackageApp {

  constructor(folderPath) {
    this.folderPath = folderPath;
    this.stagingPath = path.resolve(this.folderPath, '../../staging');
  }

  cleanStagingFolder() {
    const globPath = path.join(this.stagingPath, '*');
    del.sync([globPath]);
  }

  cleanApp() {
    const globPath = path.join(this.folderPath, 'node_modules', '**');
    del.sync([globPath]);
  }

  package() {
    this.cleanStagingFolder();

    const outputPath = path.join(this.stagingPath, `${path.basename(this.folderPath)}.tar`);

    const dirDest = fs.createWriteStream(outputPath);

    function onError(err) {
      console.error('An error occurred:', err);
    }

    function onEnd() {
      console.log('Packed!');
    }

    const packer = tar.Pack({ noProprietary: true })
      .on('error', onError)
      .on('end', onEnd);

    // This must be a "directory"
    fstream.Reader({ path: this.folderPath, type: 'Directory' })
      .on('error', onError)
      .pipe(packer)
      .pipe(dirDest);

    return outputPath;
  }
}

export default PackageApp;
