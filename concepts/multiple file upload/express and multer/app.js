const express = require("express");
const CORS = require("./corsResolve");
const multer = require("multer");
const fs = require("node:fs/promises");
const path = require("node:path");
const http = require("node:http");

const httpServer = http.createServer((request, response) => {
  CORS(response);
});

const app = express(httpServer);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "storage/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.originalname);
  },
});
// const upload = multer({ dest: "storage/" });
const upload = multer({ storage });

app.get("/", (request, response) => {
  return response.status(200).json({ message: "response of get" });
});

app.post("/student-register", upload.single("avatar"), (request, response) => {
  // request.file is the avatar file
  // request.body will hold the text field, if there are any
  const { fieldname, originalname, filename, size } = request.file;
  const { name, age } = request.body;
  console.log(name, age, filename);
  return response.sendStatus(200);
});

// max file 5, error if more than 5 but accept less than 5 files need to send file as 'files' form data
app.post("/assignment", upload.array("files", 5), (request, response) => {
  // request.files is array of files
  // request.body contain normal data if any
  console.log(request.files);
  return response.status(200).send({ message: "sucessfully received files." });
});

app.listen(8080, () => {
  console.log("server running port 8080");
});
