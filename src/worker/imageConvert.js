const { parentPort, workerData } = require("worker_threads");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runImageConversion = async (
  imagesPath,
  targetImageFormat,
  userUploadId
) => {
  console.log("INFO: Running image conversion process for images: ");

  fs.mkdirSync(path.join(__dirname, `../storage/new/${userUploadId}`));

  for (const pathImage of imagesPath) {
    // artificial delay to simulate image conversion process longer
    await delay(2000);
    if (!fs.existsSync(pathImage)) {
      console.log(`ERROR: File not found: ${pathImage}`);
      continue;
    }
    const imageName = path.parse(pathImage).name;

    const outputPath = path.join(
      __dirname,
      `../storage/new/${userUploadId}`,
      `${imageName}.${targetImageFormat}`
    );

    try {
      await sharp(pathImage).toFormat(targetImageFormat).toFile(outputPath);
      console.log(`INFO: Image converted: ${pathImage}`);
    } catch (error) {
      console.log(`ERROR: Error on converting image: ${pathImage}`, error);
      try {
        if (fs.existsSync(outputPath)) {
          fs.rmdirSync(outputPath);
        }
      } catch (error) {
        console.log(
          `ERROR: Error on deleting converted image: ${outputPath} ${error}`
        );
      }
    }
  }

  parentPort.postMessage({
    message: "All images converted successfully",
    userUploadId,
  });
};

runImageConversion(
  workerData.imagesPath,
  workerData.targetImageFormat,
  workerData.userUploadId
);
