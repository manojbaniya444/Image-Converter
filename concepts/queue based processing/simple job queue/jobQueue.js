const { executeJob } = require("./worker");

class JobQueue {
  constructor() {
    this.jobs = [];
    this.currentJob = null;
  }

  enqueue(job) {
    // add the job to the queue
    this.jobs.push(job);
    console.log(`ADD: ${job} added to the queue`);

    // execute the next job after queuing the job in the queue.
    this.executeNext();
    return;
  }

  dequeue() {
    // get the job at the front.
    return this.jobs.shift();
  }

  async execute(job) {
    // execute the job
    try {
      const response = await executeJob(job);
      console.log(`INFO: ${job} completed after ${response}ms`);
    } catch (error) {
      console.log(`INFO: ${job} failed with error: ${error}`);
    }
    // after completing the job set the current job to null and execute the next job
    this.currentJob = null;
    this.executeNext();
  }

  executeNext() {
    // if there is currently job running, return
    if (this.currentJob) {
      return;
    }

    // if there is no job currently running, get the next job from the queue
    this.currentJob = this.dequeue();

    // if there is no job in the queue, return
    if (!this.currentJob) {
      return;
    }

    // else execute the current job
    this.execute(this.currentJob);
  }
}

const jobQueue = new JobQueue();
jobQueue.enqueue("job1");
jobQueue.enqueue("job2");
jobQueue.enqueue("job3");

setTimeout(() => {
  jobQueue.enqueue("job4");
}, 10000);

setTimeout(() => {
  jobQueue.enqueue("job5");
}, 13000);
