const base_url = "https://ckan0.cf.opendata.inter.prod-toronto.ca/";
const getCityDatasets = async () => {
  const response = fetch(`${base_url}/api/3/action/package_list`, {
    method: "GET",
  });
  return response;
};

const getDatasetByIdString = async (id: string) => {
  const response = fetch(`${base_url}api/3/action/package_show?id=${id}`, {
    method: "GET",
  });
  return response;
};

export { getCityDatasets, getDatasetByIdString };
