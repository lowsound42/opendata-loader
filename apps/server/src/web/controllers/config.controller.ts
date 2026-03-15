import {
  getBaseUrl,
  setBaseUrl,
  getAllSources,
} from "../../dal/config/ConfigDAO";

const getUrl = async (): Promise<string> => {
  return await getBaseUrl();
};

const setUrl = async (url: string, id: string): Promise<string> => {
  return await setBaseUrl(url, id);
};

const getCkanSources = async (): Promise<string> => {
  const rows = await getAllSources();
  const options = rows
    .map((row) => `<option value='${JSON.stringify(row)}'>${row.url}</option>`)
    .join("");
  return options;
};

export { getUrl, setUrl, getCkanSources };
