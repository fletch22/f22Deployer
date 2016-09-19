import tar from 'tar';
import fstream from 'fstream';
import fs from 'fs';
import path from 'path';
import del from 'del';
import logger from '../logging/Logger';

class PackApp {

  constructor(folderPath, outputFolderPath) {
    this.folderPath = folderPath;
    this.stagingPath = outputFolderPath;
    // this.cleanStagingFolder();
  }

  cleanApp() {
    const globPath = path.join(this.folderPath, 'node_modules', '**'); // Remove folder
    del.sync([globPath]);
  }

  pack() {
    this.cleanApp();

    const outputPath = path.join(this.stagingPath, `${path.basename(this.folderPath)}.tar`);

    const dirDest = fs.createWriteStream(outputPath);

    logger.info(outputPath);

    // This must be a "directory"
    return new Promise((resolve, reject) => {
      function onError(err) {
        console.error('An error occurred:', err);
        reject(err);
      }

      function onEnd() {
        console.log(`Tarring file/directory complete. See ${outputPath}`);
        resolve(outputPath);
      }

      const packer = tar.Pack({ noProprietary: true })
        .on('error', onError)
        .on('end', onEnd);

      fstream.Reader({path: this.folderPath, type: 'Directory'})
        .on('error', onError)
        .pipe(packer)
        .pipe(dirDest);
    });
  }
}

export default PackApp;
