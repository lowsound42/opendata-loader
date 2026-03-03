import { Router, Request, Response } from "express";
import { runPipeLines } from "../../dal/pipelines";
import * as datasetController from "../controllers/datasets.controller";
import path from "path";

const router = Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

router.get("/test", async (req: Request, res: Response) => {
  const result = await runPipeLines(
    "tmc_raw_data",
    "811c4c10-7e5d-4c76-8d42-dab4e31c8265",
  );
  res.json(result);
});

router.get("/dataset", async (req, res) => {
  const { id } = req.query;
  const response = await datasetController.getDatasetById(id as string);
  res.send(response);
});

router.get("/fields-page", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../public/fields.html"));
});

router.get("/resources-page", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../public/resources.html"));
});

router.get("/fields", async (req, res) => {
  const { id } = req.query;
  const rows = await datasetController.getDatasetFieldsById(id as string);
  console.log(rows);
  res.send(rows);
});

router.get("/resource", async (req, reply) => {
  const { id } = req.query as { id: string };
  const html = await datasetController.getDatasetById(id);
  reply.type("text/html").send(html);
});

router.get("/datasets", async (req: Request, res: Response) => {
  const rows = await datasetController.getCityDatasets();
  res.send(`<tbody>${rows}</tbody>`);
});

export default router;
