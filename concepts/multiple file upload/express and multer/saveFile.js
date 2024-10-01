const fs = require("fs");

const saveFile = (file) => {
  fs.writeFile("/", file);
};

export default saveFile;
