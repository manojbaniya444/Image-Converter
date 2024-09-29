const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const server = http.createServer();

server.on("request", (request, response) => {
  // CORS
  response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
  response.setHeader("Access-Control-Allow-Methods", "GET", "POST");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  if (request.url === "/upload-file" && request.method === "POST") {
    let data = "";

    request.on("data", (chunkData) => {
      data = data + chunkData;
    });

    request.on("end", () => {
      const boundary = request.headers["content-type"]
        .split("; ")[1]
        .replace("boundary=", "");
      const parts = data.split(`--${boundary}`);

      let fields = {};
      let fileData = null;
      let nameofFile = "";

      parts.forEach((part) => {
        if (part.includes("Content-Disposition: form-data")) {
          const match = /name="(.*)"/.exec(part);
          if (match) {
            const fieldName = match[1];
            const value = part.split("\r\n\r\n")[1].replace(/\r\n--$/, "");

            if (part.includes("filename")) {
              const fileMatch = /filename="(.*)"/.exec(part);
              if (fileMatch) {
                nameofFile = fileMatch[1];
                fileData = Buffer.from(value, "binary");
              }
            } else {
              fields[fieldName] = value;
            }
          }
        }
      });

      if (fileData && nameofFile) {
        const filePath = path.join(__dirname, nameofFile);
        fs.writeFile(filePath, fileData);
        console.log("file saved successfully");
      }

      console.log("Form fields: ", fields);

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ message: "File received successfully." }));
    });

    console.log("Upload file route");
  } else {
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Not found any data." }));
  }
});

server.listen(8080, () => {
  console.log("server running port 8080");
});
