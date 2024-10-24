class JobQueue {
  constructor() {
    this.jobs = [];
    this.currentJob = null;
  }

  enqueueJob(job) {
    this.jobs.push(job);
    console.log("New job added to the queue");

    this.executeNextJob();
  }

  dequeueJob() {
    const job = this.jobs.shift();
    return job;
  }

  executeJob(job) {
    // execute the job here
    if (this.currentJob) {
      return;
    }
    // perfrom conversion

    this.currentJob = null;
    this.executeNextJob();
  }

  executeNextJob() {
    if (this.currentJob) {
      return;
    }

    this.currentJob = this.dequeueJob();

    if (!this.currentJob) {
      console.log("All job complete for now");
      return;
    }

    this.executeJob(this.currentJob);
  }
}

module.exports = JobQueue