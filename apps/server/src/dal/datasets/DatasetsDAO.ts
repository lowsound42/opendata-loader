import {
  getCityDatasets,
  getDatasetByIdString,
} from "../../CKANApi/apiRequests";
import {
  Data,
  DataResult,
  DataSets,
  ResourceArray,
} from "../../core/datasets/Dataset";

const getDataSetsFromCKAN = async () => {
  const response = await getCityDatasets();
  const { result } = (await response.json()) as DataSets;
  console.log(result);
  return result;
};

const getDatasetMetaById = async (id: string) => {
  const response = await getDatasetByIdString(id);
  const result = (await response.json()) as ResourceArray;
  return result;
};

export { getDataSetsFromCKAN, getDatasetMetaById };
