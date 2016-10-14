import whiskers from 'whiskers';
import path from 'path';
import fs from 'fs';
import Config from '../../config/config.js';

class DockerComposeGenerator {

  constructor() {
    this.context = {
      consulSharedDataPath: path.join(Config.ServerInfo.SshConfig.DigitalOcean.sharedDataPath, 'consul', 'data')
    };
  }

  generate() {
    const filepath = path.resolve(__dirname, '../../../app/templateGenerators/docker-compose/', 'docker-compose.yml.template');
    const template = fs.readFileSync(filepath);

    return whiskers.render(template, this.context);
  }
}

export default DockerComposeGenerator;
