const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const {
  imageUploadHandler,
  downloadImagesPathHandler,
  downloadImage,
  checkStatus,
} = require("../controller/imageFormatController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userUploadId = req.headers.useruploadid;
    // create a new folder.
    if (
      !fs.existsSync(path.join(__dirname, `../storage/raw/${userUploadId}`))
    ) {
      fs.mkdirSync(path.join(__dirname, `../storage/raw/${userUploadId}`));
    }
    cb(null, path.join(__dirname, `../storage/raw/${userUploadId}`));
  },
  filename: function (req, file, cb) {
    const filename = file.originalname.split(".")[0];
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, filename + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post("/upload-images", upload.array("photos", 5), imageUploadHandler);

router.post("/download-images-path", downloadImagesPathHandler);

router.post("/download-image", downloadImage);

router.post("/check-status", checkStatus);

module.exports = router;
