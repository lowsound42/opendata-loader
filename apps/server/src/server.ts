import express, { Application } from "express";
import datasetRouter from "./web/routes/dataset.routes";
import configRouter from "./web/routes/config.routes";
import loadConfig from "./config";
import cors from "cors";
import path from "path";

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

app.use(datasetRouter);
app.use(configRouter)
app.listen(Number(loadConfig().PORT), "0.0.0.0", () => {
  console.log(`Ahoy Cap'n, we be on port ${loadConfig().PORT}`);
});
