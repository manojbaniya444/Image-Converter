const fs = require("node:fs/promises");
const path = require("node:path");

const saveFile = async (files) => {
  // Save multiple files
  for (const file of files) {
    const filePath = path.join(__dirname, "../uploads", file.fileName);
    await fs.writeFile(filePath, file.fileData);
    console.log(`File saved successfully: ${file.fileName}`);
  }
};

module.exports = saveFile
