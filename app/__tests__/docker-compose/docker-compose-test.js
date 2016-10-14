import path from 'path';
import fs from 'fs';
import whiskers from 'whiskers';
import DockerComposeGenerator from '../../templateGenerators/docker-compose/DockerComposeGenerator';

describe('docker-compose', () => {
  it('should create a compose yaml file correctly', () => {
    const template = 'This is a {foo} of the emergency broadcast network ...';
    const context = { foo: 'test' };

    const output = whiskers.render(template, context);

    expect(output).toBeDefined();
    expect('This is a test of the emergency broadcast network ...').toBe(output);
  });

  it('should properly compose the yaml file', () => {
    const dockerComposeGenerator = new DockerComposeGenerator();

    const output = dockerComposeGenerator.generate();

    console.log(output);

    expect(output).toBeDefined();
  });
});
