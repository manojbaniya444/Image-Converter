## Convert Image Format

Can upload multiple files and then convert the images to the desired format. Here only **PNG**, **JPEG** and **WEBP** format is available as target format but can be easily extended.

- Used **sharp.js** for Image Processing.
- Handle batch process for multiple Image Convert.
- Multithreaded batch Image Processing.

## UI
![Image Converter](./Image%20Converter.png)

## Demo Video
https://github.com/user-attachments/assets/6d0baabe-635e-4be4-895b-84e97d49a75a

## Queue based processing

Used when we need to schedule heavy task that needs to be performed turn by turn. Instead of users waiting for the request to resolve we can inform the user that the task has been pushed to the queue and will be notified after completion.

Here I am simulating the queue based processing, that may be useful in some real world scenario.

## 1. Defining the class

Create a `JobQueue` class that has a list of jobs and a currentJob.

```javascript
class JobQueue {
    constructor() {
        this.jobs [];
        this.currentJob = null;
    }
}
```

We will have some methods in the JobQueue class.

The first one is enqueue which simple takes the `job` parameter that is the actual job from the user, enqueue it and the call `executeNext()` method. This method is described later.

```javascript
enqueue(job) {
    // add the job to the queue
    this.jobs.push(job);
    console.log('ADD: ${job} added to the queue')
    // execute the next job after adding the job in the queue
    this.executeNext()
    return;
}
```

Method `executeNext()` simply run the jobQueue by performing as a watchman who looks for the job if there is no current job get one from the queue and then execute it.

But we need to check first if the worker if performing some task or free then only execute next. We can get that info from `currentJob` value that we defined in the constructor().

After dequeue, if the `currentJob` value is still empty then we can assume that all works have been completed and the queue is empty. In this case we are all free.

Otherwise simple call the `execute()` method to execute the job that is in the `currentJob` variable.

```javascript
executeNext() {
    // if there is currently job running, return
    if (this.currentJob) return;

    // if the currentJob is empty then get the next job from the queue
    this.currentJob = this.dequeue();

    // even after dequeue, if the currentJob is empty that means all the jobs are completed.
    if (!this.currentJob) return;

    // else execute the current job
    this.execute(this.currentJob);
}

dequeue() {
    return this.jobs.shift();
}
```

Now all the necessary things are set up and we have a job in the queue, now we need to implement logic for executing the job in the method `execute()`.

This simply perform the actual job here `executeJob()` can be any function which perform the job.

Finally we can set the currentJob to null after completion of the job and call to execute the next job with `executeNext()` method.

```javascript
async execute(job) {
    try {
        // here in our code response is the time that it takes to complete the job
        const response = await executeJob(job);
        console.log("INFO: ${job} completed after ${response}");
    } catch (error) {
        console.log("Some error occured", error)
    }

    // after completing the job set the current job to null and call the executeNext method.
    this.currentJob = null;
    this.executeNext();
}
```

The function `executeJob()` can be any real function that takes long to execute. For the simplicity lets assume it resolves a promise after few seconds.

```javascript
const executeJob = (job) => {
  // simulate the job execution
  const resolveTime = Math.floor(Math.random() * 5000) + 2000;
  return new Promise((resolve, _) =>
    setTimeout(() => resolve(`${resolveTime}`), resolveTime)
  );
};
```

Now our code is ready and ready to test. For this, we create some jobs and see the result.

```javascript
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
```

Here is the result of the execution:

```
ADD: job1 added to the queue
ADD: job2 added to the queue
ADD: job3 added to the queue
INFO: job1 completed after 2225ms
INFO: job2 completed after 6902ms
ADD: job4 added to the queue
INFO: job3 completed after 2257ms
ADD: job5 added to the queue
INFO: job4 completed after 4490ms
INFO: job5 completed after 3696ms
```

Here is the full code:

```javascript
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
```
