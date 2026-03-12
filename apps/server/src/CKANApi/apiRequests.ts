import { baseUrl } from "../web/urlStore";

const getCityDatasets = async () => {
    console.log(await baseUrl())
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

export { getCityDatasets, getDatasetByIdString };
