import path from 'path';
import { expect } from 'chai';
import PackageApp from '../../remoteAppCraft/PackageApp';

describe('Given the PackageAppSpec', () => {
  it('Then it should package an app correctly', () => {

    const folderPath = path.resolve(__dirname, '../../../app/remoteAppCraft/apps/install-containers');

    console.log(folderPath);

    const packageApp = new PackageApp(folderPath);

    const outputPath = packageApp.package();

    console.log(outputPath);

    // expect(packageApp).to.equal(true);
  });
});
