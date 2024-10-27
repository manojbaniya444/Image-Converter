const JobQueue = require("../jobQueue/queue");
const job = new JobQueue();
const imageProcessingStatus = require("../db/status.json");

const PROCESSING = "processing";

const fs = require("fs").promises;
const path = require("path");
const fsSync = require("fs");

const imageUploadHandler = async (req, res) => {
  const files = req.files;
  const { targetFormat, userUploadId } = req.body;
  console.log(`convert  to ${targetFormat} for token: ${userUploadId}`);

  const imageRootPath = path.join(__dirname, `../storage/raw/${userUploadId}`);

  // push the images to job queue with user token and use that token to get the image after conversion.
  if (!fsSync.existsSync(imageRootPath)) {
    return res.status(500).json({ message: "Internal error" });
  }

  console.log("image path", imageRootPath);

  const imagesName = await fs.readdir(imageRootPath);
  const imagesPathToConvert = imagesName.map((image) => {
    return path.join(__dirname, `../storage/raw/${userUploadId}`, image);
  });

  console.log("images path to convert", imagesPathToConvert);

  const imageConvertJob = {
    imagesPathToConvert,
    targetFormat,
    userUploadId,
  };

  // enqueue the new job to the worker queue
  job.enqueueJob(imageConvertJob);

  // save in database
  imageProcessingStatus.imageStatus.push({
    userUploadId,
    status: PROCESSING,
  });

  // Write the updated status back to the JSON file
  try {
    await fs.writeFile(
      path.join(__dirname, "../db/status.json"),
      JSON.stringify(imageProcessingStatus, null, 2)
    );
  } catch (error) {
    console.log("ERROR: Error on updating status", error);
    return res.status(500).json({ message: "Internal error" });
  }

  res.status(200).json({
    message: "images uploaded to convert please wait to download.",
    token: userUploadId,
  });
};

module.exports = { imageUploadHandler };
