const { Worker } = require("worker_threads");
const path = require("path");

const runWorker = (imagesPath, targetImageFormat, userUploadId) => {
  return new Promise((resolve, reject) => {
    const workerPath = path.join(__dirname, "../worker/imageConvert.js");

    const worker = new Worker(workerPath, {
      workerData: {
        imagesPath,
        targetImageFormat,
        userUploadId,
      },
    });

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
    console.log("INFO: Executing job", job);
    // perfrom conversion
    const { imagesPathToConvert, targetFormat, userUploadId } = job;
    try {
      console.log("INFO: Running worker thread for job");
      await runWorker(imagesPathToConvert, targetFormat, userUploadId);
    } catch (error) {
      console.log("ERROR: Error on executing job", error);
    }
    this.currentJob = null;
    this.executeNextJob();
  }

  executeNextJob() {
    console.log("INFO: Executing next job", this.jobs);
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
