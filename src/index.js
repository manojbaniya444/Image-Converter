const express = require("express");
const cors = require("cors");

const apiRoute = require("./routes/api.route");

const app = express();

const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST","OPTIONS"],
  })
);

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api", apiRoute);

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
