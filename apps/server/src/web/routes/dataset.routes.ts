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

router.get("/datasets", async (req: Request, res: Response) => {
  const datasets = await datasetController.getCityDatasets();
  const rows = datasets
    .map(
      (id, i) => `<tr>
          <td>${i + 1}</td>
          <td>
            <button hx-get="/dataset?id=${id}" hx-target="#datasets" hx-push-url="/dataset?id=${id}">
              ${id}
            </button>
          </td>
        </tr>`,
    )
    .join("");
  res.send(`<tbody>${rows}</tbody>`);
});

export default router;
