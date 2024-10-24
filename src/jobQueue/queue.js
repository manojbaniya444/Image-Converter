const { Worker } = require("worker_threads");
const path = require("path");

const runWorker = (imagesPath, targetFormat) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      path.join(__dirname, "../worker/imageConvert.js", {
        WorkerData: {
          imagesPath,
          targetFormat,
        },
      })
    );
    worker.on("error", (error) => {
      console.log("ERROR: Error on worker thread: ", error);
      reject(error);
    });
    worker.on("message", (message) => {
      console.log(message);
      resolve();
    });
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`INFO: Worker thread exit with code ${code}`));
      }
    });
  });
};

class JobQueue {
  constructor() {
    this.jobs = [];
    this.currentJob = null;
  }

  enqueueJob(job) {
    this.jobs.push(job);
    console.log("INFO: New job added to the queue");

    this.executeNextJob();
  }

  dequeueJob() {
    const job = this.jobs.shift();
    return job;
  }

  async executeJob(job) {
    // execute the job here
    if (this.currentJob) {
      return;
    }
    // perfrom conversion
    const { imagesPathToConvert, targetFormat } = job;
    try {
      await runWorker(imagesPathToConvert, targetFormat);
    } catch (error) {
      console.log("ERROR: Error on executing job", error);
    }
    this.currentJob = null;
    this.executeNextJob();
  }

  executeNextJob() {
    if (this.currentJob) {
      return;
    }

    this.currentJob = this.dequeueJob();

    if (!this.currentJob) {
      console.log("INFO: All job complete for now");
      return;
    }

    this.executeJob(this.currentJob);
  }
}

module.exports = JobQueue;
