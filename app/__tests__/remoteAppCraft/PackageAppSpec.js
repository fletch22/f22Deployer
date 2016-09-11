import path from 'path';
import { expect } from 'chai';
import PackageApp from '../../remoteAppCraft/PackageApp';
import tar from 'tar';

describe('Given the PackageAppSpec', () => {
  it('Then it should package an app correctly', () => {

    const folderPath = path.resolve(__dirname, '../../../app/remoteAppCraft/apps/node-install');

    console.log(folderPath);

    const packageApp = new PackageApp(folderPath);

    const outputPath = packageApp.package();

    console.log(outputPath);

    // expect(packageApp).to.equal(true);
  });
});
