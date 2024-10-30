const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const { imageUploadHandler } = require("../controller/imageFormatController");

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
router.post("/download-images-path", (req, res) => {
  const { token } = req.body;
  const filePath = path.join(__dirname, `../storage/new/${token}`);
  const isExist = fs.existsSync(filePath);

  if (!isExist) {
    return res.status(404).json({ message: "Images path not found" });
  }

  const allImagesName = fs.readdirSync(filePath);
  const allImagesPath = allImagesName.map((image) => {
    return path.join(__dirname, `../storage/new/${token}`, image);
  });
  res.json({
    message: "Images path",
    imagesPath: allImagesPath,
    allImagesName,
  });
});

router.post("/download-image", (req, res) => {
  const { token, filename } = req.body;
  console.log("Request download : ", token, filename);

  const filePath = path.join(__dirname, `../storage/new/${token}/${filename}`);

  const isPathExist = fs.existsSync(filePath);

  if (!isPathExist) {
    return res.status(404).json({ message: "Image not found" });
  }

  res.download(filePath, (error) => {
    if (error) {
      console.log("Error downloading the file: ", error);
      res.status(500).json({ message: "Error downloading the file" });
    }
  });
});

module.exports = router;
