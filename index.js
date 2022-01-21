require("dotenv").config();
const router = require("./src/routes");
const express = require("express");

const app = express();
const PORT = 3030;

app.use(express.json());

app.use("/api/v1/", router);

app.listen(PORT, () => console.log(`Listenin on port: ${PORT}`));
