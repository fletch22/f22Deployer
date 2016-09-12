import { expect } from 'chai';
import remotePackager from '../../package/RemotePackager';

describe('Given RemotePackager', () => {

  // it('When usherAppToStagin is called the files get copied to staging folder', () => {
  //
  //   remotePackager.stagingPath = path.join(__dirname, 'tmp');
  //   remotePackager.usherAppsToStaging();
  //
  // });

  it('When packApp is called with a good name then it should succeed.', () => {

    remotePackager.prepApp('install-containers');

  });

  it('When packApp is called with a bad name Then it should fail.', () => {

    let wasThrown = false;
    try {
      remotePackager.prepApp('');
    } catch (error) {
      wasThrown = true;
    }

    expect(wasThrown).to.equal(true);
  });

  it('When packApp is called with a non-existent name Then it should fail.', () => {

    let wasThrown = false;
    try {
      remotePackager.prepApp('foo');
    } catch (error) {
      wasThrown = true;
    }

    expect(wasThrown).to.equal(true);
  });
});
