

class RemoteCommandExecutor {

  constructor(connection, commands) {
    this.connection = connection;
    this.commands = commands;
    this.resolve = null;
    this.reject = null;
    this.currentCommandIndex = 0;
  }

  rawCommandExecution() {
    if (this.currentCommandIndex < this.commands.length) {
      this.connection.exec(this.commands[this.currentCommandIndex], (err, stream) => {
        console.log(this.commands[this.currentCommandIndex]);
        if (err) {
          console.log('Exec error: ${err}');
          this.connection.end();
          this.reject();
        }
        stream.on('end', () => {
          if (this.currentCommandIndex !== this.commands.length) {
            this.rawCommandExecution(++this.currentCommandIndex);
          }
        }).on('data', (data) => {
          // console.log(`STDOUT: ${data}`);
          process.stdout.write(data);
        }).stderr.on('data', (data) => {
          // console.log(`STDERR: ${data}`);
          process.stderr.write(data);
        });
      });
    } else {
      console.log('.. Command array execution finished.');
      this.resolve();
    }
  }

  execute() {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.rawCommandExecution();
    });
  }
}

export default RemoteCommandExecutor;
