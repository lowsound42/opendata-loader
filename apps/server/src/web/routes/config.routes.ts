import { Router } from "express";
import * as configController   from "../controllers/config.controller";

const configRouter = Router();

configRouter.get("/base-url", async (req, res) => {
    const baseUrl = await configController.getUrl();
    console.log(baseUrl)
  res.send(baseUrl);
});

configRouter.post("/set-base-url", async (req, res) => {
  const { id, url } = JSON.parse(req.body.data);
  await configController.setUrl(url, id);
  res.send(true);
});

configRouter.get("/base-url-options", async (req, res) => {
    const sources = await configController.getCkanSources();
    res.send(sources);
});

export default configRouter
