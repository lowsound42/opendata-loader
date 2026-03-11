import { getBaseUrl } from "./baseUrl";

const getCityDatasets = async () => {
  const response = fetch(`${getBaseUrl()}/api/3/action/package_list`, {
    method: "GET",
  });
  return response;
};

const getDatasetByIdString = async (id: string) => {
  const response = fetch(`${getBaseUrl()}/api/3/action/package_show?id=${id}`, {
    method: "GET",
  });
  return response;
};

export { getCityDatasets, getDatasetByIdString };
