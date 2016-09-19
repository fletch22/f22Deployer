import fs from 'fs';

class FileSystem {

  expectExists(resourcePath) {
    if (!fs.existsSync(resourcePath)) {
      throw new Error(`Was trying to find '${resourcePath}' but could not find it.`);
    }
  }
}

export default new FileSystem();
