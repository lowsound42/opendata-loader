import { baseUrl } from "../web/urlStore";

const getDatasets = async () => {
  const response = fetch(`${await baseUrl()}/api/3/action/package_list`, {
    method: "GET",
  });
  return response;
};

const getDatasetByIdString = async (id: string) => {
  const response = fetch(`${await baseUrl()}/api/3/action/package_show?id=${id}`, {
    method: "GET",
  });
  return response;
};

export { getDatasets, getDatasetByIdString };
