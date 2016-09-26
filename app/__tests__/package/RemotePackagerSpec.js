import { expect } from 'chai';
import sinon from 'sinon';
import remotePackager from '../../package/RemotePackager';

describe.only('Given RemotePackager', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('When packApp is called with a good name then it should succeed.', (done) => {
    const testFileSender = sinon.stub(remotePackager, 'getFileSender', () => {
      return {
        send: (resolve) => {
          resolve();
        }
      };
    });

    remotePackager.shuttleFiles()
      .then(() => {
        expect(testFileSender.calledOnce).equals(true);
        done();
      })
      .catch(done);
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
