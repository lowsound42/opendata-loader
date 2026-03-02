import { Router, Request, Response } from "express";
import { runPipeLines } from "../../dal/pipelines";
import * as datasetController from "../controllers/datasets.controller";
import path from "path";

const router = Router();

function parseName(name: string) {
  const match = name.match(/^(.+?)_(\d{4}_\d{4})$/);
  if (match) {
    return { base: match[1], period: match[2]!.replace("_", "–") };
  }
  return { base: name, period: "—" };
}

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

router.get("/resources-page", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../public/resources.html"));
});

router.get("/resources", async (req, res) => {
  const { id } = req.query;
  const dataset = await datasetController.getDatasetById(id as string);
  console.log(dataset.result.resources);
  const rows = dataset.result.resources
    .filter((r) => r.datastore_active)
    .map((r) => {
      const { base, period } = parseName(r.name);
      console.log(r.datastore_active);
      const resourceId =
        r.datastore_resource_id && r.datastore_resource_id !== ""
          ? r.datastore_resource_id
          : r.id;
      return `
       <tr class="resource-rows">
         <td class="td-name">${base}</td>
         <td class="td-date">${period}</td>
         <td class="td-record-count">${r.record_count?.toLocaleString() ?? "—"}</td>
         <td class="td-resource-id">${resourceId}</td>
         <td class="td-link"><a href=https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/datastore_search?resource_id=${resourceId}&limit=100&offset=${0}>go</a></td>
       </tr>
     `;
    })
    .join("");
  res.send(rows);
});

router.get("/datasets", async (req: Request, res: Response) => {
  const datasets = await datasetController.getCityDatasets();
  const rows = datasets
    .map(
      (id, i) => `<tr>
          <td>${i + 1}</td>
          <td>
          <a href="/resources-page?id=${id}"><button>${id}</button></a>

          </td>
        </tr>`,
    )
    .join("");
  res.send(`<tbody>${rows}</tbody>`);
});

export default router;
