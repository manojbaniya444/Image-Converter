const formParse = (data, content) => {
  const boundary = content.split("; ")[1].replace("boundary=", "");
  const parts = data.split(`--${boundary}`);

  let fields = {};
  let files = [];

  // Process each part of the multipart/form-data
  parts.forEach((part) => {
    if (part.includes("Content-Disposition: form-data")) {
      const match = /name="(.*)"/.exec(part);
      if (match) {
        const fieldName = match[1];
        const value = part.split("\r\n\r\n")[1].replace(/\r\n--$/, "");

        if (part.includes("filename")) {
          const fileMatch = /filename="(.*)"/.exec(part);
          if (fileMatch) {
            const fileName = fileMatch[1];
            const fileData = Buffer.from(value, "binary");
            files.push({ fileName, fileData });
          }
        } else {
          fields[fieldName] = value;
        }
      }
    }
  });

  return [fields, files];
};

module.exports = formParse;
