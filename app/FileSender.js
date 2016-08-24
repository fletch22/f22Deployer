import scp2, { Client } from 'scp2';
import moment from 'moment';
import 'moment-precise-range-plugin';
import { Spinner } from 'cli-spinner';

class FileSender {

  constructor(sshConfig) {
    this.sshConfig = JSON.parse(JSON.stringify(sshConfig));
    this.client = new Client(this.sshConfig);
  }

  send(resolve, reject, folderWithContentsToSend) {
    const start = moment();

    let spinner = new Spinner('Connecting %s    ');
    spinner.setSpinnerString(0);
    spinner.start();

    console.log('Beginning deploy ...');

    this.client.on('connect', () => {
      spinner.stop(true);
      console.log('SCP Connected.');
      spinner = new Spinner('Deploying files %s        ');
      spinner.setSpinnerString(18);
      spinner.start();
    });

    this.client.on('read', () => {
      console.log('Read fired.');
    });

    this.client.on('error', (error) => {
      console.log('Encountered error.');
      console.log(error.message);

      reject(error);
    });

    this.client.on('close', () => {
      spinner.stop(true);
      const end = moment();

      console.log('Closing connection.');
      console.log(`Deploy operation took ${moment.preciseDiff(start, end)}.`);

      resolve();
    });

    console.log(`Preparing to SCP '${folderWithContentsToSend}' to '${this.sshConfig.path}'.`);
    scp2.scp(folderWithContentsToSend, this.sshConfig, this.client, this.responseHandler);
  }

  responseHandler(response) {
    if (response) {
      console.log(response.message);
    }
  }
}

export default FileSender;
