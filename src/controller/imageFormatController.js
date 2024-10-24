const JobQueue = require("../jobQueue/queue");
const job = new JobQueue();

const fs = require("fs");
const path = require("path");

const imageUploadHandler = (req, res) => {
  (req, res) => {
    const files = req.files;
    const { targetFormat, userUploadId } = req.body;
    console.log(`convert  to ${targetFormat} for token: ${userUploadId}`);

    const imageRootPath = path.join(
      __dirname,
      `../storage/raw/${userUploadId}`
    );

    // push the images to job queue with user token and use that token to get the image after conversion.
    if (!fs.existsSync(imageRootPath)) {
      return res.status(500).json({ message: "Internal error" });
    }

    const imagesPathToConvert = fs
      .readdir(imageRootPath)
      .map((image) =>
        path.join(__dirname, `../storage/raw/${userUploadId}`, image)
      );

    const imageConvertJob = {
      imagesPathToConvert,
      targetFormat,
    };

    // enqueue the new job to the worker queue
    job.enqueueJob(imageConvertJob);

    res
      .status(200)
      .json({ message: "images uploaded to convert.", token: userUploadId });
  };
};

module.exports = { imageUploadHandler };
