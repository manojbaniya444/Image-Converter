const { Worker } = require("node:worker_threads");
const path = require("node:path");
const fs = require("node:fs");

const runWorker = (imagePath, outputSize) => {
  return new Promise((resolve, reject) => {
    // creating a new worker per image
    const worker = new Worker(path.resolve(__dirname, "imageprocess.js"), {
      workerData: { imagePath, outputSize },
    });

    worker.on("message", (message) => {
      console.log(message);
      resolve();
    });
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`EXIT: Worker stop with exit code ${code}`));
      }
    });
  });
};

const resizeImage = async (imagesPath, outputSize) => {
  const promises = imagesPath.map((imagePath) =>
    runWorker(imagePath, outputSize)
  );
  await Promise.all(promises);
};

// get all the images path from images folder
const imagesPath = fs
  .readdirSync(path.resolve(__dirname, "images"))
  .map((image) => path.resolve(__dirname, "images", image));

const outputSize = {
  width: 200,
  height: 200,
};

console.log("START: Resizing start...");
resizeImage(imagesPath, outputSize).then(() => {
  console.log("COMPLETE: All images resized successfully");
});
console.log("RUNNING: Resizing images...");
// console.log(imagesPath);

// console.log(path.resolve(__dirname, "images"));
// D:\My Media Converter\concepts\image proces multithreading\images

// console.log(__dirname)
// D:\My Media Converter\concepts\image proces multithreading

// console.log(path.join(__dirname, "images"));
// D:\My Media Converter\concepts\image proces multithreading\images

// instead of thread per image we can use thread pool.
// or can use batching for performance of using async.
