const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const server = http.createServer();

server.on("request", async (request, response) => {
  // CORS headers
  response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  if (request.url === "/upload-file" && request.method === "POST") {
    let data = "";
    request.on("data", (chunkData) => {
      data += chunkData;
    });

    request.on("end", async () => {
      try {
        const boundary = request.headers["content-type"]
          .split("; ")[1]
          .replace("boundary=", "");
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

        // Save multiple files
        for (const file of files) {
          const filePath = path.join(__dirname, "uploads", file.fileName);
          await fs.writeFile(filePath, file.fileData);
          console.log(`File saved successfully: ${file.fileName}`);
        }

        console.log("Form fields:", fields);
        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("Files received and saved to the server.");
      } catch (err) {
        console.error("Error processing upload:", err);
        response.writeHead(500, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ message: "Error uploading files" }));
      }
    });
  } else {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Not found" }));
  }
});

server.listen(8080, () => {
  console.log("Server running on port 8080");
});
