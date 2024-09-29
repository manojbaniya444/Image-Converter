const http = require("node:http");
const saveFile = require("./util/saveFile");
const cors = require("./lib/cors");
const formParse = require("./lib/formParser");

const server = http.createServer();

server.on("request", async (request, response) => {
  cors(response);

  if (request.url === "/upload-file" && request.method === "POST") {
    let data = "";
    request.on("data", (chunkData) => {
      data += chunkData;
    });

    request.on("end", async () => {
      const content = request.headers["content-type"];
      const [fields, files] = formParse(data, content);
      saveFile(files);
      response.writeHead(200);
      console.log(fields);
      response.end("file uploaded successfully");
    });
  } else {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Not found" }));
  }
});

server.listen(8080, () => {
  console.log("Server running on port 8080");
});
