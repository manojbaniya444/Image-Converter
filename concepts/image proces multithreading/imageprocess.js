const { workerData, parentPort } = require("worker_threads");
const sharp = require("sharp");
const path = require("path");

const resizeImage = async (imagePath, outputSize) => {
  const pathToSave = path.resolve(
    __dirname,
    "output",
    `resized-${path.basename(imagePath)}`
  );

  await sharp(imagePath)
    .resize(outputSize.width, outputSize.height)
    .toFile(pathToSave);

  return pathToSave;
};

resizeImage(workerData.imagePath, workerData.outputSize)
  .then((path) => {
    parentPort.postMessage(`DONE ONE: Image processed find it in: ${path}`);
  })
  .catch((err) =>
    parentPort.postMessage(`ERROR: Error processing image: ${err.message}`)
  );
