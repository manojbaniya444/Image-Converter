const express = require("express");
const cors = require("cors");

const apiRoute = require("./routes/api.route");

const app = express();

const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://127.0.0.1:5500",
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api", apiRoute);

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
