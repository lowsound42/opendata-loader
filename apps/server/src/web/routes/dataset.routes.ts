import { Router, Request, Response } from "express";
import { runPipeLines } from "../../dal/pipelines";
import * as datasetController from "../controllers/datasets.controller";
import * as homeController from "../controllers/home.controller";
import path from "path";

const datasetRouter = Router();

datasetRouter.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../public/index.html"));
});

datasetRouter.get("/sets", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../public/dataset.html"));
});

datasetRouter.get("/meta", async (req: Request, res: Response) => {
  const meta = await homeController.datasetMeta();
  res.send(meta);
});

datasetRouter.get("/test", async (req: Request, res: Response) => {
  const result = await runPipeLines(
    "tmc_raw_data",
    "811c4c10-7e5d-4c76-8d42-dab4e31c8265",
  );
  res.json(result);
});

datasetRouter.get("/fields-page", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../public/fields.html"));
});

datasetRouter.get("/resources-page", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../public/resources.html"));
});

datasetRouter.post("/create", async (req, res) => {
  const { id, name } = req.body;
  await datasetController.createNewTable(id, name);
  res.send(true);
});

datasetRouter.post("/upload", async (req, res) => {
  const { id, name } = req.body;
  await datasetController.uploadIntoTable(id, name);
  res.send(true);
});

datasetRouter.get("/fields", async (req, res) => {
  const { id, name, acro, schema } = req.query;
  const data = await datasetController.getDatasetFieldsById(
    id as string,
    name as string,
    acro as string,
    schema as string,
  );
  res.send(data);
});

datasetRouter.get("/resource/datastores", async (req, reply) => {
  const { id } = req.query as { id: string };
  const html = await datasetController.getDatastoresById(id);
  reply.type("text/html").send(html);
});

datasetRouter.get("/resource/datafiles", async (req, reply) => {
  const { id } = req.query as { id: string };
  const html = await datasetController.getDatafilesById(id);
  reply.type("text/html").send(html);
});

datasetRouter.get("/datasets", async (req: Request, res: Response) => {
  console.log("start");
  const rows = await datasetController.getCityDatasets();
  res.send(`<tbody>${rows}</tbody>`);
});

export default datasetRouter;
